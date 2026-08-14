import { useQuery } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Sparkles, Wallet } from "lucide-react";

import { CardSkeleton, ErrorState, SectionHeading } from "@/components/common";
import { CanteenCard } from "@/components/canteen/CanteenCard";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { Button } from "@/components/ui/button";
import { CANTEENS, MENU_ITEMS } from "@/graphql/operations";

const HIGHLIGHTS = [
  {
    icon: Clock,
    title: "Order before you walk over",
    body: "Place an order from class and collect it when it is actually ready.",
  },
  {
    icon: Wallet,
    title: "Pay how you like",
    body: "UPI and cards through Razorpay, or top up your CanteenX wallet once.",
  },
  {
    icon: Sparkles,
    title: "Live order tracking",
    body: "Watch your order move from confirmed to ready, without refreshing.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  const canteens = useQuery(CANTEENS, { variables: { limit: 4 } });
  const featured = useQuery(MENU_ITEMS, {
    variables: { featuredOnly: true, limit: 6 },
  });

  return (
    <div className="space-y-14">
      {/* --- hero --- */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-12 sm:px-10 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        />

        <div className="relative max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Campus dining, without the wait
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Your canteen order,
            <br />
            ready when you are.
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
            Browse every campus canteen, order ahead, pay digitally, and pick up
            without standing in a single queue.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate("/canteens")}>
              Browse canteens
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/menu")}>
              See the full menu
            </Button>
          </div>
        </div>
      </section>

      {/* --- highlights --- */}
      <section className="stagger grid gap-5 sm:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="surface p-5">
            <span className="inline-flex rounded-lg bg-primary-muted p-2.5 text-primary">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-3.5 font-display text-base font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      {/* --- canteens --- */}
      <section>
        <SectionHeading
          title="Canteens on campus"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/canteens">
                View all
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          }
        />
        {canteens.loading && !canteens.data ? (
          <CardSkeleton count={4} />
        ) : canteens.error ? (
          <ErrorState
            description="Could not load canteens."
            onRetry={() => void canteens.refetch()}
          />
        ) : (
          <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {canteens.data?.canteens.map((canteen) => (
              <CanteenCard key={canteen.id} canteen={canteen} />
            ))}
          </div>
        )}
      </section>

      {/* --- featured items --- */}
      <section>
        <SectionHeading
          title="Popular right now"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/menu">
                Full menu
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          }
        />
        {featured.loading && !featured.data ? (
          <CardSkeleton count={3} />
        ) : featured.error ? (
          <ErrorState
            description="Could not load menu items."
            onRetry={() => void featured.refetch()}
          />
        ) : (
          <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.data?.menuItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onRequireSignIn={() => navigate("/signin?next=/")}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
