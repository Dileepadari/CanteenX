import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_COMPLAINTS } from '@/gql/queries/complaints';
import { UPDATE_COMPLAINT, CLOSE_COMPLAINT, ESCALATE_COMPLAINT, ESCALATE_STALE_COMPLAINTS } from '@/gql/mutations/complaints';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ComplaintRow {
  id: number;
  selected?: boolean;
}

const AdminComplaints = () => {
  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(GET_ALL_COMPLAINTS, { fetchPolicy: 'network-only' });
  const [updateComplaint] = useMutation(UPDATE_COMPLAINT);
  const [closeComplaint] = useMutation(CLOSE_COMPLAINT);
  const [escalateComplaint] = useMutation(ESCALATE_COMPLAINT);
  const [escalateStale] = useMutation(ESCALATE_STALE_COMPLAINTS);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEscalated, setFilterEscalated] = useState<string>('any');
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => { refetch().catch(() => {}); }, []);

  const complaints = data?.getAllComplaints || [];

  const filtered = complaints.filter((c: any) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterEscalated === 'yes' && !c.isEscalated) return false;
    if (filterEscalated === 'no' && c.isEscalated) return false;
    return true;
  });

  const toggleSelect = (id: number) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const bulkEscalate = async () => {
    const ids = Object.keys(selected).filter((k) => selected[Number(k)]).map((k) => Number(k));
    if (!ids.length) return toast({ title: 'No items selected' });
    try {
      for (const id of ids) {
        await escalateComplaint({ variables: { complaintId: id } });
      }
      toast({ title: 'Escalated selected complaints' });
      refetch();
      setSelected({});
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to escalate', variant: 'destructive' });
    }
  };

  const bulkClose = async () => {
    const ids = Object.keys(selected).filter((k) => selected[Number(k)]).map((k) => Number(k));
    if (!ids.length) return toast({ title: 'No items selected' });
    try {
      for (const id of ids) {
        await closeComplaint({ variables: { complaintId: id } });
      }
      toast({ title: 'Closed selected complaints' });
      refetch();
      setSelected({});
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to close', variant: 'destructive' });
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      await updateComplaint({ variables: { complaintId: editing.id, complaintText: editing.complaintText, heading: editing.heading, status: editing.status, responseText: editing.responseText, isEscalated: editing.isEscalated } });
      toast({ title: 'Updated' });
      setEditing(null);
      refetch();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update', variant: 'destructive' });
    }
  };

  const handleEscalateStale = async () => {
    try {
      const res = await escalateStale({ variables: { days: 7 } });
      toast({ title: res.data?.escalateStaleComplaints?.message || 'Escalation complete' });
      refetch();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Complaints</h1>

        <div className="flex items-center gap-3 mb-4">
          <Input placeholder="Search heading or text" onChange={(e) => { /* local search available */ }} />
          <Select onValueChange={(v) => setFilterStatus(v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(v) => setFilterEscalated(v)}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Escalated" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={bulkEscalate}>Bulk Escalate</Button>
          <Button variant="ghost" onClick={bulkClose}>Bulk Close</Button>
          <Button variant="outline" onClick={handleEscalateStale}>Escalate stale (&gt;7d)</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div>Loading...</div> : (
              <div className="space-y-3">
                {filtered.map((c: any) => (
                  <div key={c.id} className="flex items-start justify-between p-3 border rounded">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={!!selected[c.id]} onChange={() => toggleSelect(c.id)} />
                      <div>
                        <div className="font-medium">{c.heading}</div>
                        <div className="text-sm text-muted-foreground">{c.complaintText}</div>
                        <div className="text-xs mt-1">Status: {c.status} • Escalated: {c.isEscalated ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" onClick={() => setEditing(c)}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={async () => { await escalateComplaint({ variables: { complaintId: c.id } }); refetch(); }}>Escalate</Button>
                      <Button size="sm" variant="destructive" onClick={async () => { await closeComplaint({ variables: { complaintId: c.id } }); refetch(); }}>Close</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit modal-ish area */}
        {editing && (
          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Edit Complaint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <input className="border p-2" value={editing.heading} onChange={(e) => setEditing({ ...editing, heading: e.target.value })} />
                  <textarea className="border p-2" value={editing.complaintText} onChange={(e) => setEditing({ ...editing, complaintText: e.target.value })} />
                  <input className="border p-2" value={editing.responseText || ''} onChange={(e) => setEditing({ ...editing, responseText: e.target.value })} placeholder="Response" />
                  <Select onValueChange={(v) => setEditing({ ...editing, status: v })}>
                    <SelectTrigger className="w-40"><SelectValue placeholder={editing.status} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit}>Save</Button>
                    <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminComplaints;
