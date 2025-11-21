import React, { useEffect, useState } from 'react';
import VendorLayout from '@/components/layout/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useApolloClient, useQuery, useMutation } from '@apollo/client';
import { GET_MENU_ITEMS_BY_CANTEEN } from '@/gql/queries/menuItems';
import { SET_MENU_ITEM_STOCK } from '@/gql/mutations/menuitems';
import inventory from '@/lib/inventory';

const VendorInventory = () => {
  const client = useApolloClient();
  const { toast } = useToast();
  const [selectedCanteenId] = useState<number>(1); // TODO: wire to actual vendor canteen selection
  const { loading, error, data, refetch } = useQuery(GET_MENU_ITEMS_BY_CANTEEN, {
    variables: { canteenId: selectedCanteenId },
    fetchPolicy: 'network-only',
  });

  const [items, setItems] = useState<any[]>([]);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [setMenuItemStock] = useMutation(SET_MENU_ITEM_STOCK);

  useEffect(() => {
    if (data?.getMenuItemsByCanteen) {
      const loaded = data.getMenuItemsByCanteen.map((it: any) => ({
        ...it,
        id: String(it.id),
        stockCount: inventory.getStock(it.id) ?? (it.stockCount ?? 0),
      }));
      setItems(loaded);
      // initialize editingStock
      const map: Record<string, number> = {};
      loaded.forEach((it: any) => (map[String(it.id)] = it.stockCount || 0));
      setEditingStock(map);
    }
  }, [data]);

  const handleChangeStock = (id: string, value: number) => {
    setEditingStock((prev) => ({ ...prev, [id]: Math.max(0, value) }));
  };

  const saveStock = (id: string) => {
    const value = editingStock[id];
    // Optimistic UI update
    setItems((prev) => prev.map((it) => (String(it.id) === String(id) ? { ...it, stockCount: value } : it)));
    // Persist to server, fallback to local inventory lib on failure
    setMenuItemStock({ variables: { itemId: parseInt(String(id)), stockCount: value } })
      .then((res) => {
        const confirmed = res?.data?.setMenuItemStock?.stockCount;
        if (confirmed !== undefined) {
          try { inventory.setStock(id, confirmed); } catch (e) { /* ignore */ }
          toast({ title: 'Stock updated', description: `Stock for item ${id} set to ${confirmed}` });
        } else {
          try { inventory.setStock(id, value); } catch (e) { /* ignore */ }
          toast({ title: 'Stock saved locally', description: `Server did not confirm update for ${id}` });
        }
      })
      .catch((err) => {
        console.error('Failed to update stock on server', err);
        try { inventory.setStock(id, value); } catch (e) { /* ignore */ }
        toast({ title: 'Stock saved locally', description: `Could not reach server for ${id}` });
      });
  };

  const saveAll = () => {
    Object.entries(editingStock).forEach(([id, val]) => inventory.setStock(id, val));
    toast({ title: 'Stock updated', description: 'All stocks updated locally.' });
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="p-6">Loading inventory...</div>
      </VendorLayout>
    );
  }

  if (error) {
    return (
      <VendorLayout>
        <div className="p-6">Error loading inventory: {String(error.message)}</div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
            <Button onClick={saveAll}>Save All</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium text-primary">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      className="w-28"
                      value={editingStock[String(item.id)] ?? 0}
                      onChange={(e) => handleChangeStock(String(item.id), parseInt(e.target.value || '0'))}
                      min={0}
                    />
                    <Button onClick={() => saveStock(String(item.id))}>Save</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
};

export default VendorInventory;
