import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQuery } from '@apollo/client';
import { GET_CANTEENS, GET_CANTEEN_BY_ID } from '@/gql/queries/canteens';
import { GET_CANTEEN_ORDERS } from '@/gql/queries/orders';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const groupByWeek = (orders: any[]) => {
  const weeks: Record<string, { orders: any[]; revenue: number }> = {};
  orders.forEach((o) => {
    const d = new Date(o.orderTime);
    // ISO week key: YYYY-WW
    const year = d.getFullYear();
    const week = Math.ceil((((d.getTime() / 86400000) - (d.getDay() + 1)) / 7));
    const key = `${year}-W${week}`;
    weeks[key] = weeks[key] || { orders: [], revenue: 0 };
    weeks[key].orders.push(o);
    weeks[key].revenue += parseFloat(String(o.totalAmount || 0));
  });
  return Object.entries(weeks).map(([k, v]) => ({ period: k, count: v.orders.length, revenue: v.revenue }));
};

const groupByMonth = (orders: any[]) => {
  const months: Record<string, { orders: any[]; revenue: number }> = {};
  orders.forEach((o) => {
    const d = new Date(o.orderTime);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = months[key] || { orders: [], revenue: 0 };
    months[key].orders.push(o);
    months[key].revenue += parseFloat(String(o.totalAmount || 0));
  });
  return Object.entries(months).map(([k, v]) => ({ period: k, count: v.orders.length, revenue: v.revenue }));
};

const AdminReports = () => {
  const { data: canteensData } = useQuery(GET_CANTEENS);
  const [selectedCanteen, setSelectedCanteen] = useState<number | null>(null);
  const { data: ordersData, refetch } = useQuery(GET_CANTEEN_ORDERS, { variables: { canteenId: selectedCanteen || 0 }, skip: !selectedCanteen });
  const canteens = canteensData?.getAllCanteens || [];

  useEffect(() => {
    if (selectedCanteen) refetch?.();
  }, [selectedCanteen]);

  const orders = ordersData?.getCanteenOrders || [];

  const weekly = groupByWeek(orders);
  const monthly = groupByMonth(orders);

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Reports</h1>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Choose Canteen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Select onValueChange={(v) => setSelectedCanteen(Number(v))}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Select canteen" /></SelectTrigger>
                <SelectContent>
                  {canteens.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => refetch?.()}>Refresh</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left"><th>Week</th><th>Orders</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {weekly.map((w) => (
                    <tr key={w.period}><td>{w.period}</td><td>{w.count}</td><td>₹{w.revenue.toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left"><th>Month</th><th>Orders</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {monthly.map((m) => (
                    <tr key={m.period}><td>{m.period}</td><td>{m.count}</td><td>₹{m.revenue.toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
