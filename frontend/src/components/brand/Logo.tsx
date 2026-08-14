/**
 * CanteenX brand marks.
 *
 * Drawn as a sibling of the ADK DEV logo - one flat colour, thick geometric
 * ribbon, circular containment, no gradients - so the two read as related
 * without CanteenX wearing a personal dev brand as its product logo.
 *
 * Everything uses `currentColor`, so the mark inverts for free in dark mode
 * instead of needing a second asset.
 */
import { cn } from "@/lib/utils";

interface MarkProps {
  className?: string;
  title?: string;
}

/**
 * The mark: a bowl formed from a broken ring, with a rising steam stroke.
 * The gap in the ring is the "X" cut, echoing the ADK ribbon's open circle.
 */
export function CanteenXMark({ className, title = "CanteenX" }: MarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className={cn("h-8 w-8", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring, opened at the top-right so the steam can escape. */}
      <path
        d="M40.5 18.5A18 18 0 1 1 29.5 6.6"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* The bowl: a thick chord across the lower half. */}
      <path
        d="M11 26.5h26a13 13 0 0 1-26 0Z"
        fill="currentColor"
      />
      {/* Steam - two strokes, offset, suggesting an X where they cross. */}
      <path
        d="M22 16.5c-2.6-2.2-2.6-4.9 0-7.1"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M30.5 16.5c-2.6-2.2-2.6-4.9 0-7.1"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

/** Mark plus wordmark, for headers and the sign-in card. */
export function CanteenXLogo({
  className,
  markClassName,
  showTagline = false,
}: {
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <CanteenXMark className={cn("h-8 w-8 text-primary", markClassName)} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-semibold tracking-tight">
          Canteen<span className="text-accent">X</span>
        </span>
        {showTagline && (
          <span className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Skip the queue
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * "A product by ADK DEV" - the portfolio brand, used as attribution in the
 * footer rather than as the product's own logo.
 */
export function AdkDevAttribution({ className }: { className?: string }) {
  return (
    <a
      href="https://dileepadari.dev"
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <span>A product by</span>
      <svg
        viewBox="0 0 48 48"
        role="img"
        aria-label="ADK DEV"
        className="h-5 w-5 transition-transform group-hover:scale-110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* The ADK ribbon mark, redrawn as a single-colour SVG. */}
        <path
          d="M24 4a20 20 0 0 0-20 20h8a12 12 0 0 1 12-12h12a20 20 0 0 0-12-8Z"
          fill="currentColor"
        />
        <path
          d="M24 14a10 10 0 0 0-10 10h8a4 4 0 0 1 4-4h16a20 20 0 0 0-4-6H24Z"
          fill="currentColor"
        />
        <path
          d="M24 44a20 20 0 0 0 20-20h-8a12 12 0 0 1-12 12H12a20 20 0 0 0 12 8Z"
          fill="currentColor"
        />
        <path
          d="M24 34a10 10 0 0 0 10-10h-8a4 4 0 0 1-4 4H6a20 20 0 0 0 4 6h14Z"
          fill="currentColor"
        />
      </svg>
      <span className="font-semibold tracking-tight">ADK DEV</span>
    </a>
  );
}
