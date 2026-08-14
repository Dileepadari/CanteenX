import { useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, ShoppingBag, Tag, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader, RowSkeleton, Spinner } from "@/components/common";
import { Money } from "@/components/common/Money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CART,
  INITIATE_PAYMENT,
  MY_ORDERS,
  PLACE_ORDER,
  PROMOTION_PREVIEW,
  VERIFY_PAYMENT,
  WALLET,
} from "@/graphql/operations";
import { PaymentMethod } from "@/graphql/generated/graphql";
import { openCheckout } from "@/lib/razorpay";
import { useSession } from "@/stores/session";
import { cn } from "@/lib/utils";

/** Only these two are offered at checkout; cash is not supported. */
type Method = PaymentMethod.Upi | PaymentMethod.Wallet;

export default function Checkout() {
  const navigate = useNavigate();
  const client = useApolloClient();
  const { user } = useSession();

  const [method, setMethod] = useState<Method>(PaymentMethod.Upi);
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountLabel, setDiscountLabel] = useState<string | null>(null);
  const [isPlacing, setPlacing] = useState(false);

  const cartQuery = useQuery(CART);
  const walletQuery = useQuery(WALLET);

  const [placeOrder] = useMutation(PLACE_ORDER);
  const [initiatePayment] = useMutation(INITIATE_PAYMENT);
  const [verifyPayment] = useMutation(VERIFY_PAYMENT);

  const cart = cartQuery.data?.cart;
  const walletPaise = walletQuery.data?.wallet.balance.paise ?? 0;
  const totalPaise = cart?.total.paise ?? 0;
  const walletShort = method === PaymentMethod.Wallet && walletPaise < totalPaise;

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    const { data } = await client.query({
      query: PROMOTION_PREVIEW,
      variables: { code: promoCode.trim() },
      fetchPolicy: "network-only",
    });
    const preview = data.promotionPreview;
    if (preview.valid) {
      setAppliedPromo(promoCode.trim());
      setDiscountLabel(`${preview.message} (-${preview.discount.formatted})`);
      toast.success(`Promo applied: ${preview.discount.formatted} off`);
    } else {
      setAppliedPromo(null);
      setDiscountLabel(null);
      toast.error(preview.message);
    }
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      // 1. Create the order. Stock is reserved here, server-side.
      const { data: placed } = await placeOrder({
        variables: {
          input: {
            paymentMethod: method,
            customerNote: note.trim() || null,
            contactPhone: phone.trim() || null,
            promotionCode: appliedPromo,
          },
        },
      });

      const order = placed?.placeOrder;
      if (!order) throw new Error("The order could not be created.");

      // 2. Start payment. A wallet order settles inside this call and returns
      //    null; a gateway order returns the checkout intent.
      const { data: intentData } = await initiatePayment({
        variables: { orderId: order.id },
      });
      const intent = intentData?.initiatePayment;

      if (!intent) {
        toast.success(`Order ${order.reference} confirmed`);
        await client.refetchQueries({ include: [CART, WALLET, MY_ORDERS] });
        navigate(`/orders/track/${order.id}`);
        return;
      }

      // 3. Open Razorpay. The signed response goes straight to the server for
      //    verification - the client never asserts that payment succeeded.
      const response = await openCheckout(intent);

      if (!response) {
        toast.info("Payment cancelled. Your order is saved as unpaid.", {
          action: {
            label: "View order",
            onClick: () => navigate(`/orders/${order.id}`),
          },
        });
        await client.refetchQueries({ include: [CART, MY_ORDERS] });
        return;
      }

      await verifyPayment({
        variables: {
          gatewayOrderId: response.razorpay_order_id,
          gatewayPaymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        },
      });

      toast.success(`Payment received for ${order.reference}`);
      await client.refetchQueries({ include: [CART, WALLET, MY_ORDERS] });
      navigate(`/orders/track/${order.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Checkout failed. Please try again.",
      );
    } finally {
      setPlacing(false);
    }
  };

  if (cartQuery.loading && !cartQuery.data) {
    return (
      <div>
        <PageHeader title="Checkout" />
        <RowSkeleton count={2} />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <PageHeader title="Checkout" />
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out"
          description="Your cart is empty."
          action={
            <Button asChild>
              <Link to="/menu">Browse the menu</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Checkout"
        description={cart.canteenName ? `Ordering from ${cart.canteenName}` : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {/* --- payment method --- */}
          <section className="surface p-5">
            <h2 className="font-display text-base font-semibold">Payment method</h2>
            <div className="mt-4 space-y-2.5">
              <MethodOption
                value={PaymentMethod.Upi}
                selected={method === PaymentMethod.Upi}
                onSelect={setMethod}
                icon={CreditCard}
                title="UPI or card"
                subtitle="Pay securely through Razorpay"
              />
              <MethodOption
                value={PaymentMethod.Wallet}
                selected={method === PaymentMethod.Wallet}
                onSelect={setMethod}
                icon={WalletIcon}
                title="CanteenX wallet"
                subtitle={`Balance ${walletQuery.data?.wallet.balance.formatted ?? "₹0.00"}`}
                disabled={walletPaise < totalPaise}
                disabledHint="Not enough balance"
              />
            </div>
            {walletShort && (
              <p className="mt-3 text-sm text-destructive">
                Top up your wallet or pay by UPI instead.
              </p>
            )}
          </section>

          {/* --- details --- */}
          <section className="surface p-5">
            <h2 className="font-display text-base font-semibold">Order details</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="phone">Contact number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="For pickup updates"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="note">Note for the kitchen</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Anything the kitchen should know"
                  rows={3}
                  className="mt-1.5"
                />
              </div>
            </div>
          </section>

          {/* --- promo --- */}
          <section className="surface p-5">
            <h2 className="font-display text-base font-semibold">Promo code</h2>
            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Tag
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                  placeholder="Enter a code"
                  aria-label="Promo code"
                  className="pl-9"
                />
              </div>
              <Button type="button" variant="outline" onClick={() => void applyPromo()}>
                Apply
              </Button>
            </div>
            {discountLabel && (
              <p className="mt-2.5 text-sm text-success">{discountLabel}</p>
            )}
          </section>
        </div>

        {/* --- summary --- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface p-5">
            <h2 className="font-display text-base font-semibold">
              {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"}
            </h2>

            <ul className="mt-4 space-y-2 text-sm">
              {cart.items.map((line) => (
                <li key={line.id} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {line.quantity}x {line.menuItem?.name}
                  </span>
                  <Money value={line.lineTotal} size="sm" />
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>
                  <Money value={cart.subtotal} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd>
                  <Money value={cart.tax} />
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5">
                <dt className="font-semibold">Total</dt>
                <dd>
                  <Money value={cart.total} size="lg" />
                </dd>
              </div>
            </dl>

            {appliedPromo && (
              <p className="mt-2 text-xs text-muted-foreground">
                Discount is applied by the server when the order is placed.
              </p>
            )}

            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={isPlacing || walletShort || cart.blockingIssues.length > 0}
              onClick={() => void handlePlaceOrder()}
            >
              {isPlacing && <Spinner className="mr-2" />}
              {method === PaymentMethod.Wallet ? "Pay from wallet" : "Pay now"}
            </Button>

            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link to="/cart">Back to cart</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MethodOption({
  value,
  selected,
  onSelect,
  icon: Icon,
  title,
  subtitle,
  disabled = false,
  disabledHint,
}: {
  value: Method;
  selected: boolean;
  onSelect: (value: Method) => void;
  icon: typeof CreditCard;
  title: string;
  subtitle: string;
  disabled?: boolean;
  disabledHint?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-colors",
        selected ? "border-primary bg-primary-muted" : "border-border hover:bg-secondary",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input
        type="radio"
        name="payment-method"
        value={value}
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(value)}
        className="h-4 w-4 accent-[hsl(var(--primary))]"
      />
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">
          {disabled && disabledHint ? disabledHint : subtitle}
        </span>
      </span>
    </label>
  );
}
