import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  EmptyState,
  PageHeader,
  RowSkeleton,
  Spinner,
} from "@/components/common";
import { Image } from "@/components/common/Image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  CANTEENS,
  CREATE_CANTEEN,
  SET_CANTEEN_ACTIVE,
  USERS,
} from "@/graphql/operations";
import { cn } from "@/lib/utils";

export default function AdminCanteens() {
  const [isOpen, setOpen] = useState(false);
  const { data, loading, refetch } = useQuery(CANTEENS, {
    variables: { limit: 100 },
  });
  const [setActive] = useMutation(SET_CANTEEN_ACTIVE, {
    onCompleted: () => void refetch(),
  });

  const canteens = data?.canteens ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Canteens"
        description="Every canteen on the platform and who runs it."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            New canteen
          </Button>
        }
      />

      {loading && !data ? (
        <RowSkeleton count={4} />
      ) : canteens.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No canteens yet"
          description="Create the first canteen and assign it an owner."
          action={<Button onClick={() => setOpen(true)}>New canteen</Button>}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {canteens.map((canteen) => (
            <li key={canteen.id} className="surface overflow-hidden">
              <Image
                src={canteen.bannerUrl}
                alt={canteen.name}
                seed={canteen.id}
                aspect="video"
                rounded={false}
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{canteen.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {canteen.location ?? "No location set"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium",
                      canteen.isOpenNow
                        ? "bg-success-soft text-success"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {canteen.isOpenNow ? "Open" : "Closed"}
                  </span>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {canteen.menuItemCount} items - rating{" "}
                  {canteen.rating > 0 ? canteen.rating.toFixed(1) : "-"}
                </p>

                <label className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
                  Listed on the platform
                  <Switch
                    checked={canteen.isAcceptingOrders}
                    onCheckedChange={(checked) =>
                      void setActive({
                        variables: { canteenId: canteen.id, isActive: checked },
                      })
                    }
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}

      <NewCanteenDialog
        open={isOpen}
        onOpenChange={setOpen}
        onSaved={() => void refetch()}
      />
    </div>
  );
}

function NewCanteenDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [ownerId, setOwnerId] = useState("");

  // Only vendors can own a canteen, so the picker is scoped to them.
  const vendors = useQuery(USERS, {
    variables: { role: "VENDOR" as never, limit: 100 },
    skip: !open,
  });

  const [createCanteen, { loading }] = useMutation(CREATE_CANTEEN);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createCanteen({
        variables: {
          ownerId,
          input: {
            name: name.trim(),
            description: description.trim() || null,
            location: location.trim() || null,
          },
        },
      });
      toast.success("Canteen created");
      onSaved();
      onOpenChange(false);
      setName("");
      setDescription("");
      setLocation("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create that canteen.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">New canteen</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="new-canteen-name">Name</Label>
            <Input
              id="new-canteen-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="new-canteen-owner">Owner</Label>
            <select
              id="new-canteen-owner"
              value={ownerId}
              onChange={(event) => setOwnerId(event.target.value)}
              required
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
            >
              <option value="">Choose a vendor</option>
              {vendors.data?.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Create a vendor account first if the list is empty.
            </p>
          </div>

          <div>
            <Label htmlFor="new-canteen-location">Location</Label>
            <Input
              id="new-canteen-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="new-canteen-description">Description</Label>
            <Textarea
              id="new-canteen-description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1.5"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !ownerId}>
              {loading && <Spinner className="mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
