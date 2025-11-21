import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CANTEEN_DETAIL } from '@/gql/queries/canteens';
import { ESCALATE_COMPLAINT, CLOSE_COMPLAINT, UPDATE_COMPLAINT } from '@/gql/mutations/complaints';
import { CREATE_MENU_ITEM, UPDATE_MENU_ITEM, DELETE_MENU_ITEM, SET_MENU_ITEM_STOCK } from '@/gql/mutations/menuitems';
import { GET_USERS_BY_ROLE } from '@/gql/queries/user';
import { UPDATE_CANTEEN } from '@/gql/mutations/canteens';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatIST } from '@/lib/ist';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminCanteenDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const canteenId = Number(id || 0);
  const { data, loading, refetch } = useQuery(GET_CANTEEN_DETAIL, { variables: { id: canteenId }, fetchPolicy: 'network-only' });

  const [escalateComplaint] = useMutation(ESCALATE_COMPLAINT);
  const [closeComplaint] = useMutation(CLOSE_COMPLAINT);
  const [updateComplaint] = useMutation(UPDATE_COMPLAINT);

  const [createMenuItem] = useMutation(CREATE_MENU_ITEM);
  const [updateMenuItem] = useMutation(UPDATE_MENU_ITEM);
  const [deleteMenuItem] = useMutation(DELETE_MENU_ITEM);
  const [setMenuStock] = useMutation(SET_MENU_ITEM_STOCK);
  const [updateCanteen] = useMutation(UPDATE_CANTEEN);

  const { data: vendorsData } = useQuery(GET_USERS_BY_ROLE, { variables: { role: 'vendor' }, fetchPolicy: 'network-only' });

  const { toast } = useToast();

  const [newItem, setNewItem] = React.useState({ name: '', price: 0, isAvailable: true, description: '', image: '' });
  const [editingItem, setEditingItem] = React.useState<any>(null);

  if (!id) return <AdminLayout><div className="container p-6">Invalid canteen</div></AdminLayout>;

  const canteen = data?.getCanteenDetail;

  const handleEscalate = async (complaintId: number) => {
    try {
      const res = await escalateComplaint({ variables: { complaintId } });
      if (res.data?.escalateComplaint?.success) {
        toast({ title: 'Escalated' });
        refetch();
      } else {
        toast({ title: 'Error', description: res.data?.escalateComplaint?.message || 'Failed', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
    }
  };

  const handleClose = async (complaintId: number) => {
    try {
      const res = await closeComplaint({ variables: { complaintId } });
      if (res.data?.closeComplaint?.success) {
        toast({ title: 'Closed' });
        refetch();
      } else {
        toast({ title: 'Error', description: res.data?.closeComplaint?.message || 'Failed', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
    }
  };

  // Menu item operations
  const handleCreateMenuItem = async () => {
    try {
      const variables = {
        name: newItem.name,
        price: parseFloat(String(newItem.price)),
        canteenId,
        canteenName: canteen?.name || '',
        currentUserId: '',
        description: newItem.description || null,
        image: newItem.image || null,
      };
      const res = await createMenuItem({ variables });
      if (res.data?.createMenuItem?.success) {
        toast({ title: 'Menu item created' });
        refetch();
        setNewItem({ name: '', price: 0, isAvailable: true, description: '', image: '' });
      } else {
        toast({ title: 'Error', description: res.data?.createMenuItem?.message || 'Failed', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create', variant: 'destructive' });
    }
  };

  const handleUpdateMenuItem = async () => {
    if (!editingItem) return;
    try {
      const variables = {
        itemId: editingItem.id,
        currentUserId: '',
        name: editingItem.name,
        price: parseFloat(String(editingItem.price)),
        description: editingItem.description || null,
        image: editingItem.image || null,
      };
      const res = await updateMenuItem({ variables });
      if (res.data?.updateMenuItem?.success) {
        toast({ title: 'Updated' });
        refetch();
        setEditingItem(null);
      } else {
        toast({ title: 'Error', description: res.data?.updateMenuItem?.message || 'Failed', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update', variant: 'destructive' });
    }
  };

  const handleDeleteMenuItem = async (id: number) => {
    if (!confirm('Delete menu item?')) return;
    try {
      const res = await deleteMenuItem({ variables: { itemId: id, currentUserId: '' } });
      if (res.data?.deleteMenuItem?.success) {
        toast({ title: 'Deleted' });
        refetch();
      } else {
        toast({ title: 'Error', description: res.data?.deleteMenuItem?.message || 'Failed', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleSetStock = async (itemId: number, stock: number) => {
    try {
      await setMenuStock({ variables: { itemId, stockCount: stock } });
      toast({ title: 'Stock updated' });
      refetch();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
    }
  };

  // Owner assignment
  const vendors = vendorsData?.getUsersByRole || [];
  const handleAssignOwner = async (userId: string) => {
    try {
      const res = await updateCanteen({ variables: { canteenId, userId, name: canteen?.name } });
      if (res.data?.updateCanteen?.success) {
        toast({ title: 'Owner assigned' });
        refetch();
      } else {
        toast({ title: 'Error', description: res.data?.updateCanteen?.message || 'Failed', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate('/admin/canteens')}>Back</Button>
        <h1 className="text-2xl font-bold my-4">Canteen: {canteen?.name || 'Loading...'}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Menu Items</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <div>Loading...</div> : (
                  <div className="space-y-3">
                    {canteen?.menuItems?.length ? canteen.menuItems.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{m.name}</div>
                          <div className="text-sm text-muted-foreground">₹{m.price} • Stock: {m.stockCount ?? 'N/A'}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => navigate(`/admin/canteens/${canteenId}/menu/${m.id}`)}>Edit</Button>
                        </div>
                      </div>
                    )) : <div>No menu items</div>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Complaints</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <div>Loading...</div> : (
                  <div className="space-y-3">
                    {canteen?.complaints?.length ? canteen.complaints.map((c: any) => (
                      <div key={c.id} className="p-3 border rounded">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{c.heading}</div>
                            <div className="text-sm text-muted-foreground">{c.complaintText}</div>
                            <div className="text-xs mt-1">From: {c.user?.name} • {formatIST(c.createdAt, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="text-xs mt-1">Status: {c.status} {c.isEscalated ? <span className="text-sm text-red-600">(Escalated)</span> : null}</div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" onClick={() => handleEscalate(c.id)}>Escalate</Button>
                            <Button size="sm" variant="ghost" onClick={() => handleClose(c.id)}>Close</Button>
                          </div>
                        </div>
                      </div>
                    )) : <div>No complaints</div>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Owner / Staff</CardTitle>
              </CardHeader>
              <CardContent>
                {canteen?.owner ? (
                  <div>
                    <div className="font-medium">{canteen.owner.name}</div>
                    <div className="text-sm text-muted-foreground">{canteen.owner.email}</div>
                    <div className="text-xs mt-2">Role: {canteen.owner.role}</div>
                  </div>
                ) : <div>No owner assigned</div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">Location: {canteen?.location}</div>
                <div className="text-sm">Phone: {canteen?.phone}</div>
                <div className="text-sm">Email: {canteen?.email}</div>
                <div className="text-sm mt-2">Tags: {(canteen?.tags || []).join(', ')}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCanteenDetail;
