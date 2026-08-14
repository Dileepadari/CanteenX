/**
 * The one menu item card.
 *
 * The previous build had five overlapping implementations of this component
 * (~772 lines of which were unreachable), each with a different prop shape.
 * This is the only one.
 */
import { useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import { Flame, Leaf, Minus, Plus, Star } from "lucide-react";
import { toast } from "sonner";

import { Image } from "@/components/common/Image";
import { Money } from "@/components/common/Money";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ADD_TO_CART, CART } from "@/graphql/operations";
import type { MenuItemsQuery } from "@/graphql/generated/graphql";
import { useSession } from "@/stores/session";
import { cn } from "@/lib/utils";

type MenuItem = MenuItemsQuery["menuItems"][number];

/** Selected option ids, keyed by group id. */
type Selection = Record<string, string[]>;

function defaultSelection(item: MenuItem): Selection {
  const selection: Selection = {};
  for (const group of item.customizationGroups) {
    const defaults = group.options.filter((option) => option.isDefault);
    if (defaults.length > 0) {
      selection[group.id] = defaults.map((option) => option.id);
    }
  }
  return selection;
}

export function MenuItemCard({
  item,
  onRequireSignIn,
}: {
  item: MenuItem;
  onRequireSignIn?: () => void;
}) {
  const { user } = useSession();
  const [isOpen, setOpen] = useState(false);

  const needsChoices = item.customizationGroups.length > 0;

  const [addToCart, { loading }] = useMutation(ADD_TO_CART, {
    refetchQueries: [{ query: CART }],
  });

  const submit = async (selection: Selection, quantity: number, note: string) => {
    try {
      await addToCart({
        variables: {
          input: {
            menuItemId: item.id,
            quantity,
            customizations: selection,
            note: note.trim() || null,
          },
        },
      });
      toast.success(`${item.name} added to your cart`);
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not add that item.";

      // A cart holding another canteen's items is a normal, recoverable state,
      // so it gets an action rather than a dead-end error.
      if (message.toLowerCase().includes("another canteen")) {
        toast.error("Your cart has items from another canteen", {
          action: {
            label: "Replace cart",
            onClick: () => {
              void addToCart({
                variables: {
                  input: {
                    menuItemId: item.id,
                    quantity,
                    customizations: selection,
                    note: note.trim() || null,
                    replaceCart: true,
                  },
                },
                refetchQueries: [{ query: CART }],
              }).then(() => {
                toast.success(`Cart replaced with ${item.name}`);
                setOpen(false);
              });
            },
          },
        });
        return;
      }
      toast.error(message);
    }
  };

  const handleAdd = () => {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    if (needsChoices) {
      setOpen(true);
      return;
    }
    void submit({}, 1, "");
  };

  const soldOut = !item.isOrderable;

  return (
    <>
      <article
        className={cn(
          "surface hover-lift group flex flex-col overflow-hidden",
          soldOut && "opacity-70",
        )}
      >
        <div className="relative">
          <Image
            src={item.imageUrl}
            alt={item.name}
            seed={item.id}
            aspect="video"
            rounded={false}
            className="group-hover:[&>img]:scale-105"
          />
          <div className="absolute left-2 top-2 flex gap-1.5">
            {item.isVegetarian && (
              <span
                title="Vegetarian"
                className="rounded-md bg-success/90 p-1 text-white"
              >
                <Leaf className="h-3 w-3" aria-hidden />
                <span className="sr-only">Vegetarian</span>
              </span>
            )}
            {item.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-md bg-accent/90 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-accent-foreground">
                <Flame className="h-3 w-3" aria-hidden />
                Popular
              </span>
            )}
          </div>
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold">
                {item.isAvailable ? "Sold out" : "Unavailable"}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-base font-semibold leading-tight">
              {item.name}
            </h3>
            {item.ratingCount > 0 && (
              <span className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-accent text-accent" aria-hidden />
                {item.rating.toFixed(1)}
              </span>
            )}
          </div>

          {item.description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          )}

          {item.canteenName && (
            <p className="mt-2 text-xs text-muted-foreground">{item.canteenName}</p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            <div>
              <Money value={item.price} size="lg" />
              {typeof item.stockCount === "number" && item.stockCount > 0 && (
                <p className="text-[0.6875rem] text-muted-foreground">
                  {item.stockCount} left
                </p>
              )}
            </div>
            <Button size="sm" onClick={handleAdd} disabled={soldOut || loading}>
              {needsChoices ? "Choose" : "Add"}
            </Button>
          </div>
        </div>
      </article>

      {needsChoices && (
        <CustomizeDialog
          item={item}
          open={isOpen}
          onOpenChange={setOpen}
          onSubmit={submit}
          submitting={loading}
        />
      )}
    </>
  );
}

function CustomizeDialog({
  item,
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: {
  item: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (selection: Selection, quantity: number, note: string) => void;
  submitting: boolean;
}) {
  const [selection, setSelection] = useState<Selection>(() => defaultSelection(item));
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  /** Preview the price locally. The server recomputes it authoritatively. */
  const unitPaise = useMemo(() => {
    let total = item.price.paise;
    for (const group of item.customizationGroups) {
      for (const optionId of selection[group.id] ?? []) {
        const option = group.options.find((candidate) => candidate.id === optionId);
        total += option?.priceDelta.paise ?? 0;
      }
    }
    return total;
  }, [item, selection]);

  const missingRequired = item.customizationGroups.filter(
    (group) => group.required && (selection[group.id] ?? []).length === 0,
  );

  const toggle = (groupId: string, optionId: string, single: boolean) => {
    setSelection((current) => {
      const chosen = current[groupId] ?? [];
      if (single) return { ...current, [groupId]: [optionId] };
      return {
        ...current,
        [groupId]: chosen.includes(optionId)
          ? chosen.filter((id) => id !== optionId)
          : [...chosen, optionId],
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{item.name}</DialogTitle>
          {item.description && (
            <DialogDescription>{item.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-5">
          {item.customizationGroups.map((group) => {
            const single = group.selection === "single";
            return (
              <fieldset key={group.id}>
                <legend className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  {group.label}
                  {group.required && (
                    <span className="rounded bg-destructive-soft px-1.5 py-0.5 text-[0.625rem] font-medium text-destructive">
                      Required
                    </span>
                  )}
                </legend>
                <div className="space-y-1.5">
                  {group.options.map((option) => {
                    const checked = (selection[group.id] ?? []).includes(option.id);
                    return (
                      <label
                        key={option.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                          checked
                            ? "border-primary bg-primary-muted"
                            : "border-border hover:bg-secondary",
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type={single ? "radio" : "checkbox"}
                            name={group.id}
                            checked={checked}
                            onChange={() => toggle(group.id, option.id, single)}
                            className="h-4 w-4 accent-[hsl(var(--primary))]"
                          />
                          {option.label}
                        </span>
                        {option.priceDelta.paise > 0 && (
                          <span className="tabular text-xs text-muted-foreground">
                            +{option.priceDelta.formatted}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          <div>
            <label
              htmlFor={`note-${item.id}`}
              className="mb-1.5 block text-sm font-semibold"
            >
              Note for the kitchen
            </label>
            <Textarea
              id={`note-${item.id}`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Less spicy, no onion..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-4 sm:justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              <Minus className="h-4 w-4" aria-hidden />
            </Button>
            <span className="tabular w-8 text-center text-sm font-semibold">
              {quantity}
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label="Increase quantity"
              onClick={() => setQuantity((value) => Math.min(50, value + 1))}
            >
              <Plus className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          <Button
            onClick={() => onSubmit(selection, quantity, note)}
            disabled={submitting || missingRequired.length > 0}
            className="flex-1 sm:flex-none"
          >
            {missingRequired.length > 0
              ? `Choose ${missingRequired[0]?.label ?? "options"}`
              : `Add - ₹${((unitPaise * quantity) / 100).toFixed(2)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
