import { useEffect } from "react";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { ErrorState, PageHeader, PageLoader } from "@/components/common";
import { Money } from "@/components/common/Money";
import {
  ORDER_STATUS,
  ORDER_TIMELINE,
  PAYMENT_STATUS,
  StatusPill,
} from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import {
  CANCEL_ORDER,
  MY_ORDERS,
  ORDER,
  ORDER_STATUS_SUBSCRIPTION,
} from "@/graphql/operations";
import { formatDateTime, formatTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";

/**
 * Live order tracking.
 *
 * The timeline is driven by real `orderStatusEvents` from the server and
 * updated by a WebSocket subscription. The previous implementation simulated
 * progress on the client with a 60-second interval, so what it displayed had
 * no connection to what the kitchen was doing.
 */
export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useQuery(ORDER, {
    variables: { id: orderId },
    skip: !Number.isFinite(orderId),
  });

  useSubscription(ORDER_STATUS_SUBSCRIPTION, {
    variables: { orderId },
    skip: !Number.isFinite(orderId),
    onError: (subscriptionError) =>
      console.error("[canteenx:sub] orderStatus failed", subscriptionError),
    onData: ({ data: payload }) => {
      const update = payload.data?.orderStatus;
      if (!update) return;
      const descriptor = ORDER_STATUS[update.status];
      toast.info(descriptor?.label ?? "Order updated");
      void refetch();
    },
  });

  const [cancelOrder, cancelState] = useMutation(CANCEL_ORDER, {
    refetchQueries: [{ query: MY_ORDERS, variables: { limit: 40 } }],
  });

  const order = data?.order;

  // A terminal order has nothing left to track; the detail page is the right
  // place for it.
  useEffect(() => {
    if (order && (order.status === "COMPLETED" || order.status === "CANCELLED")) {
      navigate(`/orders/${order.id}`, { replace: true });
    }
  }, [order, navigate]);

  if (loading && !data) return <PageLoader label="Loading your order" />;

  if (error || !order) {
    return (
      <ErrorState
        title="Order not found"
        description="This order does not exist, or it is not yours."
        onRetry={() => void refetch()}
      />
    );
  }

  const reachedIndex = ORDER_TIMELINE.indexOf(
    order.status as (typeof ORDER_TIMELINE)[number],
  );

  const handleCancel = async () => {
    try {
      await cancelOrder({
        variables: { orderId: order.id, reason: "Cancelled by customer" },
      });
      toast.success("Order cancelled");
      navigate(`/orders/${order.id}`);
    } catch (mutationError) {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : "Could not cancel this order.",
      );
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={order.canteenName ?? undefined}
        title={`Order ${order.reference}`}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusPill status={order.status} />
            <StatusPill status={order.paymentStatus} map={PAYMENT_STATUS} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {/* --- timeline --- */}
          <section className="surface p-5 sm:p-6" aria-live="polite">
            <h2 className="font-display text-base font-semibold">Progress</h2>

            <ol className="mt-5 space-y-0">
              {ORDER_TIMELINE.map((step, index) => {
                const descriptor = ORDER_STATUS[step];
                const event = order.statusEvents.find(
                  (candidate) => candidate.status === step,
                );
                const done = index <= reachedIndex;
                const current = index === reachedIndex;
                const Icon = descriptor?.icon ?? Check;

                return (
                  <li key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          done
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground",
                          current && "ring-4 ring-primary/15",
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      {index < ORDER_TIMELINE.length - 1 && (
                        <span
                          aria-hidden
                          className={cn(
                            "w-0.5 flex-1",
                            index < reachedIndex ? "bg-primary" : "bg-border",
                          )}
                          style={{ minHeight: "2rem" }}
                        />
                      )}
                    </div>

                    <div className="flex-1 pb-8">
                      <p
                        className={cn(
                          "font-medium",
                          !done && "text-muted-foreground",
                        )}
                      >
                        {descriptor?.label ?? step}
                      </p>
                      {event ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatTime(event.createdAt)}
                          {event.note ? ` - ${event.note}` : ""}
                        </p>
                      ) : (
                        current && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            In progress
                          </p>
                        )
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {order.readyEstimateAt && reachedIndex < 3 && (
              <p className="rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent">
                Estimated ready by {formatTime(order.readyEstimateAt)}
              </p>
            )}
          </section>

          {/* --- items --- */}
          <section className="surface p-5">
            <h2 className="font-display text-base font-semibold">Items</h2>
            <ul className="mt-4 space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {item.quantity}x {item.name}
                    </p>
                    {item.customizationSummary && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.customizationSummary}
                      </p>
                    )}
                    {item.note && (
                      <p className="mt-0.5 text-xs italic text-muted-foreground">
                        &ldquo;{item.note}&rdquo;
                      </p>
                    )}
                  </div>
                  <Money value={item.lineTotal} size="sm" className="shrink-0" />
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* --- summary --- */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="surface p-5">
            <h2 className="font-display text-base font-semibold">Summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>
                  <Money value={order.subtotal} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd>
                  <Money value={order.tax} />
                </dd>
              </div>
              {order.discount.paise > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Discount</dt>
                  <dd>-{order.discount.formatted}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2.5">
                <dt className="font-semibold">Total</dt>
                <dd>
                  <Money value={order.total} size="lg" />
                </dd>
              </div>
            </dl>
          </div>

          <div className="surface space-y-3 p-5 text-sm">
            {order.canteenName && (
              <p className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                {order.canteenName}
              </p>
            )}
            {order.contactPhone && (
              <p className="flex items-start gap-2">
                <Phone
                  className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                {order.contactPhone}
              </p>
            )}
          </div>

          {order.canCancel && (
            <Button
              variant="outline"
              className="w-full text-destructive hover:bg-destructive-soft"
              disabled={cancelState.loading}
              onClick={() => void handleCancel()}
            >
              Cancel order
            </Button>
          )}

          <Button asChild variant="ghost" className="w-full">
            <Link to="/orders">All orders</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
