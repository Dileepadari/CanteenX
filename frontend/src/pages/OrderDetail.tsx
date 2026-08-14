import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Link, useParams } from "react-router-dom";
import { MessageSquareWarning, Star } from "lucide-react";
import { toast } from "sonner";

import { ErrorState, PageHeader, PageLoader } from "@/components/common";
import { Money } from "@/components/common/Money";
import { PAYMENT_STATUS, StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CREATE_COMPLAINT, CREATE_REVIEW, ORDER } from "@/graphql/operations";
import { formatDateTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const { data, loading, error, refetch } = useQuery(ORDER, {
    variables: { id: orderId },
    skip: !Number.isFinite(orderId),
  });

  const [reviewOpen, setReviewOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);

  const order = data?.order;

  if (loading && !data) return <PageLoader label="Loading order" />;
  if (error || !order) {
    return (
      <ErrorState
        title="Order not found"
        description="This order does not exist, or it is not yours."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={order.canteenName ?? undefined}
        title={`Order ${order.reference}`}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusPill status={order.status} />
            <StatusPill status={order.paymentStatus} map={PAYMENT_STATUS} />
          </div>
        }
      />

      {order.status === "CANCELLED" && order.cancellationReason && (
        <div className="mb-6 rounded-lg border border-destructive/25 bg-destructive-soft p-4 text-sm">
          <p className="font-semibold text-destructive">Order cancelled</p>
          <p className="mt-0.5 text-muted-foreground">{order.cancellationReason}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="surface p-5">
          <h2 className="font-display text-base font-semibold">Items</h2>
          <ul className="mt-4 divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">
                    {item.quantity}x {item.name}
                  </p>
                  {item.customizationSummary && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.customizationSummary}
                    </p>
                  )}
                  {item.note && (
                    <p className="mt-0.5 text-xs italic text-muted-foreground">
                      &ldquo;{item.note}&rdquo;
                    </p>
                  )}
                </div>
                <Money value={item.lineTotal} size="sm" className="shrink-0" />
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>
                <Money value={order.subtotal} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd>
                <Money value={order.tax} />
              </dd>
            </div>
            {order.discount.paise > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount</dt>
                <dd>-{order.discount.formatted}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2.5">
              <dt className="font-semibold">Total</dt>
              <dd>
                <Money value={order.total} size="lg" />
              </dd>
            </div>
          </dl>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {order.status === "COMPLETED" && (
            <div className="surface space-y-2 p-5">
              <h2 className="font-display text-base font-semibold">
                How was it?
              </h2>
              <p className="text-sm text-muted-foreground">
                Your rating helps other students choose.
              </p>
              <Button className="w-full" onClick={() => setReviewOpen(true)}>
                <Star className="mr-1.5 h-4 w-4" aria-hidden />
                Leave a review
              </Button>
            </div>
          )}

          <div className="surface space-y-2 p-5">
            <h2 className="font-display text-base font-semibold">
              Something wrong?
            </h2>
            <p className="text-sm text-muted-foreground">
              Report an issue and the canteen will respond.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setComplaintOpen(true)}
            >
              <MessageSquareWarning className="mr-1.5 h-4 w-4" aria-hidden />
              Report an issue
            </Button>
          </div>

          <Button asChild variant="ghost" className="w-full">
            <Link to="/orders">All orders</Link>
          </Button>
        </aside>
      </div>

      <ReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        orderId={order.id}
      />
      <ComplaintDialog
        open={complaintOpen}
        onOpenChange={setComplaintOpen}
        orderId={order.id}
      />
    </div>
  );
}

/** Real submission. Both of these were `// In a real app...` stubs before. */
function ReviewDialog({
  open,
  onOpenChange,
  orderId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
}) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [createReview, { loading }] = useMutation(CREATE_REVIEW);

  const submit = async () => {
    try {
      await createReview({
        variables: { input: { orderId, rating, body: body.trim() || null } },
      });
      toast.success("Thanks for the review");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save your review.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Rate this order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <span className="mb-2 block text-sm font-medium">Rating</span>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  onClick={() => setRating(value)}
                  className="rounded p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-7 w-7",
                      value <= rating
                        ? "fill-accent text-accent"
                        : "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="review-body">Comments (optional)</Label>
            <Textarea
              id="review-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={3}
              className="mt-1.5"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={loading}>
            Submit review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ComplaintDialog({
  open,
  onOpenChange,
  orderId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("FOOD_QUALITY");
  const [createComplaint, { loading }] = useMutation(CREATE_COMPLAINT);

  const submit = async () => {
    try {
      await createComplaint({
        variables: {
          input: {
            orderId,
            subject: subject.trim(),
            body: body.trim(),
            category: category as never,
          },
        },
      });
      toast.success("Reported. The canteen will respond shortly.");
      onOpenChange(false);
      setSubject("");
      setBody("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not submit that.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Report an issue</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="complaint-category">What went wrong?</Label>
            <select
              id="complaint-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
            >
              <option value="FOOD_QUALITY">Food quality</option>
              <option value="WRONG_ORDER">Wrong order</option>
              <option value="DELAY">Long delay</option>
              <option value="PAYMENT">Payment problem</option>
              <option value="HYGIENE">Hygiene</option>
              <option value="STAFF_BEHAVIOUR">Staff behaviour</option>
              <option value="OTHER">Something else</option>
            </select>
          </div>

          <div>
            <Label htmlFor="complaint-subject">Subject</Label>
            <Input
              id="complaint-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="complaint-body">Details</Label>
            <Textarea
              id="complaint-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={4}
              className="mt-1.5"
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={loading || !subject.trim() || !body.trim()}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
