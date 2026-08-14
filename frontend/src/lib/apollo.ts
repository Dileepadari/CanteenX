/**
 * Apollo client.
 *
 * Adds the things the previous client had none of: a CSRF header, 401 handling
 * that refreshes and retries once, a retry link for transient network failures,
 * a WebSocket split for subscriptions, and cache type policies.
 */
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
  split,
  type FetchResult,
  type Operation,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const GRAPHQL_PATH = import.meta.env.VITE_GRAPHQL_ENDPOINT ?? "/api/graphql";
const HTTP_URI = `${API_URL}${GRAPHQL_PATH}`;

function wsUri(): string {
  const base = API_URL || window.location.origin;
  return `${base.replace(/^http/, "ws")}${GRAPHQL_PATH}`;
}

/** Read the CSRF cookie. It is deliberately not httpOnly so we can echo it. */
function readCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

const csrfLink = new ApolloLink((operation, forward) => {
  const token = readCsrfToken();
  if (token) {
    operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
      headers: { ...headers, "x-csrf-token": token },
    }));
  }
  return forward(operation);
});

const httpLink = new HttpLink({
  uri: HTTP_URI,
  credentials: "include",
});

const retryLink = new RetryLink({
  delay: { initial: 300, max: 3000, jitter: true },
  attempts: {
    max: 3,
    retryIf: (error, operation) => {
      // Never blind-retry a mutation: a retried `placeOrder` can create two
      // orders. Only idempotent reads are safe here.
      const definition = getMainDefinition(operation.query);
      const isQuery =
        definition.kind === "OperationDefinition" && definition.operation === "query";
      return Boolean(error) && isQuery;
    },
  },
});

// --- 401 -> refresh -> retry -------------------------------------------------
// A single in-flight refresh shared by every operation that 401s at once,
// otherwise a page issuing six queries fires six refreshes and the rotation
// logic on the server treats five of them as token reuse.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const token = readCsrfToken();
  try {
    const response = await fetch(HTTP_URI, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-csrf-token": token } : {}),
      },
      body: JSON.stringify({
        query: `mutation RefreshSession { refreshSession { csrfToken user { id } } }`,
      }),
    });
    const payload = (await response.json()) as {
      data?: { refreshSession?: unknown };
      errors?: unknown[];
    };
    return Boolean(payload.data?.refreshSession) && !payload.errors;
  } catch {
    return false;
  }
}

function isUnauthenticated(operation: Operation, errors?: readonly unknown[]): boolean {
  if (operation.operationName === "RefreshSession") return false;
  return (errors ?? []).some(
    (error) =>
      (error as { extensions?: { code?: string } })?.extensions?.code ===
      "unauthenticated",
  );
}

const authRecoveryLink = onError(({ graphQLErrors, operation, forward }) => {
  if (!isUnauthenticated(operation, graphQLErrors)) return;

  return new Observable<FetchResult>((observer) => {
    refreshInFlight ??= refreshSession().finally(() => {
      // Cleared on the next tick so concurrent 401s share this attempt.
      setTimeout(() => {
        refreshInFlight = null;
      }, 0);
    });

    refreshInFlight
      .then((ok) => {
        if (!ok) {
          observer.error(new Error("unauthenticated"));
          window.dispatchEvent(new CustomEvent("canteenx:session-expired"));
          return;
        }
        forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      })
      .catch((error) => observer.error(error));
  });
});

// --- subscriptions -----------------------------------------------------------
/**
 * Mint a short-lived ticket for the WebSocket.
 *
 * WebSocket auth is pinned at the handshake, so a cookie refreshed later never
 * reaches an already-open socket - a session older than the access token would
 * otherwise have permanently dead subscriptions. Fetching a ticket over HTTP
 * first routes us through the refresh-and-retry path that already works there.
 */
async function fetchRealtimeTicket(retryAfterRefresh = true): Promise<string | null> {
  const csrf = readCsrfToken();
  try {
    const response = await fetch(HTTP_URI, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "x-csrf-token": csrf } : {}),
      },
      body: JSON.stringify({
        query: "mutation CreateRealtimeTicket { createRealtimeTicket }",
      }),
    });
    const payload = (await response.json()) as {
      data?: { createRealtimeTicket?: string };
      errors?: { extensions?: { code?: string } }[];
    };

    const ticket = payload.data?.createRealtimeTicket;
    if (ticket) return ticket;

    const expired = payload.errors?.some(
      (error) => error?.extensions?.code === "unauthenticated",
    );
    if (expired && retryAfterRefresh && (await refreshSession())) {
      return fetchRealtimeTicket(false);
    }
    return null;
  } catch {
    return null;
  }
}

// graphql-ws swallows connection failures unless these handlers are supplied,
// which is how a completely dead WebSocket produced no console output at all.
const wsClient = createClient({
  url: wsUri,
  lazy: true,
  retryAttempts: 5,
  shouldRetry: () => true,
  // Resolved on every (re)connect, so a reconnect after a long idle period
  // gets a fresh credential rather than replaying a stale one.
  connectionParams: async () => {
    const ticket = await fetchRealtimeTicket();
    return ticket ? { ticket } : {};
  },
  on: {
    // Connection failures are otherwise completely silent, which is how a dead
    // socket went unnoticed. Errors are always reported; the chatter is not.
    connected: () => {
      if (import.meta.env.DEV) console.info("[canteenx:ws] connected");
    },
    error: (error) => console.error("[canteenx:ws] error", error),
    closed: (event) => {
      if (import.meta.env.DEV) console.warn("[canteenx:ws] closed", event);
    },
  },
});

const wsLink = new GraphQLWsLink(wsClient);

const transportLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  ApolloLink.from([csrfLink, retryLink, authRecoveryLink, httpLink]),
);

export const apolloClient = new ApolloClient({
  link: transportLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Paginated lists are replaced, not merged, because every caller
          // passes an explicit offset and expects that page back.
          canteens: { keyArgs: ["search", "openOnly"], merge: false },
          menuItems: {
            keyArgs: ["canteenId", "category", "search", "vegetarianOnly", "featuredOnly"],
            merge: false,
          },
          myOrders: { keyArgs: ["activeOnly"], merge: false },
          canteenOrders: { keyArgs: ["canteenId", "statuses"], merge: false },
          notifications: { keyArgs: ["unreadOnly"], merge: false },
        },
      },
      // The cart is a singleton per user; keying it by id would let a stale
      // pre-login cart linger in the cache after sign-in.
      Cart: { keyFields: false },
      Money: { keyFields: false },
      PageInfo: { keyFields: false },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network", nextFetchPolicy: "cache-first" },
  },
  connectToDevTools: import.meta.env.DEV,
});

/** Clear cached data on sign-out so another user never sees the previous PII. */
export async function resetApolloStore(): Promise<void> {
  // Drop the socket as well. It authenticated as the previous user, and a
  // ticket stays valid for its full lifetime - so without this it would keep
  // streaming their order events to whoever signs in next.
  wsClient.terminate();
  await apolloClient.clearStore();
}
