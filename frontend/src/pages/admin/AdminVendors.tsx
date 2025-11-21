import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS_BY_ROLE } from '@/gql/queries/user';
import { CREATE_VENDOR, UPDATE_USER, DELETE_USER } from '@/gql/mutations/adminUsers';
import { useToast } from '@/hooks/use-toast';

const AdminVendors = () => {
  const { toast } = useToast();
  const { data, loading, refetch } = useQuery(GET_USERS_BY_ROLE, { variables: { role: 'vendor' }, fetchPolicy: 'network-only' });
  const [createVendor] = useMutation(CREATE_VENDOR);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('vendorpass');
  const [editingId, setEditingId] = useState<string | null>(null);

  const vendors = data?.getUsersByRole || [];

  useEffect(() => {
    // ensure latest list when component mounts
    refetch().catch(() => {});
  }, []);

  const handleCreate = async () => {
    try {
      const { data } = await createVendor({ variables: { name, email, password, role: 'vendor' } });
      if (data?.createVendor) {
        toast({ title: 'Vendor created', description: `${data.createVendor.name} created` });
        setName(''); setEmail(''); setPassword('vendorpass');
        refetch();
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Failed to create vendor', variant: 'destructive' });
    }
  };

  const handleEdit = (v: any) => {
    setEditingId(v.id);
    setName(v.name || '');
    setEmail(v.email || '');
    setPassword('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName(''); setEmail(''); setPassword('vendorpass');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await updateUser({ variables: { userId: editingId, name, email, role: 'vendor' } });
      toast({ title: 'Updated', description: 'Vendor updated' });
      setEditingId(null);
      setName(''); setEmail(''); setPassword('vendorpass');
      refetch();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Failed to update vendor', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete vendor? This action cannot be undone.')) return;
    try {
      await deleteUser({ variables: { userId: id } });
      toast({ title: 'Deleted', description: 'Vendor removed' });
      refetch();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Failed to delete vendor', variant: 'destructive' });
    }
  };

  const handleMakeStaff = async (id: string) => {
    try {
      await updateUser({ variables: { userId: id, role: 'staff' } });
      toast({ title: 'Updated', description: 'Vendor promoted to staff' });
      refetch();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Failed to update user', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Manage Vendors & Staff</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Vendor' : 'Create Vendor'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="mt-4">
              {editingId ? (
                <>
                  <Button onClick={handleSaveEdit}>Save Changes</Button>
                  <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                </>
              ) : (
                <Button onClick={handleCreate}>Create Vendor</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : vendors.length === 0 ? (
              <div>No vendors found.</div>
            ) : (
              <div className="space-y-3">
                {vendors.map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{v.name}</div>
                      <div className="text-sm text-muted-foreground">{v.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => handleEdit(v)}>Edit</Button>
                      <Button variant="outline" onClick={() => handleMakeStaff(v.id)}>Make Staff</Button>
                      <Button variant="destructive" onClick={() => handleDelete(v.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminVendors;
