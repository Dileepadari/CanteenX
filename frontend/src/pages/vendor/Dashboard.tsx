import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  IndianRupee,
  MessageSquareWarning,
  Star,
  TrendingUp,
} from "lucide-react";

import {
  EmptyState,
  PageHeader,
  PageLoader,
  RowSkeleton,
  StatTile,
} from "@/components/common";
import { Money } from "@/components/common/Money";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { CANTEEN_ORDERS, CANTEEN_STATS } from "@/graphql/operations";
import { CanteenSwitcher, useManagedCanteen } from "@/lib/useManagedCanteen";
import { formatRelative } from "@/lib/datetime";

export default function VendorDashboard() {
  const { canteenId, setCanteenId, canteens, loading: loadingCanteens } =
    useManagedCanteen();

  const stats = useQuery(CANTEEN_STATS, {
    variables: { canteenId: canteenId! },
    skip: !canteenId,
  });

  const orders = useQuery(CANTEEN_ORDERS, {
    variables: {
      canteenId: canteenId!,
      statuses: ["PENDING", "CONFIRMED", "PREPARING", "READY"] as never,
      limit: 8,
    },
    skip: !canteenId,
  });

  if (loadingCanteens) return <PageLoader />;

  if (canteens.length === 0) {
    return (
      <EmptyState
        title="No canteen assigned"
        description="Ask an administrator to assign you to a canteen."
      />
    );
  }

  const summary = stats.data?.canteenStats;

  return (
    <div>
      <PageHeader
        eyebrow="Vendor"
        title={summary?.canteenName ?? "Dashboard"}
        description="Today at a glance."
        actions={
          <CanteenSwitcher
            canteens={canteens}
            canteenId={canteenId}
            onChange={setCanteenId}
          />
        }
      />

      {/* Real values from a single aggregate query. The previous dashboard
          rendered a hardcoded array of KPI numbers. */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Orders today"
          value={summary?.ordersToday ?? "-"}
          icon={ClipboardList}
        />
        <StatTile
          label="Revenue today"
          value={<Money value={summary?.revenueToday} size="xl" />}
          icon={IndianRupee}
          tone="success"
        />
        <StatTile
          label="In the queue"
          value={summary?.pendingOrders ?? "-"}
          hint="Pending, confirmed, or preparing"
          icon={TrendingUp}
          tone="accent"
        />
        <StatTile
          label="Open complaints"
          value={summary?.openComplaints ?? "-"}
          icon={MessageSquareWarning}
          tone={summary?.openComplaints ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Live queue</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/vendor/orders">Open orders</Link>
            </Button>
          </div>

          {orders.loading && !orders.data ? (
            <RowSkeleton count={4} />
          ) : (orders.data?.canteenOrders.length ?? 0) === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Nothing in the queue"
              description="New orders will appear here as students place them."
            />
          ) : (
            <ul className="space-y-3">
              {orders.data?.canteenOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    to="/vendor/orders"
                    className="surface hover-lift flex items-center gap-4 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">
                          {order.reference}
                        </span>
                        <StatusPill status={order.status} size="sm" />
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {order.items
                          .map((item) => `${item.quantity}x ${item.name}`)
                          .join(", ")}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatRelative(order.createdAt)}
                      </p>
                    </div>
                    <Money value={order.total} size="lg" className="shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-4">
          <div className="surface p-5">
            <h2 className="font-display text-base font-semibold">All time</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Orders</dt>
                <dd className="tabular font-semibold">
                  {summary?.ordersTotal ?? "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Revenue</dt>
                <dd>
                  <Money value={summary?.revenueTotal} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Average order</dt>
                <dd>
                  <Money value={summary?.averageOrderValue} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Rating</dt>
                <dd className="flex items-center gap-1 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden />
                  {summary?.rating ? summary.rating.toFixed(1) : "-"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="surface space-y-2 p-5">
            <h2 className="font-display text-base font-semibold">Shortcuts</h2>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/vendor/menu">Manage menu</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/vendor/inventory">Update stock</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/vendor/analytics">View analytics</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
