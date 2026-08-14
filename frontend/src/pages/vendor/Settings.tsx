import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "sonner";

import {
  EmptyState,
  PageHeader,
  PageLoader,
  Spinner,
} from "@/components/common";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ASSIGN_STAFF,
  CANTEEN,
  CANTEEN_STAFF,
  REMOVE_STAFF,
  UPDATE_CANTEEN,
} from "@/graphql/operations";
import { CanteenSwitcher, useManagedCanteen } from "@/lib/useManagedCanteen";

/**
 * Vendor settings, persisted.
 *
 * The previous page was 880 lines with three separate
 * `// In a real app, this would update the database` handlers and a hardcoded
 * bank account number, so nothing on it ever saved.
 */
export default function VendorSettings() {
  const { canteenId, setCanteenId, canteens, loading: loadingCanteens } =
    useManagedCanteen();

  const { data, loading } = useQuery(CANTEEN, {
    variables: { id: canteenId! },
    skip: !canteenId,
  });

  const [updateCanteen, updateState] = useMutation(UPDATE_CANTEEN, {
    refetchQueries: [{ query: CANTEEN, variables: { id: canteenId } }],
  });

  const canteen = data?.canteen;
  const [form, setForm] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [seeded, setSeeded] = useState<number | null>(null);

  // Re-seed when the active canteen changes, not just on first load.
  if (canteen && seeded !== canteen.id) {
    setForm({
      name: canteen.name,
      description: canteen.description ?? "",
      location: canteen.location ?? "",
      phone: canteen.phone ?? "",
      email: canteen.email ?? "",
      opensAt: canteen.opensAt ?? "",
      closesAt: canteen.closesAt ?? "",
      averagePreparationMinutes: String(canteen.averagePreparationMinutes),
    });
    setFlags({ isAcceptingOrders: canteen.isAcceptingOrders });
    setBanner(canteen.bannerUrl ?? null);
    setSeeded(canteen.id);
  }

  if (loadingCanteens || (loading && !data)) return <PageLoader />;
  if (canteens.length === 0) {
    return (
      <EmptyState
        title="No canteen assigned"
        description="Ask an administrator to assign you to a canteen."
      />
    );
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await updateCanteen({
        variables: {
          canteenId: canteenId!,
          input: {
            name: form.name,
            description: form.description || null,
            location: form.location || null,
            phone: form.phone || null,
            email: form.email || null,
            bannerUrl: banner,
            opensAt: form.opensAt || null,
            closesAt: form.closesAt || null,
            averagePreparationMinutes:
              Number(form.averagePreparationMinutes) || 15,
            isAcceptingOrders: flags.isAcceptingOrders,
          },
        },
      });
      toast.success("Settings saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save settings.",
      );
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Vendor"
        title="Settings"
        description="Your canteen profile, hours, and team."
        actions={
          <CanteenSwitcher
            canteens={canteens}
            canteenId={canteenId}
            onChange={setCanteenId}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={save} className="surface space-y-5 p-5">
          <h2 className="font-display text-base font-semibold">Profile</h2>

          <ImageUploadField
            kind="canteen"
            label="Banner image"
            value={banner}
            onChange={setBanner}
            aspect="wide"
          />

          <div>
            <Label htmlFor="c-name">Name</Label>
            <Input
              id="c-name"
              value={form.name ?? ""}
              onChange={(event) =>
                setForm((state) => ({ ...state, name: event.target.value }))
              }
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="c-description">Description</Label>
            <Textarea
              id="c-description"
              rows={3}
              value={form.description ?? ""}
              onChange={(event) =>
                setForm((state) => ({ ...state, description: event.target.value }))
              }
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="c-location">Location</Label>
            <Input
              id="c-location"
              value={form.location ?? ""}
              onChange={(event) =>
                setForm((state) => ({ ...state, location: event.target.value }))
              }
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="c-phone">Phone</Label>
              <Input
                id="c-phone"
                type="tel"
                value={form.phone ?? ""}
                onChange={(event) =>
                  setForm((state) => ({ ...state, phone: event.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="c-email">Email</Label>
              <Input
                id="c-email"
                type="email"
                value={form.email ?? ""}
                onChange={(event) =>
                  setForm((state) => ({ ...state, email: event.target.value }))
                }
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="c-opens">Opens</Label>
              <Input
                id="c-opens"
                type="time"
                value={form.opensAt ?? ""}
                onChange={(event) =>
                  setForm((state) => ({ ...state, opensAt: event.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="c-closes">Closes</Label>
              <Input
                id="c-closes"
                type="time"
                value={form.closesAt ?? ""}
                onChange={(event) =>
                  setForm((state) => ({ ...state, closesAt: event.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="c-prep">Avg prep (min)</Label>
              <Input
                id="c-prep"
                type="number"
                min="1"
                value={form.averagePreparationMinutes ?? ""}
                onChange={(event) =>
                  setForm((state) => ({
                    ...state,
                    averagePreparationMinutes: event.target.value,
                  }))
                }
                className="mt-1.5"
              />
            </div>
          </div>

          <label className="flex items-center justify-between gap-4 rounded-lg border border-border p-3.5">
            <span>
              <span className="block text-sm font-medium">Accepting orders</span>
              <span className="block text-xs text-muted-foreground">
                Turn off to pause new orders immediately
              </span>
            </span>
            <Switch
              checked={flags.isAcceptingOrders ?? true}
              onCheckedChange={(checked) =>
                setFlags((state) => ({ ...state, isAcceptingOrders: checked }))
              }
            />
          </label>

          <Button type="submit" disabled={updateState.loading}>
            {updateState.loading && <Spinner className="mr-2" />}
            Save settings
          </Button>
        </form>

        <StaffPanel canteenId={canteenId!} />
      </div>
    </div>
  );
}

function StaffPanel({ canteenId }: { canteenId: number }) {
  const { data, refetch } = useQuery(CANTEEN_STAFF, { variables: { canteenId } });
  const [assign, assignState] = useMutation(ASSIGN_STAFF, {
    onCompleted: () => void refetch(),
  });
  const [remove] = useMutation(REMOVE_STAFF, {
    onCompleted: () => void refetch(),
  });
  const [userId, setUserId] = useState("");

  const staff = data?.canteenStaff ?? [];

  return (
    <section className="surface space-y-4 p-5">
      <h2 className="font-display text-base font-semibold">Team</h2>
      <p className="text-sm text-muted-foreground">
        Staff can manage orders and the menu for this canteen.
      </p>

      <div className="flex gap-2">
        <Input
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="User ID to add"
          aria-label="User ID"
        />
        <Button
          variant="outline"
          disabled={!userId.trim() || assignState.loading}
          onClick={async () => {
            try {
              await assign({
                variables: { canteenId, userIds: [userId.trim()] },
              });
              toast.success("Staff member added");
              setUserId("");
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Could not add them.",
              );
            }
          }}
        >
          Add
        </Button>
      </div>

      {staff.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No staff assigned yet. An administrator can find user IDs in the admin
          console.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {staff.map((member) => (
            <li key={member.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() =>
                  void remove({
                    variables: { canteenId, userIds: [member.id] },
                  })
                }
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
