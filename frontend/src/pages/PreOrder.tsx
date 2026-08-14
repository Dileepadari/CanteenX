import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { CalendarClock, UsersRound } from "lucide-react";
import { toast } from "sonner";

import {
  EmptyState,
  PageHeader,
  RowSkeleton,
  Spinner,
} from "@/components/common";
import { Money } from "@/components/common/Money";
import { BULK_STATUS, StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CANTEENS,
  CART,
  CREATE_BULK_ORDER,
  MY_BULK_ORDERS,
  SET_BULK_ORDER_STATUS,
  SET_CART_PICKUP_TIME,
} from "@/graphql/operations";
import { formatDateTime, isoToLocalInput, localInputToIso } from "@/lib/datetime";
import { cn } from "@/lib/utils";

/**
 * Pre-ordering, in two flavours.
 *
 * The previous page had no GraphQL import at all - it generated time slots on
 * the client and its submit handler was `// In a real app, this would send the
 * scheduled order to the backend`. Both paths here hit real mutations.
 */
export default function PreOrder() {
  const [tab, setTab] = useState<"schedule" | "bulk">("schedule");

  return (
    <div>
      <PageHeader
        eyebrow="Plan ahead"
        title="Pre-order"
        description="Schedule a pickup time, or request catering for a group."
      />

      <div
        role="tablist"
        aria-label="Pre-order type"
        className="mb-6 inline-flex gap-1 rounded-lg bg-muted p-1"
      >
        {[
          { value: "schedule", label: "Schedule a pickup" },
          { value: "bulk", label: "Bulk / catering" },
        ].map((option) => (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={tab === option.value}
            onClick={() => setTab(option.value as typeof tab)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              tab === option.value
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {tab === "schedule" ? <SchedulePanel /> : <BulkPanel />}
    </div>
  );
}

function SchedulePanel() {
  const { data, loading } = useQuery(CART);
  const [setPickup, { loading: saving }] = useMutation(SET_CART_PICKUP_TIME, {
    refetchQueries: [{ query: CART }],
  });
  const [value, setValue] = useState("");

  const cart = data?.cart;
  const scheduled = cart?.scheduledFor;

  // Default to an hour ahead: a pickup time in the past is rejected by the API,
  // and "now" is not a useful default for a pre-order.
  const min = isoToLocalInput(new Date(Date.now() + 15 * 60_000).toISOString());

  const save = async () => {
    try {
      await setPickup({ variables: { scheduledFor: localInputToIso(value) } });
      toast.success(
        value ? "Pickup time saved to your cart" : "Pickup time cleared",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save that time.",
      );
    }
  };

  if (loading && !data) return <RowSkeleton count={2} />;

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Add items first"
        description="Build your order, then choose when you want to collect it."
        action={
          <Button asChild>
            <Link to="/menu">Browse the menu</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="surface space-y-4 p-5">
        <h2 className="font-display text-base font-semibold">
          When do you want it?
        </h2>
        <p className="text-sm text-muted-foreground">
          The kitchen starts your order so it is ready at this time.
        </p>

        <div>
          <Label htmlFor="pickup">Pickup time</Label>
          <Input
            id="pickup"
            type="datetime-local"
            min={min}
            value={value || isoToLocalInput(scheduled)}
            onChange={(event) => setValue(event.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => void save()} disabled={saving}>
            {saving && <Spinner className="mr-2" />}
            Save time
          </Button>
          {scheduled && (
            <Button
              variant="ghost"
              onClick={() => {
                setValue("");
                void setPickup({ variables: { scheduledFor: null } });
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {scheduled && (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
            Scheduled for {formatDateTime(scheduled)}
          </p>
        )}
      </div>

      <div className="surface p-5">
        <h2 className="font-display text-base font-semibold">
          {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"} ready to order
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          {cart.items.map((line) => (
            <li key={line.id} className="flex justify-between gap-3">
              <span className="min-w-0 truncate text-muted-foreground">
                {line.quantity}x {line.menuItem?.name}
              </span>
              <Money value={line.lineTotal} size="sm" />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border pt-4">
          <span className="font-semibold">Total</span>
          <Money value={cart.total} size="lg" />
        </div>
        <Button asChild className="mt-5 w-full">
          <Link to="/checkout">Continue to checkout</Link>
        </Button>
      </div>
    </div>
  );
}

function BulkPanel() {
  const canteens = useQuery(CANTEENS, { variables: { limit: 50 } });
  const mine = useQuery(MY_BULK_ORDERS);

  const [canteenId, setCanteenId] = useState("");
  const [title, setTitle] = useState("");
  const [headCount, setHeadCount] = useState("25");
  const [requiredAt, setRequiredAt] = useState("");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");

  const [createBulkOrder, { loading }] = useMutation(CREATE_BULK_ORDER, {
    onCompleted: () => void mine.refetch(),
  });
  const [setStatus] = useMutation(SET_BULK_ORDER_STATUS, {
    onCompleted: () => void mine.refetch(),
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const iso = localInputToIso(requiredAt);
    if (!iso) {
      toast.error("Choose when you need the order.");
      return;
    }
    try {
      await createBulkOrder({
        variables: {
          input: {
            canteenId: Number(canteenId),
            title: title.trim(),
            headCount: Number(headCount),
            requiredAt: iso,
            notes: notes.trim() || null,
            contactPhone: phone.trim() || null,
          },
        },
      });
      toast.success("Request sent. The canteen will send a quote.");
      setTitle("");
      setNotes("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send that request.",
      );
    }
  };

  const min = isoToLocalInput(new Date(Date.now() + 3600_000).toISOString());

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={submit} className="surface space-y-4 p-5">
        <h2 className="font-display text-base font-semibold">
          Request catering
        </h2>
        <p className="text-sm text-muted-foreground">
          For events and group meals. The canteen replies with a quote you can
          accept or decline.
        </p>

        <div>
          <Label htmlFor="bulk-canteen">Canteen</Label>
          <select
            id="bulk-canteen"
            value={canteenId}
            onChange={(event) => setCanteenId(event.target.value)}
            required
            className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
          >
            <option value="">Choose a canteen</option>
            {canteens.data?.canteens.map((canteen) => (
              <option key={canteen.id} value={canteen.id}>
                {canteen.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="bulk-title">What is the occasion?</Label>
          <Input
            id="bulk-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Club night, lab lunch, birthday"
            className="mt-1.5"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="bulk-count">Number of people</Label>
            <Input
              id="bulk-count"
              type="number"
              min={1}
              value={headCount}
              onChange={(event) => setHeadCount(event.target.value)}
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label htmlFor="bulk-when">Needed by</Label>
            <Input
              id="bulk-when"
              type="datetime-local"
              min={min}
              value={requiredAt}
              onChange={(event) => setRequiredAt(event.target.value)}
              className="mt-1.5"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bulk-phone">Contact number</Label>
          <Input
            id="bulk-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="bulk-notes">What would you like?</Label>
          <Textarea
            id="bulk-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="Dishes, dietary needs, serving style"
            className="mt-1.5"
          />
        </div>

        <Button type="submit" disabled={loading || !canteenId}>
          {loading && <Spinner className="mr-2" />}
          Send request
        </Button>
      </form>

      <section>
        <h2 className="mb-3 font-display text-base font-semibold">
          Your requests
        </h2>

        {mine.loading && !mine.data ? (
          <RowSkeleton count={2} />
        ) : (mine.data?.myBulkOrders.length ?? 0) === 0 ? (
          <EmptyState
            icon={UsersRound}
            title="No catering requests yet"
            description="Requests and their quotes will appear here."
          />
        ) : (
          <ul className="space-y-3">
            {mine.data?.myBulkOrders.map((order) => (
              <li key={order.id} className="surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{order.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {order.canteenName} - {order.headCount} people -{" "}
                      {formatDateTime(order.requiredAt)}
                    </p>
                  </div>
                  <StatusPill status={order.status} map={BULK_STATUS} size="sm" />
                </div>

                {order.quotedTotal && (
                  <div className="mt-3 rounded-lg bg-accent-soft p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-accent">Quote</span>
                      <Money value={order.quotedTotal} size="lg" />
                    </div>
                    {order.quoteNote && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {order.quoteNote}
                      </p>
                    )}
                    {order.status === "QUOTED" && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            void setStatus({
                              variables: {
                                bulkOrderId: order.id,
                                status: "CONFIRMED" as never,
                              },
                            })
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void setStatus({
                              variables: {
                                bulkOrderId: order.id,
                                status: "CANCELLED" as never,
                              },
                            })
                          }
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
