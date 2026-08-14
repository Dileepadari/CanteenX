import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { UsersRound } from "lucide-react";
import { toast } from "sonner";

import {
  EmptyState,
  PageHeader,
  PageLoader,
  RowSkeleton,
  Spinner,
} from "@/components/common";
import { Money, rupeesToPaise } from "@/components/common/Money";
import { BULK_STATUS, StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CANTEEN_BULK_ORDERS,
  QUOTE_BULK_ORDER,
  SET_BULK_ORDER_STATUS,
} from "@/graphql/operations";
import { CanteenSwitcher, useManagedCanteen } from "@/lib/useManagedCanteen";
import { formatDateTime } from "@/lib/datetime";

export default function VendorBulkOrders() {
  const { canteenId, setCanteenId, canteens, loading: loadingCanteens } =
    useManagedCanteen();

  const { data, loading, refetch } = useQuery(CANTEEN_BULK_ORDERS, {
    variables: { canteenId: canteenId! },
    skip: !canteenId,
  });

  const [quote, quoteState] = useMutation(QUOTE_BULK_ORDER, {
    onCompleted: () => void refetch(),
  });
  const [setStatus] = useMutation(SET_BULK_ORDER_STATUS, {
    onCompleted: () => void refetch(),
  });

  const [drafts, setDrafts] = useState<Record<number, { total: string; note: string }>>(
    {},
  );

  if (loadingCanteens) return <PageLoader />;
  if (canteens.length === 0) {
    return (
      <EmptyState
        title="No canteen assigned"
        description="Ask an administrator to assign you to a canteen."
      />
    );
  }

  const orders = data?.canteenBulkOrders ?? [];

  const sendQuote = async (bulkOrderId: number) => {
    const draft = drafts[bulkOrderId];
    const paise = rupeesToPaise(draft?.total ?? "");
    if (paise <= 0) {
      toast.error("Enter a quote amount.");
      return;
    }
    try {
      await quote({
        variables: {
          bulkOrderId,
          quotedTotalPaise: paise,
          quoteNote: draft?.note?.trim() || null,
        },
      });
      toast.success("Quote sent");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send that quote.",
      );
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Vendor"
        title="Bulk orders"
        description="Catering requests from students and societies."
        actions={
          <CanteenSwitcher
            canteens={canteens}
            canteenId={canteenId}
            onChange={setCanteenId}
          />
        }
      />

      {loading && !data ? (
        <RowSkeleton count={3} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No catering requests"
          description="Requests will appear here when students submit them."
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const draft = drafts[order.id] ?? { total: "", note: "" };
            return (
              <li key={order.id} className="surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">
                        {order.reference}
                      </span>
                      <StatusPill status={order.status} map={BULK_STATUS} size="sm" />
                    </div>
                    <p className="mt-1 font-medium">{order.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {order.requester?.name} - {order.headCount} people - needed{" "}
                      {formatDateTime(order.requiredAt)}
                      {order.contactPhone ? ` - ${order.contactPhone}` : ""}
                    </p>
                  </div>
                  {order.quotedTotal && <Money value={order.quotedTotal} size="lg" />}
                </div>

                {order.notes && (
                  <p className="mt-3 rounded-lg bg-secondary p-3 text-sm">
                    {order.notes}
                  </p>
                )}

                {order.status === "REQUESTED" && (
                  <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
                    <div>
                      <Label htmlFor={`quote-${order.id}`}>Quote (₹)</Label>
                      <Input
                        id={`quote-${order.id}`}
                        type="number"
                        min="1"
                        value={draft.total}
                        onChange={(event) =>
                          setDrafts((state) => ({
                            ...state,
                            [order.id]: { ...draft, total: event.target.value },
                          }))
                        }
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`note-${order.id}`}>Note</Label>
                      <Textarea
                        id={`note-${order.id}`}
                        rows={1}
                        value={draft.note}
                        onChange={(event) =>
                          setDrafts((state) => ({
                            ...state,
                            [order.id]: { ...draft, note: event.target.value },
                          }))
                        }
                        placeholder="What the quote covers"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        disabled={quoteState.loading}
                        onClick={() => void sendQuote(order.id)}
                      >
                        {quoteState.loading && <Spinner className="mr-2" />}
                        Send quote
                      </Button>
                      <Button
                        variant="outline"
                        className="text-destructive"
                        onClick={() =>
                          void setStatus({
                            variables: {
                              bulkOrderId: order.id,
                              status: "DECLINED" as never,
                            },
                          })
                        }
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                )}

                {order.status === "CONFIRMED" && (
                  <div className="mt-4 border-t border-border pt-4">
                    <Button
                      onClick={() =>
                        void setStatus({
                          variables: {
                            bulkOrderId: order.id,
                            status: "FULFILLED" as never,
                          },
                        })
                      }
                    >
                      Mark fulfilled
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
