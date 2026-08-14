import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Search, Store } from "lucide-react";

import { CanteenCard } from "@/components/canteen/CanteenCard";
import { CardSkeleton, EmptyState, ErrorState, PageHeader } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CANTEENS } from "@/graphql/operations";
import { useDebounced } from "@/lib/useDebounced";

export default function Canteens() {
  const [search, setSearch] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  // Debounced so typing does not fire a query per keystroke.
  const debouncedSearch = useDebounced(search, 300);

  const { data, loading, error, refetch } = useQuery(CANTEENS, {
    variables: {
      search: debouncedSearch || null,
      openOnly,
      limit: 50,
    },
  });

  const canteens = data?.canteens ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Browse"
        title="Canteens"
        description="Every canteen on campus, with live opening status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, cuisine, or location"
            aria-label="Search canteens"
            className="pl-9"
          />
        </div>
        <label className="flex shrink-0 items-center gap-2.5 text-sm">
          <Switch
            checked={openOnly}
            onCheckedChange={setOpenOnly}
            aria-label="Show only open canteens"
          />
          Open now
        </label>
      </div>

      {loading && !data ? (
        <CardSkeleton count={6} />
      ) : error ? (
        <ErrorState
          description="Could not load canteens."
          onRetry={() => void refetch()}
        />
      ) : canteens.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No canteens match that"
          description={
            openOnly
              ? "Nothing is open right now. Try turning off the open-only filter."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {canteens.map((canteen) => (
            <CanteenCard key={canteen.id} canteen={canteen} />
          ))}
        </div>
      )}
    </div>
  );
}
