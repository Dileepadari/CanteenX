import { useState } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, UtensilsCrossed } from "lucide-react";

import { CardSkeleton, EmptyState, ErrorState, PageHeader } from "@/components/common";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CANTEENS, MENU_CATEGORIES, MENU_ITEMS } from "@/graphql/operations";
import { useDebounced } from "@/lib/useDebounced";
import { cn } from "@/lib/utils";

export default function Menu() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const canteenId = params.get("canteen") ? Number(params.get("canteen")) : null;
  const category = params.get("category");

  const [search, setSearch] = useState(params.get("q") ?? "");
  const [vegOnly, setVegOnly] = useState(params.get("veg") === "1");
  const debouncedSearch = useDebounced(search, 300);

  const canteens = useQuery(CANTEENS, { variables: { limit: 50 } });
  const categories = useQuery(MENU_CATEGORIES, {
    variables: { canteenId },
  });

  const { data, loading, error, refetch } = useQuery(MENU_ITEMS, {
    variables: {
      canteenId,
      category,
      search: debouncedSearch || null,
      vegetarianOnly: vegOnly,
      limit: 120,
    },
  });

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const items = data?.menuItems ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Order"
        title="Menu"
        description="Everything available across campus right now."
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setParam("q", event.target.value || null);
            }}
            placeholder="Search dishes"
            aria-label="Search menu items"
            className="pl-9"
          />
        </div>

        <select
          value={canteenId ?? ""}
          onChange={(event) => setParam("canteen", event.target.value || null)}
          aria-label="Filter by canteen"
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm"
        >
          <option value="">All canteens</option>
          {canteens.data?.canteens.map((canteen) => (
            <option key={canteen.id} value={canteen.id}>
              {canteen.name}
            </option>
          ))}
        </select>

        <label className="flex shrink-0 items-center gap-2.5 text-sm">
          <Switch
            checked={vegOnly}
            onCheckedChange={(checked) => {
              setVegOnly(checked);
              setParam("veg", checked ? "1" : null);
            }}
            aria-label="Show vegetarian items only"
          />
          Vegetarian only
        </label>
      </div>

      {/* Category chips */}
      {(categories.data?.menuCategories.length ?? 0) > 0 && (
        <div className="scroll-x mb-6 -mx-1 flex gap-2 px-1 pb-1">
          <CategoryChip
            label="All"
            active={!category}
            onClick={() => setParam("category", null)}
          />
          {categories.data?.menuCategories.map((name) => (
            <CategoryChip
              key={name}
              label={name}
              active={category === name}
              onClick={() => setParam("category", name)}
            />
          ))}
        </div>
      )}

      {loading && !data ? (
        <CardSkeleton count={6} />
      ) : error ? (
        <ErrorState
          description="Could not load the menu."
          onRetry={() => void refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Nothing matches those filters"
          description="Try clearing the search or choosing a different category."
        />
      ) : (
        <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onRequireSignIn={() => navigate("/signin?next=/menu")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
