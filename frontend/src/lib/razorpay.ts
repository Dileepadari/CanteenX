/**
 * Razorpay Checkout loader.
 *
 * The previous build never loaded this SDK at all. It fabricated
 * `mock_payment_${Date.now()}` on the client and passed it to the real
 * mark-paid mutation, so orders were marked paid without any money moving.
 */

export interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void;
  prefill: { name: string; email: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SDK_URL = "https://checkout.razorpay.com/v1/checkout.js";
let loader: Promise<void> | null = null;

/** Load the SDK once, sharing the promise across concurrent callers. */
export function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();

  loader ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loader = null; // allow a retry after a network failure
      reject(new Error("Could not load the payment provider."));
    };
    document.body.appendChild(script);
  });

  return loader;
}

export interface CheckoutIntent {
  gatewayOrderId: string;
  keyId: string;
  currency: string;
  orderReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  amount: { paise: number };
}

/**
 * Open Razorpay Checkout and resolve with the gateway's signed response.
 *
 * Resolves with `null` when the user dismisses the sheet, which is a normal
 * outcome and not an error.
 */
export async function openCheckout(
  intent: CheckoutIntent,
): Promise<RazorpayHandlerResponse | null> {
  await loadRazorpay();

  if (!window.Razorpay) {
    throw new Error("The payment provider is unavailable.");
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const instance = new window.Razorpay!({
      key: intent.keyId,
      amount: intent.amount.paise,
      currency: intent.currency,
      name: "CanteenX",
      description: `Order ${intent.orderReference}`,
      order_id: intent.gatewayOrderId,
      prefill: {
        name: intent.customerName,
        email: intent.customerEmail,
        contact: intent.customerPhone ?? undefined,
      },
      notes: { reference: intent.orderReference },
      theme: { color: "#49256B" },
      handler: (response) => {
        settled = true;
        // Never trusted on its own - the server verifies this signature and
        // then confirms with the gateway directly.
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          if (!settled) resolve(null);
        },
      },
    });

    instance.on("payment.failed", (payload) => {
      settled = true;
      const description =
        (payload as { error?: { description?: string } })?.error?.description ??
        "The payment failed.";
      reject(new Error(description));
    });

    instance.open();
  });
}
