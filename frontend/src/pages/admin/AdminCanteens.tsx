import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CANTEENS } from '@/gql/queries/canteens';
import { CREATE_CANTEEN, DELETE_CANTEEN, UPDATE_CANTEEN } from '@/gql/mutations/canteens';
import { useToast } from '@/hooks/use-toast';

const AdminCanteens = () => {
  const { toast } = useToast();
  const { data, loading, refetch } = useQuery(GET_CANTEENS, { fetchPolicy: 'network-only' });
  const [createCanteen] = useMutation(CREATE_CANTEEN);
  const [deleteCanteen] = useMutation(DELETE_CANTEEN);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [emailField, setEmailField] = useState('');
  const [image, setImage] = useState('');
  const [openTimeField, setOpenTimeField] = useState('08:00');
  const [closeTimeField, setCloseTimeField] = useState('20:00');
  const [tagsField, setTagsField] = useState('');
  const [scheduleBreakfast, setScheduleBreakfast] = useState('');
  const [scheduleLunch, setScheduleLunch] = useState('');
  const [scheduleDinner, setScheduleDinner] = useState('');
  const [scheduleRegular, setScheduleRegular] = useState('');
  const [scheduleEvening, setScheduleEvening] = useState('');
  const [scheduleNight, setScheduleNight] = useState('');
  const [scheduleWeekday, setScheduleWeekday] = useState('');
  const [scheduleWeekend, setScheduleWeekend] = useState('');

  const [updateCanteen] = useMutation(UPDATE_CANTEEN);

  useEffect(() => { refetch().catch(() => {}); }, []);

  const handleCreate = async () => {
    try {
      const variables = {
        currUserId: '', // backend will validate admin via auth cookie; keep blank here
        userId: '',
        name,
        location,
        phone,
        openTime: openTimeField,
        closeTime: closeTimeField,
        description: description || null,
        image: image || null,
        email: emailField || null,
        schedule: {
          breakfast: scheduleBreakfast || null,
          lunch: scheduleLunch || null,
          dinner: scheduleDinner || null,
          regular: scheduleRegular || null,
          evening: scheduleEvening || null,
          night: scheduleNight || null,
          weekday: scheduleWeekday || null,
          weekend: scheduleWeekend || null,
        },
        tags: tagsField ? tagsField.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      const res = await createCanteen({ variables });
      if (res?.data?.createCanteen?.success) {
        toast({ title: 'Canteen created' });
        setName(''); setLocation(''); setPhone('');
        refetch();
      } else {
        toast({ title: 'Error', description: res?.data?.createCanteen?.message || 'Failed to create' , variant: 'destructive' });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Failed to create canteen', variant: 'destructive' });
    }
  };

  const handleEdit = (canteen: any) => {
    setEditingId(canteen.id);
    setName(canteen.name || '');
    setLocation(canteen.location || '');
    setPhone(canteen.phone || '');
    setDescription(canteen.description || '');
    setEmailField(canteen.email || '');
    setImage(canteen.image || '');
    setOpenTimeField(canteen.openTime || '08:00');
    setCloseTimeField(canteen.closeTime || '20:00');
    setTagsField((canteen.tags || []).join(', '));
    setScheduleBreakfast(canteen.schedule?.breakfast || '');
    setScheduleLunch(canteen.schedule?.lunch || '');
    setScheduleDinner(canteen.schedule?.dinner || '');
    setScheduleRegular(canteen.schedule?.regular || '');
    setScheduleEvening(canteen.schedule?.evening || '');
    setScheduleNight(canteen.schedule?.night || '');
    setScheduleWeekday(canteen.schedule?.weekday || '');
    setScheduleWeekend(canteen.schedule?.weekend || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName(''); setLocation(''); setPhone('');
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const variables = {
        canteenId: editingId,
        userId: '', // admin identity derived server-side
        name,
        location,
        phone,
        openTime: openTimeField,
        closeTime: closeTimeField,
        description: description || null,
        image: image || null,
        email: emailField || null,
        schedule: {
          breakfast: scheduleBreakfast || null,
          lunch: scheduleLunch || null,
          dinner: scheduleDinner || null,
          regular: scheduleRegular || null,
          evening: scheduleEvening || null,
          night: scheduleNight || null,
          weekday: scheduleWeekday || null,
          weekend: scheduleWeekend || null,
        },
        tags: tagsField ? tagsField.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      const res = await updateCanteen({ variables });
      if (res?.data?.updateCanteen?.success) {
        toast({ title: 'Canteen updated' });
        setEditingId(null);
        setName(''); setLocation(''); setPhone('');
        refetch();
      } else {
        toast({ title: 'Error', description: res?.data?.updateCanteen?.message || 'Failed to update', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Failed to update canteen', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete canteen?')) return;
    try {
      await deleteCanteen({ variables: { canteenId: id, currUserId: '' } });
      toast({ title: 'Deleted' });
      refetch();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  const canteens = data?.getAllCanteens || [];

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Manage Canteens</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Canteen' : 'Create Canteen'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Input placeholder="Email" value={emailField} onChange={(e) => setEmailField(e.target.value)} />
              <Input placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
              <Input type="text" placeholder="Tags (comma separated)" value={tagsField} onChange={(e) => setTagsField(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium">Open Time</label>
                <Input type="time" value={openTimeField} onChange={(e) => setOpenTimeField(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Close Time</label>
                <Input type="time" value={closeTimeField} onChange={(e) => setCloseTimeField(e.target.value)} />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium">Description</label>
              <textarea className="w-full border rounded p-2 mt-1" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Schedule - Breakfast</label>
                <Input placeholder="e.g. 08:00-10:00" value={scheduleBreakfast} onChange={(e) => setScheduleBreakfast(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Schedule - Lunch</label>
                <Input placeholder="e.g. 12:00-14:00" value={scheduleLunch} onChange={(e) => setScheduleLunch(e.target.value)} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Schedule - Dinner</label>
                <Input placeholder="e.g. 18:00-21:00" value={scheduleDinner} onChange={(e) => setScheduleDinner(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Schedule - Regular</label>
                <Input placeholder="e.g. 09:00-18:00" value={scheduleRegular} onChange={(e) => setScheduleRegular(e.target.value)} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Schedule - Evening</label>
                <Input placeholder="e.g. 16:00-19:00" value={scheduleEvening} onChange={(e) => setScheduleEvening(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Schedule - Night</label>
                <Input placeholder="e.g. 22:00-02:00" value={scheduleNight} onChange={(e) => setScheduleNight(e.target.value)} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Schedule - Weekday</label>
                <Input placeholder="e.g. Mon-Fri" value={scheduleWeekday} onChange={(e) => setScheduleWeekday(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Schedule - Weekend</label>
                <Input placeholder="e.g. Sat-Sun" value={scheduleWeekend} onChange={(e) => setScheduleWeekend(e.target.value)} />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {editingId ? (
                <>
                  <Button onClick={handleUpdate}>Save Changes</Button>
                  <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                </>
              ) : (
                <Button onClick={handleCreate}>Create Canteen</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Canteens</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div>Loading...</div> : (
              <div className="space-y-3">
                {canteens.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{c.name} {c.isOpen ? <span className="text-sm text-green-600">(Open)</span> : <span className="text-sm text-red-600">(Closed)</span>}</div>
                      <div className="text-sm text-muted-foreground">{c.location} — {c.openTime || 'N/A'} to {c.closeTime || 'N/A'}</div>
                      {c.tags?.length ? <div className="text-xs mt-1">Tags: {c.tags.join(', ')}</div> : null}
                      {c.description ? <div className="text-sm mt-1">{c.description}</div> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => handleEdit(c)}>Edit</Button>
                      <Button onClick={() => window.location.href = `/admin/canteens/${c.id}`}>Open</Button>
                      <Button variant="destructive" onClick={() => handleDelete(c.id)}>Delete</Button>
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

export default AdminCanteens;
