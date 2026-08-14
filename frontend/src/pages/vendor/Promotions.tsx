import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Plus, Tags } from "lucide-react";
import { toast } from "sonner";

import {
  EmptyState,
  PageHeader,
  PageLoader,
  RowSkeleton,
  Spinner,
} from "@/components/common";
import { rupeesToPaise } from "@/components/common/Money";
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
  CANTEEN_PROMOTIONS,
  CREATE_PROMOTION,
  SET_PROMOTION_ACTIVE,
} from "@/graphql/operations";
import { CanteenSwitcher, useManagedCanteen } from "@/lib/useManagedCanteen";
import { formatDate, localInputToIso } from "@/lib/datetime";
import { cn } from "@/lib/utils";

/**
 * Promotions, backed by a real table.
 *
 * This screen was previously 311 lines of `useState` seeded with three literal
 * promotion objects; creating one mutated React state and vanished on refresh,
 * because no promotions API existed at all.
 */
export default function VendorPromotions() {
  const { canteenId, setCanteenId, canteens, loading: loadingCanteens } =
    useManagedCanteen();
  const [isOpen, setOpen] = useState(false);

  const { data, loading, refetch } = useQuery(CANTEEN_PROMOTIONS, {
    variables: { canteenId: canteenId! },
    skip: !canteenId,
  });

  const [setActive] = useMutation(SET_PROMOTION_ACTIVE, {
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

  const promotions = data?.canteenPromotions ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Vendor"
        title="Promotions"
        description="Discount codes students can apply at checkout."
        actions={
          <>
            <CanteenSwitcher
              canteens={canteens}
              canteenId={canteenId}
              onChange={setCanteenId}
            />
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              New promotion
            </Button>
          </>
        }
      />

      {loading && !data ? (
        <RowSkeleton count={3} />
      ) : promotions.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No promotions yet"
          description="Create a code to run an offer at your canteen."
          action={<Button onClick={() => setOpen(true)}>New promotion</Button>}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {promotions.map((promotion) => (
            <li key={promotion.id} className="surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold text-primary">
                    {promotion.code}
                  </p>
                  <p className="mt-0.5 truncate font-medium">{promotion.title}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    promotion.isLiveNow
                      ? "bg-success-soft text-success"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {promotion.isLiveNow ? "Live" : "Not live"}
                </span>
              </div>

              {promotion.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {promotion.description}
                </p>
              )}

              <dl className="mt-4 grid grid-cols-2 gap-y-2 text-xs">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="text-right font-medium">
                  {promotion.type === "PERCENTAGE"
                    ? `${promotion.value / 100}%`
                    : `₹${promotion.value / 100}`}
                </dd>

                <dt className="text-muted-foreground">Minimum order</dt>
                <dd className="text-right font-medium">
                  {promotion.minOrder.formatted}
                </dd>

                <dt className="text-muted-foreground">Used</dt>
                <dd className="text-right font-medium">
                  {promotion.redemptionCount}
                  {promotion.maxRedemptions ? ` / ${promotion.maxRedemptions}` : ""}
                </dd>

                <dt className="text-muted-foreground">Runs until</dt>
                <dd className="text-right font-medium">
                  {formatDate(promotion.endsAt)}
                </dd>
              </dl>

              <label className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
                Active
                <Switch
                  checked={promotion.isActive}
                  onCheckedChange={(checked) =>
                    void setActive({
                      variables: { promotionId: promotion.id, isActive: checked },
                    })
                  }
                />
              </label>
            </li>
          ))}
        </ul>
      )}

      <PromotionDialog
        open={isOpen}
        onOpenChange={setOpen}
        canteenId={canteenId!}
        onSaved={() => void refetch()}
      />
    </div>
  );
}

function PromotionDialog({
  open,
  onOpenChange,
  canteenId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canteenId: number;
  onSaved: () => void;
}) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FLAT">("PERCENTAGE");
  const [value, setValue] = useState("10");
  const [minOrder, setMinOrder] = useState("100");
  const [maxDiscount, setMaxDiscount] = useState("50");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [perUser, setPerUser] = useState("1");

  const [createPromotion, { loading }] = useMutation(CREATE_PROMOTION);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const starts = localInputToIso(startsAt) ?? new Date().toISOString();
    const ends = localInputToIso(endsAt);
    if (!ends) {
      toast.error("Choose an end date.");
      return;
    }

    try {
      await createPromotion({
        variables: {
          canteenId,
          input: {
            code: code.trim().toUpperCase(),
            title: title.trim(),
            description: description.trim() || null,
            type: type as never,
            // Percentage is carried in basis points so 12.5% is exact.
            value:
              type === "PERCENTAGE"
                ? Math.round(Number(value) * 100)
                : rupeesToPaise(value),
            minOrderPaise: rupeesToPaise(minOrder),
            maxDiscountPaise:
              type === "PERCENTAGE" ? rupeesToPaise(maxDiscount) : null,
            startsAt: starts,
            endsAt: ends,
            maxRedemptionsPerUser: Number(perUser) || 1,
            isActive: true,
          },
        },
      });
      toast.success("Promotion created");
      onSaved();
      onOpenChange(false);
      setCode("");
      setTitle("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create that promotion.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">New promotion</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="promo-code">Code</Label>
              <Input
                id="promo-code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="LUNCH10"
                className="mt-1.5 font-mono"
                required
              />
            </div>
            <div>
              <Label htmlFor="promo-title">Title</Label>
              <Input
                id="promo-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="10% off lunch"
                className="mt-1.5"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="promo-description">Description</Label>
            <Textarea
              id="promo-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="promo-type">Type</Label>
              <select
                id="promo-type"
                value={type}
                onChange={(event) =>
                  setType(event.target.value as "PERCENTAGE" | "FLAT")
                }
                className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
              >
                <option value="PERCENTAGE">Percentage off</option>
                <option value="FLAT">Flat amount off</option>
              </select>
            </div>
            <div>
              <Label htmlFor="promo-value">
                {type === "PERCENTAGE" ? "Percent (%)" : "Amount (₹)"}
              </Label>
              <Input
                id="promo-value"
                type="number"
                min="0"
                step={type === "PERCENTAGE" ? "0.5" : "1"}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className="mt-1.5"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="promo-min">Minimum order (₹)</Label>
              <Input
                id="promo-min"
                type="number"
                min="0"
                value={minOrder}
                onChange={(event) => setMinOrder(event.target.value)}
                className="mt-1.5"
              />
            </div>
            {type === "PERCENTAGE" && (
              <div>
                <Label htmlFor="promo-cap">Maximum discount (₹)</Label>
                <Input
                  id="promo-cap"
                  type="number"
                  min="0"
                  value={maxDiscount}
                  onChange={(event) => setMaxDiscount(event.target.value)}
                  className="mt-1.5"
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="promo-start">Starts</Label>
              <Input
                id="promo-start"
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="promo-end">Ends</Label>
              <Input
                id="promo-end"
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
                className="mt-1.5"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="promo-per-user">Uses per student</Label>
            <Input
              id="promo-per-user"
              type="number"
              min="1"
              value={perUser}
              onChange={(event) => setPerUser(event.target.value)}
              className="mt-1.5"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner className="mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
