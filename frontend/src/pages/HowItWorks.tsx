import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  CreditCard,
  PackageCheck,
  Search,
  ShoppingBag,
} from "lucide-react";

import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Search,
    title: "Find your canteen",
    body: "Browse every canteen on campus with live opening status, ratings, and the full menu. Filter for vegetarian dishes or search for the one thing you want.",
  },
  {
    icon: ShoppingBag,
    title: "Build your order",
    body: "Pick sizes, add-ons, and spice levels, and leave a note for the kitchen. Your cart lives on the server, so it follows you between your phone and laptop.",
  },
  {
    icon: CreditCard,
    title: "Pay before you walk over",
    body: "Pay by UPI or card through Razorpay, or top up your CanteenX wallet once and settle future orders in a tap.",
  },
  {
    icon: ClipboardCheck,
    title: "Track it live",
    body: "The kitchen moves your order from confirmed to preparing to ready. You see each step the moment it happens - no refreshing.",
  },
  {
    icon: PackageCheck,
    title: "Collect and go",
    body: "Show your order reference at the counter and pick it up. No queue, no cash, no waiting for change.",
  },
];

export default function HowItWorks() {
  return (
    <div>
      <PageHeader
        eyebrow="Getting started"
        title="How CanteenX works"
        description="Five steps between deciding you are hungry and eating."
      />

      <ol className="relative space-y-8 border-l border-border pl-8">
        {STEPS.map(({ icon: Icon, title, body }, index) => (
          <li key={title} className="relative">
            <span className="absolute -left-[2.6rem] flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-primary">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Step {index + 1}
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold">{title}</h2>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>

      <div className="surface mt-12 flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="font-display text-lg font-semibold">Ready to try it?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your first order takes about a minute.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/canteens">Browse canteens</Link>
        </Button>
      </div>
    </div>
  );
}
