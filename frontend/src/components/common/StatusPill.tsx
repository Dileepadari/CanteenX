/**
 * Status pills.
 *
 * Each state carries an icon as well as a colour, so the meaning survives for
 * colour-blind users and in greyscale print - colour alone is not an
 * accessible signal.
 */
import {
  Ban,
  CheckCircle2,
  ChefHat,
  CircleDashed,
  Clock,
  CreditCard,
  PackageCheck,
  RefreshCcw,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "accent" | "success" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-primary-muted text-primary border-primary/20",
  accent: "bg-accent-soft text-accent border-accent/25",
  success: "bg-success-soft text-success border-success/25",
  danger: "bg-destructive-soft text-destructive border-destructive/25",
};

interface Descriptor {
  label: string;
  tone: Tone;
  icon: LucideIcon;
}

export const ORDER_STATUS: Record<string, Descriptor> = {
  PENDING: { label: "Pending", tone: "neutral", icon: CircleDashed },
  CONFIRMED: { label: "Confirmed", tone: "info", icon: CheckCircle2 },
  PREPARING: { label: "Preparing", tone: "accent", icon: ChefHat },
  READY: { label: "Ready for pickup", tone: "success", icon: PackageCheck },
  COMPLETED: { label: "Completed", tone: "success", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", tone: "danger", icon: XCircle },
};

export const PAYMENT_STATUS: Record<string, Descriptor> = {
  PENDING: { label: "Unpaid", tone: "neutral", icon: Clock },
  PROCESSING: { label: "Processing", tone: "info", icon: CreditCard },
  PAID: { label: "Paid", tone: "success", icon: CheckCircle2 },
  FAILED: { label: "Failed", tone: "danger", icon: XCircle },
  REFUNDED: { label: "Refunded", tone: "info", icon: RefreshCcw },
};

export const COMPLAINT_STATUS: Record<string, Descriptor> = {
  OPEN: { label: "Open", tone: "accent", icon: CircleDashed },
  IN_REVIEW: { label: "In review", tone: "info", icon: RefreshCcw },
  ESCALATED: { label: "Escalated", tone: "danger", icon: Ban },
  RESOLVED: { label: "Resolved", tone: "success", icon: CheckCircle2 },
  CLOSED: { label: "Closed", tone: "neutral", icon: CheckCircle2 },
};

export const BULK_STATUS: Record<string, Descriptor> = {
  REQUESTED: { label: "Requested", tone: "neutral", icon: CircleDashed },
  QUOTED: { label: "Quoted", tone: "accent", icon: CreditCard },
  CONFIRMED: { label: "Confirmed", tone: "info", icon: CheckCircle2 },
  FULFILLED: { label: "Fulfilled", tone: "success", icon: PackageCheck },
  DECLINED: { label: "Declined", tone: "danger", icon: XCircle },
  CANCELLED: { label: "Cancelled", tone: "danger", icon: Ban },
};

export function StatusPill({
  status,
  map = ORDER_STATUS,
  size = "base",
  className,
}: {
  status: string | null | undefined;
  map?: Record<string, Descriptor>;
  size?: "sm" | "base";
  className?: string;
}) {
  const key = String(status ?? "").toUpperCase();
  const descriptor = map[key] ?? {
    label: key ? key.replace(/_/g, " ").toLowerCase() : "Unknown",
    tone: "neutral" as Tone,
    icon: CircleDashed,
  };
  const Icon = descriptor.icon;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium capitalize",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        TONES[descriptor.tone],
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {descriptor.label}
    </span>
  );
}

/** Ordered lifecycle used to render the tracking timeline. */
export const ORDER_TIMELINE = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
] as const;
