import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import {
  Building2,
  ClipboardList,
  IndianRupee,
  MessageSquareWarning,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react";

import { PageHeader, Skeleton, StatTile } from "@/components/common";
import { Money } from "@/components/common/Money";
import { Button } from "@/components/ui/button";
import { PLATFORM_STATS, REVENUE_TIMESERIES } from "@/graphql/operations";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AdminDashboard() {
  const { data, loading } = useQuery(PLATFORM_STATS);
  const series = useQuery(REVENUE_TIMESERIES, { variables: { days: 30 } });

  const stats = data?.platformStats;
  const points =
    series.data?.revenueTimeseries.map((point) => ({
      date: point.date.slice(5),
      revenue: point.revenue.rupees,
    })) ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        description="Everything happening across CanteenX."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Revenue today"
          value={
            loading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <Money value={stats?.revenueToday} size="xl" />
            )
          }
          icon={IndianRupee}
          tone="success"
        />
        <StatTile
          label="Orders today"
          value={stats?.ordersToday ?? "-"}
          hint={`${stats?.activeOrders ?? 0} still active`}
          icon={ClipboardList}
        />
        <StatTile
          label="Users"
          value={stats?.totalUsers ?? "-"}
          hint={`${stats?.totalVendors ?? 0} vendors`}
          icon={UsersRound}
        />
        <StatTile
          label="Open complaints"
          value={stats?.openComplaints ?? "-"}
          icon={MessageSquareWarning}
          tone={stats?.openComplaints ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <section className="surface p-5">
          <h2 className="font-display text-base font-semibold">
            Revenue, last 30 days
          </h2>
          <div className="mt-4 h-72">
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
                    width={48}
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

        <aside className="space-y-4">
          <div className="surface p-5">
            <h2 className="font-display text-base font-semibold">Catalogue</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" aria-hidden />
                  Canteens
                </dt>
                <dd className="tabular font-semibold">
                  {stats?.totalCanteens ?? "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <UtensilsCrossed className="h-4 w-4" aria-hidden />
                  Menu items
                </dt>
                <dd className="tabular font-semibold">
                  {stats?.totalMenuItems ?? "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <dt className="text-muted-foreground">Revenue all time</dt>
                <dd>
                  <Money value={stats?.revenueTotal} />
                </dd>
              </div>
            </dl>
          </div>

          <div className="surface space-y-2 p-5">
            <h2 className="font-display text-base font-semibold">Manage</h2>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/admin/canteens">Canteens</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/admin/users">Users and vendors</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/admin/complaints">Complaints</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
