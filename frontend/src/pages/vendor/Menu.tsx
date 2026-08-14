import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import {
  EmptyState,
  PageHeader,
  PageLoader,
  RowSkeleton,
  Spinner,
} from "@/components/common";
import { Image } from "@/components/common/Image";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import { paiseToRupees, rupeesToPaise } from "@/components/common/Money";
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
  CANTEEN_MENU,
  CREATE_MENU_ITEM,
  DELETE_MENU_ITEM,
  UPDATE_MENU_ITEM,
} from "@/graphql/operations";
import type { CanteenMenuQuery } from "@/graphql/generated/graphql";
import { CanteenSwitcher, useManagedCanteen } from "@/lib/useManagedCanteen";

type Item = CanteenMenuQuery["canteenMenu"][number];

interface FormState {
  name: string;
  description: string;
  priceRupees: string;
  category: string;
  imageUrl: string | null;
  isVegetarian: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationMinutes: string;
}

const EMPTY: FormState = {
  name: "",
  description: "",
  priceRupees: "",
  category: "",
  imageUrl: null,
  isVegetarian: false,
  isAvailable: true,
  isFeatured: false,
  preparationMinutes: "15",
};

export default function VendorMenu() {
  const { canteenId, setCanteenId, canteens, loading: loadingCanteens } =
    useManagedCanteen();

  const { data, loading, refetch } = useQuery(CANTEEN_MENU, {
    variables: { canteenId: canteenId! },
    skip: !canteenId,
  });

  const [editing, setEditing] = useState<Item | null>(null);
  const [isOpen, setOpen] = useState(false);

  const [deleteItem] = useMutation(DELETE_MENU_ITEM, {
    onCompleted: () => void refetch(),
  });

  if (loadingCanteens) return <PageLoader />;
  if (canteens.length === 0) {
    return (
      <EmptyState
        title="No canteen assigned"
        description="Ask an administrator to assign you to a canteen."
      />
    );
  }

  const items = data?.canteenMenu ?? [];

  const remove = async (item: Item) => {
    if (!window.confirm(`Delete "${item.name}" from the menu?`)) return;
    try {
      await deleteItem({ variables: { itemId: item.id } });
      toast.success("Menu item deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete that item.",
      );
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Vendor"
        title="Menu"
        description="Add, edit, and publish the dishes you sell."
        actions={
          <>
            <CanteenSwitcher
              canteens={canteens}
              canteenId={canteenId}
              onChange={setCanteenId}
            />
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              Add item
            </Button>
          </>
        }
      />

      {loading && !data ? (
        <RowSkeleton count={5} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No menu items yet"
          description="Add your first dish to start taking orders."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              Add item
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="surface flex gap-3 p-3">
              <Image
                src={item.imageUrl}
                alt={item.name}
                seed={item.id}
                aspect="square"
                className="w-20 shrink-0"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-medium">{item.name}</p>
                  <span className="tabular shrink-0 text-sm font-semibold">
                    {item.price.formatted}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.category ?? "Uncategorised"}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {!item.isAvailable && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
                      Hidden
                    </span>
                  )}
                  {item.isFeatured && (
                    <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[0.625rem] font-medium text-accent">
                      Featured
                    </span>
                  )}
                  {item.isVegetarian && (
                    <span className="rounded bg-success-soft px-1.5 py-0.5 text-[0.625rem] font-medium text-success">
                      Veg
                    </span>
                  )}
                </div>

                <div className="mt-auto flex gap-1 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(item);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" aria-hidden />
                    Edit
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${item.name}`}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => void remove(item)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ItemDialog
        key={editing?.id ?? "new"}
        open={isOpen}
        onOpenChange={setOpen}
        item={editing}
        canteenId={canteenId!}
        onSaved={() => void refetch()}
      />
    </div>
  );
}

function ItemDialog({
  open,
  onOpenChange,
  item,
  canteenId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  canteenId: number;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    item
      ? {
          name: item.name,
          description: item.description ?? "",
          priceRupees: paiseToRupees(item.price.paise),
          category: item.category ?? "",
          imageUrl: item.imageUrl ?? null,
          isVegetarian: item.isVegetarian,
          isAvailable: item.isAvailable,
          isFeatured: item.isFeatured,
          preparationMinutes: String(item.preparationMinutes),
        }
      : EMPTY,
  );

  const [createItem, createState] = useMutation(CREATE_MENU_ITEM);
  const [updateItem, updateState] = useMutation(UPDATE_MENU_ITEM);
  const busy = createState.loading || updateState.loading;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const input = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      pricePaise: rupeesToPaise(form.priceRupees),
      category: form.category.trim() || null,
      imageUrl: form.imageUrl,
      isVegetarian: form.isVegetarian,
      isAvailable: form.isAvailable,
      isFeatured: form.isFeatured,
      preparationMinutes: Number(form.preparationMinutes) || 15,
    };

    if (!input.name || input.pricePaise <= 0) {
      toast.error("A name and a price above zero are required.");
      return;
    }

    try {
      if (item) {
        await updateItem({ variables: { itemId: item.id, input } });
        toast.success("Menu item updated");
      } else {
        await createItem({ variables: { canteenId, input } });
        toast.success("Menu item added");
      }
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save that item.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {item ? "Edit menu item" : "Add menu item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <ImageUploadField
            kind="menu"
            label="Photo"
            value={form.imageUrl}
            onChange={(url) => set("imageUrl", url)}
          />

          <div>
            <Label htmlFor="item-name">Name</Label>
            <Input
              id="item-name"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="item-description">Description</Label>
            <Textarea
              id="item-description"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              rows={2}
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="item-price">Price (₹)</Label>
              <Input
                id="item-price"
                type="number"
                min="0"
                step="0.01"
                value={form.priceRupees}
                onChange={(event) => set("priceRupees", event.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="item-category">Category</Label>
              <Input
                id="item-category"
                value={form.category}
                onChange={(event) => set("category", event.target.value)}
                placeholder="Snacks"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="item-prep">Prep (min)</Label>
              <Input
                id="item-prep"
                type="number"
                min="1"
                value={form.preparationMinutes}
                onChange={(event) => set("preparationMinutes", event.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            {(
              [
                ["isAvailable", "Visible on the menu"],
                ["isVegetarian", "Vegetarian"],
                ["isFeatured", "Feature on the home page"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between gap-4 rounded-lg border border-border px-3.5 py-2.5 text-sm"
              >
                {label}
                <Switch
                  checked={form[key]}
                  onCheckedChange={(checked) => set(key, checked)}
                />
              </label>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Spinner className="mr-2" />}
              {item ? "Save changes" : "Add item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
