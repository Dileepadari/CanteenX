import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";

import { Image } from "@/components/common/Image";
import { cn } from "@/lib/utils";

interface CanteenSummary {
  id: number;
  name: string;
  location?: string | null;
  bannerUrl?: string | null;
  rating: number;
  isOpenNow: boolean;
  menuItemCount: number;
  tags: string[];
}

export function CanteenCard({ canteen }: { canteen: CanteenSummary }) {
  return (
    <Link
      to={`/canteens/${canteen.id}`}
      className="surface hover-lift group flex flex-col overflow-hidden focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative">
        <Image
          src={canteen.bannerUrl}
          alt={canteen.name}
          seed={canteen.id}
          aspect="video"
          rounded={false}
          className="group-hover:[&>img]:scale-105"
        />
        <span
          className={cn(
            "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold",
            canteen.isOpenNow
              ? "bg-success text-success-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {canteen.isOpenNow ? "Open" : "Closed"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-tight">
            {canteen.name}
          </h3>
          {canteen.rating > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-accent text-accent" aria-hidden />
              {canteen.rating.toFixed(1)}
            </span>
          )}
        </div>

        {canteen.location && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{canteen.location}</span>
          </p>
        )}

        {canteen.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {canteen.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-secondary px-2 py-0.5 text-[0.6875rem] font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="mt-auto pt-3 text-xs text-muted-foreground">
          {canteen.menuItemCount} item{canteen.menuItemCount === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}
