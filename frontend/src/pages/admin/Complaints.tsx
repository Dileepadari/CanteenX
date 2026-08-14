import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { MessageSquareWarning } from "lucide-react";
import { toast } from "sonner";

import {
  EmptyState,
  PageHeader,
  RowSkeleton,
  Spinner,
} from "@/components/common";
import { COMPLAINT_STATUS, StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { COMPLAINTS, RESPOND_TO_COMPLAINT } from "@/graphql/operations";
import { formatDateTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";

const FILTERS = [
  { label: "Open", status: "OPEN" },
  { label: "Escalated", status: "ESCALATED" },
  { label: "Resolved", status: "RESOLVED" },
  { label: "All", status: null },
];

export default function AdminComplaints() {
  const [filter, setFilter] = useState(0);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const status = FILTERS[filter]?.status ?? null;

  const { data, loading, refetch } = useQuery(COMPLAINTS, {
    variables: { status: status as never, limit: 100 },
  });

  const [respond, { loading: responding }] = useMutation(RESPOND_TO_COMPLAINT, {
    onCompleted: () => void refetch(),
  });

  const send = async (complaintId: number, nextStatus: string) => {
    const body = drafts[complaintId]?.trim();
    if (!body) {
      toast.error("Write a response first.");
      return;
    }
    try {
      await respond({
        variables: {
          complaintId,
          responseBody: body,
          status: nextStatus as never,
        },
      });
      toast.success("Response sent");
      setDrafts((current) => {
        const next = { ...current };
        delete next[complaintId];
        return next;
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send that response.",
      );
    }
  };

  const complaints = data?.complaints ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Complaints"
        description="Reports from students, and the responses sent back."
      />

      <div className="mb-5 inline-flex gap-1 rounded-lg bg-muted p-1">
        {FILTERS.map((option, index) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setFilter(index)}
            aria-pressed={filter === index}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === index
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <RowSkeleton count={4} />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="Nothing here"
          description="No complaints match this filter."
        />
      ) : (
        <ul className="space-y-4">
          {complaints.map((complaint) => (
            <li key={complaint.id} className="surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{complaint.subject}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {complaint.author?.name} - {complaint.canteenName ?? "General"} -{" "}
                    {formatDateTime(complaint.createdAt)}
                    {complaint.orderId ? ` - order #${complaint.orderId}` : ""}
                  </p>
                </div>
                <StatusPill
                  status={complaint.status}
                  map={COMPLAINT_STATUS}
                  size="sm"
                />
              </div>

              <p className="mt-3 rounded-lg bg-secondary p-3 text-sm">
                {complaint.body}
              </p>

              {complaint.responseBody ? (
                <div className="mt-3 rounded-lg bg-success-soft p-3">
                  <p className="text-xs font-semibold text-success">
                    Responded {formatDateTime(complaint.respondedAt)}
                  </p>
                  <p className="mt-0.5 text-sm">{complaint.responseBody}</p>
                </div>
              ) : (
                <div className="mt-4 border-t border-border pt-4">
                  <Textarea
                    rows={3}
                    value={drafts[complaint.id] ?? ""}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [complaint.id]: event.target.value,
                      }))
                    }
                    placeholder="Write a response to the student"
                    aria-label={`Response to ${complaint.subject}`}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={responding}
                      onClick={() => void send(complaint.id, "RESOLVED")}
                    >
                      {responding && <Spinner className="mr-2" />}
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={responding}
                      onClick={() => void send(complaint.id, "IN_REVIEW")}
                    >
                      Mark in review
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      disabled={responding}
                      onClick={() => void send(complaint.id, "ESCALATED")}
                    >
                      Escalate
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
