/**
 * Which canteen the vendor console is currently acting on.
 *
 * The previous build hardcoded `useState<number>(1)` with a
 * `// TODO: wire to actual vendor canteen selection`, so every vendor managed
 * canteen #1 regardless of what they actually owned.
 */
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

import { MANAGED_CANTEENS } from "@/graphql/operations";

const STORAGE_KEY = "canteenx-active-canteen";

export function useManagedCanteen() {
  const { data, loading, error } = useQuery(MANAGED_CANTEENS);
  const [canteenId, setCanteenIdState] = useState<number | null>(null);

  const canteens = data?.managedCanteens ?? [];

  useEffect(() => {
    if (canteens.length === 0) return;

    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    // Only honour the stored id if the user still manages that canteen -
    // staffing changes, and a stale id would silently 403 every query.
    const valid = canteens.some((canteen) => canteen.id === stored);
    setCanteenIdState((current) =>
      current && canteens.some((canteen) => canteen.id === current)
        ? current
        : valid
          ? stored
          : (canteens[0]?.id ?? null),
    );
  }, [canteens]);

  const setCanteenId = (next: number) => {
    window.localStorage.setItem(STORAGE_KEY, String(next));
    setCanteenIdState(next);
  };

  return {
    canteenId,
    setCanteenId,
    canteens,
    loading,
    error,
    active: canteens.find((canteen) => canteen.id === canteenId) ?? null,
  };
}

/** Dropdown shown in every vendor page header when more than one is managed. */
export function CanteenSwitcher({
  canteens,
  canteenId,
  onChange,
}: {
  canteens: { id: number; name: string }[];
  canteenId: number | null;
  onChange: (id: number) => void;
}) {
  if (canteens.length <= 1) return null;

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">Active canteen</span>
      <select
        value={canteenId ?? ""}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-9 rounded-lg border border-border bg-card px-3 text-sm"
      >
        {canteens.map((canteen) => (
          <option key={canteen.id} value={canteen.id}>
            {canteen.name}
          </option>
        ))}
      </select>
    </label>
  );
}
