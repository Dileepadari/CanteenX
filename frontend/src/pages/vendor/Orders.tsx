import { useState } from "react";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";

import {
  EmptyState,
  PageHeader,
  PageLoader,
  RowSkeleton,
} from "@/components/common";
import { Money } from "@/components/common/Money";
import { PAYMENT_STATUS, StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import {
  CANTEEN_ORDERS,
  CANTEEN_QUEUE_SUBSCRIPTION,
  UPDATE_ORDER_STATUS,
} from "@/graphql/operations";
import { CanteenSwitcher, useManagedCanteen } from "@/lib/useManagedCanteen";
import { formatRelative } from "@/lib/datetime";
import { cn } from "@/lib/utils";

/** The transition a vendor can drive from each state. */
const NEXT_STATUS: Record<string, { status: string; label: string } | null> = {
  PENDING: { status: "CONFIRMED", label: "Accept" },
  CONFIRMED: { status: "PREPARING", label: "Start preparing" },
  PREPARING: { status: "READY", label: "Mark ready" },
  READY: { status: "COMPLETED", label: "Complete" },
  COMPLETED: null,
  CANCELLED: null,
};

const FILTERS = [
  { label: "Active", statuses: ["PENDING", "CONFIRMED", "PREPARING", "READY"] },
  { label: "Pending", statuses: ["PENDING"] },
  { label: "Preparing", statuses: ["PREPARING"] },
  { label: "Ready", statuses: ["READY"] },
  { label: "All", statuses: null },
];

export default function VendorOrders() {
  const { canteenId, setCanteenId, canteens, loading: loadingCanteens } =
    useManagedCanteen();
  const [filter, setFilter] = useState(0);

  const statuses = FILTERS[filter]?.statuses ?? null;

  const { data, loading, refetch } = useQuery(CANTEEN_ORDERS, {
    variables: {
      canteenId: canteenId!,
      statuses: statuses as never,
      limit: 60,
    },
    skip: !canteenId,
  });

  // Live queue. Replaces a 10-second `setInterval` refetch.
  useSubscription(CANTEEN_QUEUE_SUBSCRIPTION, {
    variables: { canteenId: canteenId! },
    skip: !canteenId,
    onData: ({ data: payload }) => {
      const update = payload.data?.canteenOrderQueue;
      if (update?.status === "PENDING") {
        toast.info(`New order ${update.reference}`);
      }
      void refetch();
    },
  });

  const [updateStatus, updateState] = useMutation(UPDATE_ORDER_STATUS);

  const advance = async (orderId: number, status: string, label: string) => {
    try {
      await updateStatus({
        variables: { orderId, status: status as never },
      });
      toast.success(`${label} done`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update that order.",
      );
    }
  };

  if (loadingCanteens) return <PageLoader />;
  if (canteens.length === 0) {
    return (
      <EmptyState
        title="No canteen assigned"
        description="Ask an administrator to assign you to a canteen."
      />
    );
  }

  const orders = data?.canteenOrders ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Vendor"
        title="Orders"
        description="Live queue. Updates arrive as students place orders."
        actions={
          <CanteenSwitcher
            canteens={canteens}
            canteenId={canteenId}
            onChange={setCanteenId}
          />
        }
      />

      <div className="scroll-x mb-5 -mx-1 flex gap-2 px-1 pb-1">
        {FILTERS.map((option, index) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setFilter(index)}
            aria-pressed={filter === index}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === index
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <RowSkeleton count={5} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nothing here"
          description="No orders match this filter right now."
        />
      ) : (
        <ul className="space-y-3" aria-live="polite">
          {orders.map((order) => {
            const next = NEXT_STATUS[order.status];
            return (
              <li key={order.id} className="surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold">
                        {order.reference}
                      </span>
                      <StatusPill status={order.status} size="sm" />
                      <StatusPill
                        status={order.paymentStatus}
                        map={PAYMENT_STATUS}
                        size="sm"
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.customer?.name} - {formatRelative(order.createdAt)}
                      {order.contactPhone ? ` - ${order.contactPhone}` : ""}
                    </p>
                  </div>
                  <Money value={order.total} size="lg" />
                </div>

                <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <span className="font-medium">
                        {item.quantity}x {item.name}
                      </span>
                      {item.customizationSummary && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {item.customizationSummary}
                        </span>
                      )}
                      {item.note && (
                        <span className="ml-2 text-xs italic text-accent">
                          &ldquo;{item.note}&rdquo;
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                {order.customerNote && (
                  <p className="mt-2 rounded-lg bg-accent-soft px-3 py-2 text-xs text-accent">
                    Note: {order.customerNote}
                  </p>
                )}

                {next && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={updateState.loading}
                      onClick={() =>
                        void advance(order.id, next.status, next.label)
                      }
                    >
                      {next.label}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      disabled={updateState.loading}
                      onClick={() =>
                        void advance(order.id, "CANCELLED", "Cancellation")
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
