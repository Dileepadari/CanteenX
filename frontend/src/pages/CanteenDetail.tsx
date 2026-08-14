import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, Heart, MapPin, Phone, Star } from "lucide-react";
import { toast } from "sonner";

import { CardSkeleton, EmptyState, ErrorState, PageLoader } from "@/components/common";
import { Image } from "@/components/common/Image";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { Button } from "@/components/ui/button";
import {
  CANTEEN,
  MENU_CATEGORIES,
  MENU_ITEMS,
  SET_FAVORITE_CANTEEN,
} from "@/graphql/operations";
import { useSession } from "@/stores/session";
import { formatTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";

export default function CanteenDetail() {
  const { id } = useParams<{ id: string }>();
  const canteenId = Number(id);
  const navigate = useNavigate();
  const { user } = useSession();
  const [category, setCategory] = useState<string | null>(null);

  const canteenQuery = useQuery(CANTEEN, {
    variables: { id: canteenId },
    skip: !Number.isFinite(canteenId),
  });
  const categoriesQuery = useQuery(MENU_CATEGORIES, {
    variables: { canteenId },
    skip: !Number.isFinite(canteenId),
  });
  const itemsQuery = useQuery(MENU_ITEMS, {
    variables: { canteenId, category, limit: 200 },
    skip: !Number.isFinite(canteenId),
  });

  const [setFavorite] = useMutation(SET_FAVORITE_CANTEEN, {
    refetchQueries: [{ query: CANTEEN, variables: { id: canteenId } }],
  });

  const canteen = canteenQuery.data?.canteen;

  if (canteenQuery.loading && !canteenQuery.data) return <PageLoader />;
  if (canteenQuery.error || !canteen) {
    return (
      <ErrorState
        title="Canteen not found"
        description="This canteen may have been removed."
        onRetry={() => void canteenQuery.refetch()}
      />
    );
  }

  const toggleFavorite = async () => {
    if (!user) {
      navigate(`/signin?next=/canteens/${canteenId}`);
      return;
    }
    try {
      await setFavorite({
        variables: { canteenId, favorite: !canteen.isFavorite },
      });
      toast.success(
        canteen.isFavorite ? "Removed from favourites" : "Added to favourites",
      );
    } catch {
      toast.error("Could not update your favourites.");
    }
  };

  const items = itemsQuery.data?.menuItems ?? [];

  return (
    <div>
      {/* --- banner --- */}
      <div className="relative mb-6 overflow-hidden rounded-2xl">
        <Image
          src={canteen.bannerUrl}
          alt={canteen.name}
          seed={canteen.id}
          aspect="wide"
          rounded={false}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-5 sm:p-7">
          <div className="min-w-0 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  canteen.isOpenNow
                    ? "bg-success text-success-foreground"
                    : "bg-black/50 text-white",
                )}
              >
                {canteen.isOpenNow ? "Open now" : "Closed"}
              </span>
              {canteen.ratingCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-0.5 text-xs">
                  <Star className="h-3 w-3 fill-accent text-accent" aria-hidden />
                  {canteen.rating.toFixed(1)} ({canteen.ratingCount})
                </span>
              )}
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight drop-shadow-sm sm:text-4xl">
              {canteen.name}
            </h1>
            {canteen.description && (
              <p className="mt-1.5 max-w-xl text-sm text-white/80">
                {canteen.description}
              </p>
            )}
          </div>

          <Button
            variant={canteen.isFavorite ? "default" : "secondary"}
            onClick={() => void toggleFavorite()}
            aria-pressed={canteen.isFavorite}
          >
            <Heart
              className={cn("mr-1.5 h-4 w-4", canteen.isFavorite && "fill-current")}
              aria-hidden
            />
            {canteen.isFavorite ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      {/* --- facts --- */}
      <div className="mb-8 grid gap-3 text-sm sm:grid-cols-3">
        {canteen.location && (
          <p className="surface flex items-center gap-2.5 p-3.5">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate">{canteen.location}</span>
          </p>
        )}
        {canteen.opensAt && canteen.closesAt && (
          <p className="surface flex items-center gap-2.5 p-3.5">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            {formatTime(`1970-01-01T${canteen.opensAt}`)} -{" "}
            {formatTime(`1970-01-01T${canteen.closesAt}`)}
          </p>
        )}
        {canteen.phone && (
          <p className="surface flex items-center gap-2.5 p-3.5">
            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            {canteen.phone}
          </p>
        )}
      </div>

      {/* --- categories --- */}
      {(categoriesQuery.data?.menuCategories.length ?? 0) > 0 && (
        <div className="scroll-x mb-6 -mx-1 flex gap-2 px-1 pb-1">
          <button
            type="button"
            onClick={() => setCategory(null)}
            aria-pressed={!category}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              !category
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary",
            )}
          >
            All
          </button>
          {categoriesQuery.data?.menuCategories.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              aria-pressed={category === name}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                category === name
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {itemsQuery.loading && !itemsQuery.data ? (
        <CardSkeleton count={6} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Nothing on the menu here yet"
          description="This canteen has not published any items in this category."
        />
      ) : (
        <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onRequireSignIn={() => navigate(`/signin?next=/canteens/${canteenId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
