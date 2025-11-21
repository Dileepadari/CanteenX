import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { GET_USERS_BY_ROLE, SEARCH_USERS } from '@/gql/queries/user';
import { GET_CANTEENS } from '@/gql/queries/canteens';
import { ASSIGN_STAFF_TO_CANTEEN, REMOVE_STAFF_FROM_CANTEEN } from '@/gql/mutations/adminUsers';
import { UPDATE_USER, DELETE_USER } from '@/gql/mutations/adminUsers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const AdminStaff = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  // Load staff and vendors separately and combine
  const { data: staffData, refetch: refetchStaff } = useQuery(GET_USERS_BY_ROLE, { variables: { role: 'staff' }, fetchPolicy: 'network-only' });
  const { data: vendorData, refetch: refetchVendors } = useQuery(GET_USERS_BY_ROLE, { variables: { role: 'vendor' }, fetchPolicy: 'network-only' });
  const { data: canteensData } = useQuery(GET_CANTEENS, { fetchPolicy: 'cache-first' });
  const canteens = canteensData?.getAllCanteens || [];
  const [selectedCanteen, setSelectedCanteen] = useState<number | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [assignStaff] = useMutation(ASSIGN_STAFF_TO_CANTEEN);
  const [removeStaff] = useMutation(REMOVE_STAFF_FROM_CANTEEN);
  const [searchUsers, { data: searchData }] = useLazyQuery(SEARCH_USERS as any);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);

  useEffect(() => {
    // noop
  }, []);

  const combined = [ ...(staffData?.getUsersByRole || []), ...(vendorData?.getUsersByRole || []) ];
  const searchResults = (searchData as any)?.searchUsers;
  const users = searchResults && searchResults.length ? searchResults : combined;

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const handleAssignSelected = async () => {
    if (!selectedCanteen) return toast({ title: 'Select a canteen first' });
    if (!selectedUserIds.length) return toast({ title: 'Select at least one user' });
    try {
      const res = await assignStaff({ variables: { canteenId: selectedCanteen, userIds: selectedUserIds } });
      toast({ title: 'Assigned', description: res?.data?.assignStaffToCanteen });
      setSelectedUserIds([]);
      await refetchStaff();
      await refetchVendors();
    } catch (err) {
      toast({ title: 'Assign failed', description: String(err) });
    }
  };

  const handleRemoveSelected = async () => {
    if (!selectedCanteen) return toast({ title: 'Select a canteen first' });
    if (!selectedUserIds.length) return toast({ title: 'Select at least one user' });
    try {
      const res = await removeStaff({ variables: { canteenId: selectedCanteen, userIds: selectedUserIds } });
      toast({ title: 'Removed', description: res?.data?.removeStaffFromCanteen });
      setSelectedUserIds([]);
      await refetchStaff();
      await refetchVendors();
    } catch (err) {
      toast({ title: 'Remove failed', description: String(err) });
    }
  };

  const handleSearch = async () => {
    if (!query) {
      await refetchStaff();
      await refetchVendors();
      return;
    }
    try {
      const res = await searchUsers({ variables: { query } });
      // write results into local state by replacing users for the view
      // searchUsers returns array in searchUsers
      // We'll show results directly from mutation response
      // eslint-disable-next-line no-console
      console.log(res);
    } catch (err) {
      toast({ title: 'Search failed', description: String(err) });
    }
  };

  const handleToggleActive = async (u: any) => {
    try {
      await updateUser({ variables: { userId: String(u.id), name: u.name, email: u.email, role: u.role } });
      toast({ title: 'Updated user' });
      await refetchStaff();
      await refetchVendors();
    } catch (err) {
      toast({ title: 'Update failed', description: String(err) });
    }
  };

  const handleDelete = async (u: any) => {
    if (!confirm(`Delete user ${u.email}? This is irreversible.`)) return;
    try {
      await deleteUser({ variables: { userId: String(u.id) } });
      toast({ title: 'Deleted user' });
      await refetchStaff();
      await refetchVendors();
    } catch (err) {
      toast({ title: 'Delete failed', description: String(err) });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Staff & Vendors</h1>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Search users & Assign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 items-start">
              <Input placeholder="Search by name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={handleSearch}>Search</Button>
                <Button variant="ghost" onClick={async () => { setQuery(''); await refetchStaff(); await refetchVendors(); }}>Reset</Button>
              </div>
              <div className="ml-auto w-full md:w-64">
                <label className="text-sm">Select Canteen</label>
                <select className="block w-full mt-1 p-2 border rounded" value={selectedCanteen ?? ''} onChange={(e) => setSelectedCanteen(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">-- choose canteen --</option>
                  {canteens.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAssignSelected}>Assign Selected to Canteen</Button>
                <Button variant="destructive" onClick={handleRemoveSelected}>Remove Selected from Canteen</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left"><th className="w-8">Sel</th><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} className="border-t">
                      <td>
                        <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleSelectUser(u.id)} />
                      </td>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{String(u.isActive ?? true)}</td>
                      <td className="flex gap-2">
                        <Button size="sm" onClick={() => handleToggleActive(u)}>Refresh</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(u)}>Delete</Button>
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

export default AdminStaff;
