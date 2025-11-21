import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MENU_ITEMS } from '@/gql/queries/menuItems';
import { UPDATE_MENU_ITEM, DELETE_MENU_ITEM, SET_MENU_ITEM_STOCK } from '@/gql/mutations/menuitems';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AdminMenu = () => {
  const { toast } = useToast();
  const { data, loading, refetch } = useQuery(GET_MENU_ITEMS, { fetchPolicy: 'network-only' });
  const [updateMenuItem] = useMutation(UPDATE_MENU_ITEM);
  const [deleteMenuItem] = useMutation(DELETE_MENU_ITEM);
  const [setMenuStock] = useMutation(SET_MENU_ITEM_STOCK);

  const items = data?.getMenuItems || [];

  const handleDelete = async (it: any) => {
    if (!confirm(`Delete menu item ${it.name}?`)) return;
    try {
      await deleteMenuItem({ variables: { menuItemId: it.id } });
      toast({ title: 'Deleted menu item' });
      await refetch();
    } catch (err) {
      toast({ title: 'Delete failed', description: String(err) });
    }
  };

  const handleSetStock = async (it: any) => {
    const v = prompt('Enter new stock count', String(it.stockCount || 0));
    if (v == null) return;
    try {
      const n = Number(v);
      await setMenuStock({ variables: { menuItemId: it.id, stock: n } });
      toast({ title: 'Stock updated' });
      await refetch();
    } catch (err) {
      toast({ title: 'Failed', description: String(err) });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Menu Management</h1>

        <Card>
          <CardHeader>
            <CardTitle>All Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left"><th>ID</th><th>Name</th><th>Canteen</th><th>Price</th><th>Stock</th><th>Available</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {items.map((it: any) => (
                    <tr key={it.id} className="border-t">
                      <td>{it.id}</td>
                      <td className="max-w-xs">{it.name}<div className="text-muted text-xs">{it.description}</div></td>
                      <td>{it.canteenName || it.canteenId}</td>
                      <td>₹{Number(it.price).toFixed(2)}</td>
                      <td>{it.stockCount ?? '—'}</td>
                      <td>{String(it.isAvailable)}</td>
                      <td className="flex gap-2">
                        <Button size="sm" onClick={() => handleSetStock(it)}>Set Stock</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(it)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminMenu;
