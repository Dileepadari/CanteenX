import { useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader, RowSkeleton, Spinner } from "@/components/common";
import { rupeesToPaise } from "@/components/common/Money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CREATE_WALLET_TOP_UP, ME, WALLET } from "@/graphql/operations";
import { openCheckout } from "@/lib/razorpay";
import { formatDateTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = [100, 250, 500, 1000];

export default function Wallet() {
  const client = useApolloClient();
  const { data, loading, refetch } = useQuery(WALLET);
  const me = useQuery(ME);
  const [amount, setAmount] = useState("250");
  const [busy, setBusy] = useState(false);
  const [createTopUp] = useMutation(CREATE_WALLET_TOP_UP);

  const wallet = data?.wallet;
  const transactions = wallet?.transactions ?? [];

  const topUp = async () => {
    const paise = rupeesToPaise(amount);
    if (paise < 1000) {
      toast.error("The minimum top-up is ₹10.");
      return;
    }

    setBusy(true);
    try {
      const { data: created } = await createTopUp({
        variables: { amountPaise: paise },
      });
      const gatewayOrderId = created?.createWalletTopUp;
      if (!gatewayOrderId) throw new Error("Could not start the top-up.");

      const user = me.data?.me;
      const response = await openCheckout({
        gatewayOrderId,
        // The publishable key id is safe on the client; the secret is not and
        // never leaves the server.
        keyId: import.meta.env.VITE_RAZORPAY_KEY_ID ?? "",
        currency: "INR",
        orderReference: "Wallet top-up",
        customerName: user?.name ?? "",
        customerEmail: user?.email ?? "",
        customerPhone: user?.phone,
        amount: { paise },
      });

      if (!response) {
        toast.info("Top-up cancelled.");
        return;
      }

      // The wallet is credited by the signed webhook, not by this response, so
      // we poll once rather than assuming success.
      toast.success("Payment received. Your balance will update shortly.");
      window.setTimeout(() => void refetch(), 2500);
      await client.refetchQueries({ include: [WALLET] });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The top-up failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Your account"
        title="Wallet"
        description="Top up once, then settle orders in a single tap."
      />

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div className="space-y-4">
          <div className="surface bg-primary p-6 text-primary-foreground">
            <span className="inline-flex rounded-lg bg-white/15 p-2.5">
              <WalletIcon className="h-5 w-5" aria-hidden />
            </span>
            <p className="mt-4 text-sm opacity-80">Available balance</p>
            <p className="tabular mt-1 font-display text-4xl font-semibold">
              {wallet?.balance.formatted ?? "₹0.00"}
            </p>
            {wallet?.isFrozen && (
              <p className="mt-3 rounded-lg bg-white/15 px-3 py-2 text-xs">
                This wallet is frozen. Contact support.
              </p>
            )}
          </div>

          <div className="surface space-y-4 p-5">
            <h2 className="font-display text-base font-semibold">Add money</h2>

            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(String(value))}
                  className={cn(
                    "tabular rounded-lg border py-2 text-sm font-medium transition-colors",
                    Number(amount) === value
                      ? "border-primary bg-primary-muted text-primary"
                      : "border-border hover:bg-secondary",
                  )}
                >
                  ₹{value}
                </button>
              ))}
            </div>

            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min={10}
                max={5000}
                step={10}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="mt-1.5"
              />
            </div>

            <Button
              className="w-full"
              disabled={busy || wallet?.isFrozen}
              onClick={() => void topUp()}
            >
              {busy && <Spinner className="mr-2" />}
              Top up
            </Button>
          </div>
        </div>

        <section>
          <h2 className="mb-3 font-display text-base font-semibold">
            Transaction history
          </h2>

          {loading && !data ? (
            <RowSkeleton count={4} />
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={WalletIcon}
              title="No transactions yet"
              description="Top-ups and order payments will appear here."
            />
          ) : (
            <ul className="surface divide-y divide-border">
              {transactions.map((transaction) => {
                const credit = transaction.amount.paise > 0;
                return (
                  <li
                    key={transaction.id}
                    className="flex items-center gap-4 p-4"
                  >
                    <span
                      className={cn(
                        "rounded-lg p-2",
                        credit
                          ? "bg-success-soft text-success"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {credit ? (
                        <ArrowDownLeft className="h-4 w-4" aria-hidden />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(transaction.createdAt)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={cn(
                          "tabular text-sm font-semibold",
                          credit ? "text-success" : "text-foreground",
                        )}
                      >
                        {credit ? "+" : ""}
                        {transaction.amount.formatted}
                      </p>
                      <p className="tabular text-xs text-muted-foreground">
                        {transaction.balanceAfter.formatted}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
