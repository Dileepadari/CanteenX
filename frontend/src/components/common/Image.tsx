/**
 * Image with a branded fallback.
 *
 * Replaces `lib/image.ts`, which hot-linked `picsum.photos` for every food
 * photo in the app - so a biryani rendered as a landscape or a stranger's
 * face, on an uncontrolled third party that campus networks block.
 *
 * Fallbacks are now local, deterministic, and obviously placeholders.
 */
import { useState } from "react";

import { cn } from "@/lib/utils";

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  alt: string;
  /** Stable value (an id or name) so the fallback tint is consistent per item. */
  seed?: string | number;
  aspect?: "square" | "video" | "wide" | "none";
  rounded?: boolean;
}

const ASPECT: Record<string, string> = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[16/7]",
  none: "",
};

/**
 * Placeholder tints, drawn only from the brand palette.
 *
 * Hashing the seed across the full 360-degree wheel produced greens and teals
 * that fought with the violet-and-saffron identity, so the ramp is restricted
 * to violet -> plum -> saffron with a couple of neighbours for variety.
 */
const PLACEHOLDER_HUES = [274, 288, 305, 320, 24, 34, 44] as const;

/** Deterministic index from the seed, so an item's tint never changes. */
function seedIndex(seed: string | number | undefined, length: number): number {
  const text = String(seed ?? "canteenx");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 100_003;
  }
  return hash % length;
}

function Placeholder({ seed, label }: { seed?: string | number; label: string }) {
  const hue = PLACEHOLDER_HUES[seedIndex(seed, PLACEHOLDER_HUES.length)] ?? 274;
  return (
    <div
      aria-hidden
      className="flex h-full w-full items-center justify-center"
      style={{
        background: `linear-gradient(135deg,
          hsl(${hue} 32% 90%) 0%,
          hsl(${hue + 14} 38% 82%) 100%)`,
      }}
    >
      <span className="select-none font-display text-2xl font-semibold text-black/20">
        {label.slice(0, 1).toUpperCase()}
      </span>
    </div>
  );
}

export function Image({
  src,
  alt,
  seed,
  aspect = "video",
  rounded = true,
  className,
  ...rest
}: ImageProps) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !src || failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        ASPECT[aspect],
        rounded && "rounded-lg",
        className,
      )}
    >
      {showPlaceholder ? (
        <Placeholder seed={seed ?? alt} label={alt} />
      ) : (
        <img
          src={src}
          alt={alt}
          // Explicit lazy loading and async decoding: the old <img> tags had
          // neither, and no dimensions, so every list shifted layout as it
          // loaded.
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500"
          {...rest}
        />
      )}
    </div>
  );
}
