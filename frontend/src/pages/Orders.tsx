import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";

import {
  EmptyState,
  ErrorState,
  PageHeader,
  RowSkeleton,
} from "@/components/common";
import { Money } from "@/components/common/Money";
import { PAYMENT_STATUS, StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { MY_ORDERS } from "@/graphql/operations";
import { formatDateTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";

export default function Orders() {
  const [activeOnly, setActiveOnly] = useState(false);
  const { data, loading, error, refetch } = useQuery(MY_ORDERS, {
    variables: { activeOnly, limit: 40 },
  });

  const orders = data?.myOrders ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Your account"
        title="Orders"
        description="Every order you have placed, newest first."
      />

      <div
        role="tablist"
        aria-label="Filter orders"
        className="mb-5 inline-flex gap-1 rounded-lg bg-muted p-1"
      >
        {[
          { label: "All", value: false },
          { label: "Active", value: true },
        ].map(({ label, value }) => (
          <button
            key={label}
            role="tab"
            type="button"
            aria-selected={activeOnly === value}
            onClick={() => setActiveOnly(value)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              activeOnly === value
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <RowSkeleton count={4} />
      ) : error ? (
        <ErrorState
          description="Could not load your orders."
          onRetry={() => void refetch()}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={activeOnly ? "No active orders" : "No orders yet"}
          description={
            activeOnly
              ? "Orders being prepared will show up here."
              : "Once you place an order it will appear here."
          }
          action={
            <Button asChild>
              <Link to="/menu">Browse the menu</Link>
            </Button>
          }
        />
      ) : (
        <ul className="stagger space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={
                  order.status === "COMPLETED" || order.status === "CANCELLED"
                    ? `/orders/${order.id}`
                    : `/orders/track/${order.id}`
                }
                className="surface hover-lift block p-4 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold">
                      {order.reference}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {order.canteenName}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={order.status} />
                    <StatusPill status={order.paymentStatus} map={PAYMENT_STATUS} />
                  </div>
                </div>

                <p className="mt-3 line-clamp-1 text-sm text-muted-foreground">
                  {order.items
                    .map((item) => `${item.quantity}x ${item.name}`)
                    .join(", ")}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </span>
                  <Money value={order.total} size="lg" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
