/**
 * Money rendering.
 *
 * The API sends `{ paise, formatted }` for every amount, so formatting is
 * decided once on the server rather than re-implemented (and drifted) on each
 * screen. This component only handles presentation.
 */
import { cn } from "@/lib/utils";

interface MoneyValue {
  paise: number;
  formatted: string;
}

export function Money({
  value,
  className,
  size = "base",
  muted = false,
}: {
  value: MoneyValue | null | undefined;
  className?: string;
  size?: "sm" | "base" | "lg" | "xl";
  muted?: boolean;
}) {
  const sizes = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg font-semibold",
    xl: "font-display text-2xl font-semibold",
  } as const;

  return (
    <span
      className={cn(
        "tabular",
        sizes[size],
        muted && "text-muted-foreground",
        className,
      )}
    >
      {value?.formatted ?? "₹0.00"}
    </span>
  );
}

/** Convert rupees typed into a form field to the paise the API expects. */
export function rupeesToPaise(rupees: string | number): number {
  const value = typeof rupees === "string" ? Number.parseFloat(rupees) : rupees;
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

/** Convert paise back to a rupee string for populating an edit form. */
export function paiseToRupees(paise: number | null | undefined): string {
  return ((paise ?? 0) / 100).toFixed(2);
}
