import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQuery } from '@apollo/client';
import { GET_CANTEENS, GET_CANTEEN_BY_ID } from '@/gql/queries/canteens';
import { GET_MENU_ITEMS } from '@/gql/queries/menuItems';
import { GET_ALL_COMPLAINTS } from '@/gql/queries/complaints';
import { GET_USERS_BY_ROLE } from '@/gql/queries/user';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatIST } from '@/lib/ist';

const AdminSettings = () => {
  const { data: canteensData } = useQuery(GET_CANTEENS);
  const { data: menuData } = useQuery(GET_MENU_ITEMS);
  const { data: complaintsData } = useQuery(GET_ALL_COMPLAINTS);
  const { data: vendorsData } = useQuery(GET_USERS_BY_ROLE, { variables: { role: 'vendor' } });

  const canteens = canteensData?.getAllCanteens || [];
  const menus = menuData?.getMenuItems || [];
  const complaints = complaintsData?.getAllComplaints || [];
  const vendors = vendorsData?.getUsersByRole || [];

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Settings & Overview</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader>
              <CardTitle>Counts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>Total canteens: <strong>{canteens.length}</strong></li>
                <li>Total menu items: <strong>{menus.length}</strong></li>
                <li>Total vendors: <strong>{vendors.length}</strong></li>
                <li>Total complaints: <strong>{complaints.length}</strong></li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {complaints.slice(0,5).map((c: any) => (
                  <li key={c.id}><strong>{c.heading}</strong> — {c.status} ({formatIST(c.createdAt, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })})</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">No global settings stored yet. Use this page to surface site-level toggles and quick links.</p>
              <div className="mt-3 flex flex-col gap-2">
                <a className="text-sm text-primary underline" href="/admin/reports">Open Reports</a>
                <a className="text-sm text-primary underline" href="/admin/canteens">Manage Canteens</a>
                <a className="text-sm text-primary underline" href="/admin/menu">Manage Menu</a>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Canteens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {canteens.map((c: any) => (
                <div key={c.id} className="p-3 border rounded">
                  <h3 className="font-semibold">{c.name} ({c.id})</h3>
                  <div className="text-sm text-muted-foreground">{c.location}</div>
                  <div className="mt-2 text-sm">
                    <div>Owner user id: {c.userId}</div>
                    <div>Open: {String(c.isOpen)}</div>
                    <div>Schedule: {JSON.stringify(c.schedule)}</div>
                    <div>Tags: {(c.tags || []).join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
