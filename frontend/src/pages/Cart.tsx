import { useMutation, useQuery } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  EmptyState,
  ErrorState,
  PageHeader,
  RowSkeleton,
  Spinner,
} from "@/components/common";
import { Image } from "@/components/common/Image";
import { Money } from "@/components/common/Money";
import { Button } from "@/components/ui/button";
import {
  CART,
  CLEAR_CART,
  REMOVE_FROM_CART,
  UPDATE_CART_ITEM,
} from "@/graphql/operations";

export default function Cart() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(CART);

  const [updateItem, updateState] = useMutation(UPDATE_CART_ITEM);
  const [removeItem] = useMutation(REMOVE_FROM_CART, {
    refetchQueries: [{ query: CART }],
  });
  const [clearCart, clearState] = useMutation(CLEAR_CART, {
    refetchQueries: [{ query: CART }],
  });

  const cart = data?.cart;
  const items = cart?.items ?? [];
  const issues = cart?.blockingIssues ?? [];

  const changeQuantity = async (cartItemId: number, quantity: number) => {
    try {
      await updateItem({ variables: { cartItemId, quantity } });
    } catch (mutationError) {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : "Could not update that item.",
      );
    }
  };

  if (loading && !data) {
    return (
      <div>
        <PageHeader title="Your cart" />
        <RowSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Your cart" />
        <ErrorState
          description="Could not load your cart."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Your cart" />
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add something from a canteen menu and it will show up here."
          action={
            <Button asChild>
              <Link to="/menu">Browse the menu</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Your cart"
        description={cart?.canteenName ? `From ${cart.canteenName}` : undefined}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void clearCart()}
            disabled={clearState.loading}
          >
            {clearState.loading ? <Spinner className="mr-2" /> : null}
            Clear cart
          </Button>
        }
      />

      {/* Surfaced before checkout, so a sold-out item is not a surprise at the
          payment step. */}
      {issues.length > 0 && (
        <div
          role="alert"
          className="mb-6 flex gap-3 rounded-lg border border-destructive/25 bg-destructive-soft p-4"
        >
          <AlertTriangle
            className="h-5 w-5 shrink-0 text-destructive"
            aria-hidden
          />
          <div className="text-sm">
            <p className="font-semibold text-destructive">
              Some items need attention
            </p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-muted-foreground">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <ul className="space-y-3">
          {items.map((line) => (
            <li
              key={line.id}
              className="surface flex gap-4 p-3 sm:p-4"
              aria-busy={updateState.loading}
            >
              <Image
                src={line.menuItem?.imageUrl}
                alt={line.menuItem?.name ?? "Item"}
                seed={line.menuItemId}
                aspect="square"
                className="w-20 shrink-0 sm:w-24"
              />

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-medium">
                      {line.menuItem?.name ?? "Item"}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <Money value={line.unitPrice} size="sm" /> each
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      void removeItem({ variables: { cartItemId: line.id } })
                    }
                    aria-label={`Remove ${line.menuItem?.name ?? "item"}`}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>

                {line.customizationSummary && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {line.customizationSummary}
                  </p>
                )}

                {line.note && (
                  <p className="mt-1 text-xs italic text-muted-foreground">
                    &ldquo;{line.note}&rdquo;
                  </p>
                )}

                {!line.isOrderable && (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    Not available in this quantity
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      aria-label="Decrease quantity"
                      disabled={updateState.loading}
                      onClick={() => void changeQuantity(line.id, line.quantity - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                    <span className="tabular w-7 text-center text-sm font-semibold">
                      {line.quantity}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      aria-label="Increase quantity"
                      disabled={updateState.loading}
                      onClick={() => void changeQuantity(line.id, line.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                  </div>
                  <Money value={line.lineTotal} size="lg" />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface p-5">
            <h2 className="font-display text-base font-semibold">Summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>
                  <Money value={cart?.subtotal} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd>
                  <Money value={cart?.tax} />
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5">
                <dt className="font-semibold">Total</dt>
                <dd>
                  <Money value={cart?.total} size="lg" />
                </dd>
              </div>
            </dl>

            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={issues.length > 0}
              onClick={() => navigate("/checkout")}
            >
              {issues.length > 0 ? "Resolve items to continue" : "Checkout"}
            </Button>

            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link to="/menu">Add more items</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
