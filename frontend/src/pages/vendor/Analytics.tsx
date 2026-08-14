import { useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  EmptyState,
  PageHeader,
  PageLoader,
  Skeleton,
  StatTile,
} from "@/components/common";
import { Money } from "@/components/common/Money";
import { CANTEEN_STATS, REVENUE_TIMESERIES, TOP_ITEMS } from "@/graphql/operations";
import { CanteenSwitcher, useManagedCanteen } from "@/lib/useManagedCanteen";
import { cn } from "@/lib/utils";

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

export default function VendorAnalytics() {
  const { canteenId, setCanteenId, canteens, loading: loadingCanteens } =
    useManagedCanteen();
  const [range, setRange] = useState(1);

  const days = RANGES[range]?.days ?? 30;

  const stats = useQuery(CANTEEN_STATS, {
    variables: { canteenId: canteenId! },
    skip: !canteenId,
  });
  const series = useQuery(REVENUE_TIMESERIES, {
    variables: { canteenId, days },
    skip: !canteenId,
  });
  const top = useQuery(TOP_ITEMS, {
    variables: { canteenId, limit: 8 },
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
  // Aggregated in SQL, not by pulling every order to the browser.
  const points =
    series.data?.revenueTimeseries.map((point) => ({
      date: point.date.slice(5),
      revenue: point.revenue.rupees,
      orders: point.orders,
    })) ?? [];

  const items =
    top.data?.topItems.map((item) => ({
      name: item.name.length > 16 ? `${item.name.slice(0, 15)}...` : item.name,
      quantity: item.quantity,
      revenue: item.revenue.rupees,
    })) ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Vendor"
        title="Analytics"
        description="Revenue and demand over time."
        actions={
          <CanteenSwitcher
            canteens={canteens}
            canteenId={canteenId}
            onChange={setCanteenId}
          />
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Orders today" value={summary?.ordersToday ?? "-"} />
        <StatTile
          label="Revenue today"
          value={<Money value={summary?.revenueToday} size="xl" />}
          tone="success"
        />
        <StatTile
          label="Average order"
          value={<Money value={summary?.averageOrderValue} size="xl" />}
          tone="accent"
        />
        <StatTile label="Orders all time" value={summary?.ordersTotal ?? "-"} />
      </div>

      <div className="mb-4 inline-flex gap-1 rounded-lg bg-muted p-1">
        {RANGES.map((option, index) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setRange(index)}
            aria-pressed={range === index}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
              range === index
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface p-5">
          <h2 className="font-display text-base font-semibold">Revenue</h2>
          <div className="mt-4 h-64">
            {series.loading && !series.data ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "0.8125rem",
                    }}
                    formatter={(value: number) => [`₹${value}`, "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="surface p-5">
          <h2 className="font-display text-base font-semibold">Best sellers</h2>
          <div className="mt-4 h-64">
            {top.loading && !top.data ? (
              <Skeleton className="h-full w-full" />
            ) : items.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No sales yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={items} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "0.8125rem",
                    }}
                    formatter={(value: number) => [value, "Sold"]}
                  />
                  <Bar
                    dataKey="quantity"
                    fill="hsl(var(--chart-2))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
