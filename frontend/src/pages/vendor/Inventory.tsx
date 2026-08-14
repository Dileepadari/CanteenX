import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Boxes, Infinity as InfinityIcon } from "lucide-react";
import { toast } from "sonner";

import {
  EmptyState,
  PageHeader,
  PageLoader,
  RowSkeleton,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CANTEEN_MENU, SET_MENU_ITEM_STOCK } from "@/graphql/operations";
import { CanteenSwitcher, useManagedCanteen } from "@/lib/useManagedCanteen";
import { cn } from "@/lib/utils";

/**
 * Stock management, backed by the server.
 *
 * The previous inventory screen kept counts in `localStorage` under
 * `canteenx_inventory_v1` with a comment explaining it avoided backend schema
 * changes - so stock was per-browser and invisible to customers.
 */
export default function VendorInventory() {
  const { canteenId, setCanteenId, canteens, loading: loadingCanteens } =
    useManagedCanteen();

  const { data, loading } = useQuery(CANTEEN_MENU, {
    variables: { canteenId: canteenId! },
    skip: !canteenId,
  });

  const [setStock] = useMutation(SET_MENU_ITEM_STOCK);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const save = async (itemId: number, raw: string) => {
    const trimmed = raw.trim();
    // Empty means "stop tracking stock", which is different from zero.
    const value = trimmed === "" ? null : Number(trimmed);
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      toast.error("Enter a number of 0 or more, or leave it blank.");
      return;
    }

    try {
      await setStock({ variables: { itemId, stockCount: value } });
      toast.success("Stock updated");
      setDrafts((current) => {
        const next = { ...current };
        delete next[itemId];
        return next;
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update stock.",
      );
    }
  };

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
  const tracked = items.filter((item) => item.stockCount !== null);
  const lowStock = tracked.filter(
    (item) => (item.stockCount ?? 0) > 0 && (item.stockCount ?? 0) <= 5,
  );
  const soldOut = tracked.filter((item) => item.stockCount === 0);

  return (
    <div>
      <PageHeader
        eyebrow="Vendor"
        title="Inventory"
        description="Set a count to track stock, or leave it blank for unlimited."
        actions={
          <CanteenSwitcher
            canteens={canteens}
            canteenId={canteenId}
            onChange={setCanteenId}
          />
        }
      />

      {(lowStock.length > 0 || soldOut.length > 0) && (
        <div className="mb-6 flex flex-wrap gap-3 text-sm">
          {soldOut.length > 0 && (
            <span className="rounded-lg bg-destructive-soft px-3 py-2 font-medium text-destructive">
              {soldOut.length} sold out
            </span>
          )}
          {lowStock.length > 0 && (
            <span className="rounded-lg bg-warning-soft px-3 py-2 font-medium text-warning">
              {lowStock.length} running low
            </span>
          )}
        </div>
      )}

      {loading && !data ? (
        <RowSkeleton count={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No menu items yet"
          description="Add items to the menu before tracking stock."
        />
      ) : (
        <ul className="surface divide-y divide-border">
          {items.map((item) => {
            const draft = drafts[item.id];
            const current =
              draft ?? (item.stockCount === null ? "" : String(item.stockCount));
            const dirty = draft !== undefined;
            const stock = item.stockCount ?? 0;

            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category ?? "Uncategorised"} - {item.price.formatted}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {item.stockCount === null ? (
                    <span
                      title="Not stock-tracked"
                      className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                    >
                      <InfinityIcon className="h-3.5 w-3.5" aria-hidden />
                      Unlimited
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-medium",
                        stock === 0
                          ? "bg-destructive-soft text-destructive"
                          : stock <= 5
                            ? "bg-warning-soft text-warning"
                            : "bg-success-soft text-success",
                      )}
                    >
                      {stock} left
                    </span>
                  )}

                  <Input
                    value={current}
                    onChange={(event) =>
                      setDrafts((state) => ({
                        ...state,
                        [item.id]: event.target.value,
                      }))
                    }
                    placeholder="Unlimited"
                    inputMode="numeric"
                    aria-label={`Stock for ${item.name}`}
                    className="tabular h-9 w-24"
                  />

                  <Button
                    size="sm"
                    variant={dirty ? "default" : "outline"}
                    disabled={!dirty}
                    onClick={() => void save(item.id, current)}
                  >
                    Save
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
