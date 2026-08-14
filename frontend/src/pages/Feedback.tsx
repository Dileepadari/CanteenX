import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CANTEENS, COMPLAINTS, CREATE_COMPLAINT } from "@/graphql/operations";
import { formatDateTime } from "@/lib/datetime";
import { useSession } from "@/stores/session";

const CATEGORIES = [
  { value: "FOOD_QUALITY", label: "Food quality" },
  { value: "WRONG_ORDER", label: "Wrong order" },
  { value: "DELAY", label: "Long delay" },
  { value: "PAYMENT", label: "Payment problem" },
  { value: "HYGIENE", label: "Hygiene" },
  { value: "STAFF_BEHAVIOUR", label: "Staff behaviour" },
  { value: "OTHER", label: "Something else" },
];

export default function Feedback() {
  const { user } = useSession();
  const canteens = useQuery(CANTEENS, { variables: { limit: 50 } });
  const complaints = useQuery(COMPLAINTS, {
    variables: { mineOnly: true, limit: 30 },
    skip: !user,
  });

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("FOOD_QUALITY");
  const [canteenId, setCanteenId] = useState<string>("");

  const [createComplaint, { loading }] = useMutation(CREATE_COMPLAINT, {
    onCompleted: () => void complaints.refetch(),
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createComplaint({
        variables: {
          input: {
            subject: subject.trim(),
            body: body.trim(),
            category: category as never,
            canteenId: canteenId ? Number(canteenId) : null,
          },
        },
      });
      toast.success("Thanks - the canteen team will respond.");
      setSubject("");
      setBody("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not submit that.",
      );
    }
  };

  if (!user) {
    return (
      <div>
        <PageHeader title="Feedback" />
        <EmptyState
          icon={MessageSquareWarning}
          title="Sign in to send feedback"
          description="We link feedback to your account so the canteen can respond to you."
          action={
            <Button asChild>
              <Link to="/signin?next=/feedback">Sign in</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="We are listening"
        title="Feedback"
        description="Report a problem with an order or a canteen, and track the response."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submit} className="surface space-y-4 p-5">
          <h2 className="font-display text-base font-semibold">Report an issue</h2>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
            >
              {CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="canteen">Canteen (optional)</Label>
            <select
              id="canteen"
              value={canteenId}
              onChange={(event) => setCanteenId(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
            >
              <option value="">Not specific to one canteen</option>
              {canteens.data?.canteens.map((canteen) => (
                <option key={canteen.id} value={canteen.id}>
                  {canteen.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="body">Details</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={5}
              className="mt-1.5"
              required
            />
          </div>

          <Button type="submit" disabled={loading || !subject.trim() || !body.trim()}>
            {loading && <Spinner className="mr-2" />}
            Submit
          </Button>

          <p className="text-xs text-muted-foreground">
            To report a problem with a specific order, open that order and use
            &ldquo;Report an issue&rdquo; there.
          </p>
        </form>

        <section>
          <h2 className="mb-3 font-display text-base font-semibold">
            Your reports
          </h2>

          {complaints.loading && !complaints.data ? (
            <RowSkeleton count={3} />
          ) : (complaints.data?.complaints.length ?? 0) === 0 ? (
            <EmptyState
              icon={MessageSquareWarning}
              title="No reports yet"
              description="Anything you report will show up here with its status."
            />
          ) : (
            <ul className="space-y-3">
              {complaints.data?.complaints.map((complaint) => (
                <li key={complaint.id} className="surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{complaint.subject}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {complaint.canteenName ?? "General"} -{" "}
                        {formatDateTime(complaint.createdAt)}
                      </p>
                    </div>
                    <StatusPill
                      status={complaint.status}
                      map={COMPLAINT_STATUS}
                      size="sm"
                    />
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {complaint.body}
                  </p>

                  {complaint.responseBody && (
                    <div className="mt-3 rounded-lg bg-success-soft p-3">
                      <p className="text-xs font-semibold text-success">Response</p>
                      <p className="mt-0.5 text-sm">{complaint.responseBody}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
