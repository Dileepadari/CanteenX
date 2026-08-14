import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { PageHeader, Skeleton, StatTile, TableScroll } from "@/components/common";
import { Money } from "@/components/common/Money";
import { Button } from "@/components/ui/button";
import { PLATFORM_STATS, REVENUE_TIMESERIES, TOP_ITEMS } from "@/graphql/operations";
import { cn } from "@/lib/utils";

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

/** Escape a CSV cell: quote it, and double any embedded quotes. */
function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  // A BOM makes Excel open UTF-8 correctly, which matters for the rupee sign.
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const [range, setRange] = useState(1);
  const days = RANGES[range]?.days ?? 30;

  const stats = useQuery(PLATFORM_STATS);
  const series = useQuery(REVENUE_TIMESERIES, { variables: { days } });
  const top = useQuery(TOP_ITEMS, { variables: { limit: 20 } });

  const points = series.data?.revenueTimeseries ?? [];
  const items = top.data?.topItems ?? [];

  const exportRevenue = () => {
    if (points.length === 0) {
      toast.error("Nothing to export yet.");
      return;
    }
    downloadCsv(
      `canteenx-revenue-${days}d.csv`,
      [
        ["Date", "Orders", "Revenue (INR)"],
        ...points.map((point) => [
          point.date,
          point.orders,
          (point.revenue.paise / 100).toFixed(2),
        ]),
      ],
    );
    toast.success("Revenue report downloaded");
  };

  const exportItems = () => {
    if (items.length === 0) {
      toast.error("Nothing to export yet.");
      return;
    }
    downloadCsv(
      "canteenx-top-items.csv",
      [
        ["Item", "Quantity sold", "Revenue (INR)"],
        ...items.map((item) => [
          item.name,
          item.quantity,
          (item.revenue.paise / 100).toFixed(2),
        ]),
      ],
    );
    toast.success("Item report downloaded");
  };

  const chartData = points.map((point) => ({
    date: point.date.slice(5),
    revenue: point.revenue.rupees,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Reports"
        description="Platform performance, exportable as CSV."
        actions={
          <Button variant="outline" onClick={exportRevenue}>
            <Download className="mr-1.5 h-4 w-4" aria-hidden />
            Export revenue
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Revenue all time"
          value={<Money value={stats.data?.platformStats.revenueTotal} size="xl" />}
          tone="success"
        />
        <StatTile
          label="Revenue today"
          value={<Money value={stats.data?.platformStats.revenueToday} size="xl" />}
          tone="accent"
        />
        <StatTile
          label="Orders today"
          value={stats.data?.platformStats.ordersToday ?? "-"}
        />
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

      <section className="surface mb-6 p-5">
        <h2 className="font-display text-base font-semibold">
          Revenue, last {days} days
        </h2>
        <div className="mt-4 h-72">
          {series.loading && !series.data ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "0.8125rem",
                  }}
                  formatter={(value: number) => [`₹${value}`, "Revenue"]}
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">
            Best selling items
          </h2>
          <Button variant="outline" size="sm" onClick={exportItems}>
            <Download className="mr-1.5 h-4 w-4" aria-hidden />
            Export
          </Button>
        </div>

        <TableScroll>
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left">
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="p-3 font-medium">Item</th>
                <th className="p-3 text-right font-medium">Sold</th>
                <th className="p-3 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={`${item.menuItemId}-${item.name}`}>
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="tabular p-3 text-right">{item.quantity}</td>
                  <td className="p-3 text-right">
                    <Money value={item.revenue} size="sm" />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-8 text-center text-sm text-muted-foreground"
                  >
                    No sales recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableScroll>
      </section>
    </div>
  );
}
