import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApolloClient } from "@apollo/client";
import { GET_CART_ITEMS } from "@/gql/queries/cart";
import { GET_CURRENT_USER } from "@/gql/queries/user";
import { UPDATE_CART_ITEM, REMOVE_FROM_CART, CLEAR_CART} from "@/gql/mutations/cart"
import { Button } from "@/components/ui/button";
import { getPlaceholderImage, ensureImageSrc } from '@/lib/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { toISTDateISO, formatIST } from '@/lib/ist';

import {
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    Calendar,
    Clock,
    ChevronRight,
    Loader2
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const Cart = () => {
    const client = useApolloClient();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [scheduledPickup, setScheduledPickup] = useState(null);
    const PaymentMethods = {
        UPI: 'UPI',
        CASH: 'CASH',
    };
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PaymentMethods.UPI);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [userId, setUserId] = useState("null");

    const fetchCurrentUser = async () => {
        try {
            const { data } = await client.query({
                query: GET_CURRENT_USER,
            });
            if (data?.getCurrentUser) {
                setUserId(data.getCurrentUser.id);
            } else {
                setUserId(null);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch user data.",
            });
            setUserId(null);
        }
    };

    const fetchCartItems = async (uid) => {
        if (!uid) {
            setCartItems([]);
            return;
        }

        console.log("Fetching cart items for user ID:", uid);
        try {
            const { data } = await client.query({
                query: GET_CART_ITEMS,
                variables: { userId: uid },
                fetchPolicy: "network-only",
            });
            if (data?.getCartByUserId) {
                setCartItems(data.getCartByUserId.items || []);
                console.log("Fetched cart items:", data.getCartByUserId.items);
                if (data.getCartByUserId.pickupDate && data.getCartByUserId.pickupTime) {
                    setScheduledPickup({
                        date: data.getCartByUserId.pickupDate,
                        time: data.getCartByUserId.pickupTime,
                    });
                } else {
                    setScheduledPickup(null);
                }
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch cart items.",
            });
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (userId !== null) {
            fetchCartItems(userId);
        }
    }, [userId]);

    const toNumber = (v: any) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const totalAmount = cartItems.reduce((total, item) => total + toNumber(item.price) * toNumber(item.quantity), 0);

    // Price breakdown helpers
    const TAX_RATE = 0.05;
    // const SERVICE_FEE = 10.0; // flat service fee, adjust as needed

    const handleRemoveItem = async (itemId) => {
        // Optimistic UI: remove locally first
        const previous = cartItems;
        setCartItems((prev) => prev.filter((it) => it.id !== itemId));

        try {
            const { data } = await client.mutate({
                mutation: REMOVE_FROM_CART,
                variables: { cartItemId: itemId },
            });

            if (!data?.removeFromCart?.success) {
                throw new Error(data?.removeFromCart?.message || 'Remove failed');
            }

            toast({
                title: "Item removed",
                description: "Item has been removed from your cart",
            });
        } catch (error) {
            // Revert optimistic update
            setCartItems(previous);
            toast({
                title: "Error",
                description: error?.message || "Failed to remove item from cart.",
                variant: "destructive",
            });
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        const item = cartItems.find((i) => i.id === itemId);
        if (!item) return;

        // If newQuantity < 1, remove the item instead
        if (newQuantity < 1) {
            await handleRemoveItem(itemId);
            return;
        }

        // Validate against stock if available. Treat null/undefined as no
        // stock constraint; only enforce if a numeric stockCount exists.
        const stock = item.stockCount == null ? null : Number(item.stockCount);
        if (stock !== null && newQuantity > stock) {
            toast({ title: 'Not enough stock', description: `Only ${stock} left`, variant: 'destructive' });
            return;
        }

        // Optimistic UI change
        const previous = cartItems;
        setCartItems((prev) => prev.map((it) => it.id === itemId ? { ...it, quantity: newQuantity } : it));

        try {
            const { data } = await client.mutate({
                mutation: UPDATE_CART_ITEM,
                variables: { cartItemId: itemId, quantity: newQuantity },
            });

            // Backend resolver is exposed as `updateCartItemQuantity`.
            // Check the correct field in the response to determine success.
            if (!data?.updateCartItemQuantity?.success) {
                throw new Error(data?.updateCartItemQuantity?.message || 'Update failed');
            }

            toast({ title: 'Quantity updated', description: 'Item quantity has been updated in your cart' });
        } catch (error) {
            setCartItems(previous);
            toast({ title: 'Error', description: error?.message || 'Failed to update item quantity.', variant: 'destructive' });
        }
    };

    const getCurrentDate = () => {
        return toISTDateISO(new Date()) || '';
    };

    const getNextDays = (days) => {
        const dates = [];
        const now = new Date();

        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() + i);

            const formattedDate = toISTDateISO(date) || '';
            const displayDate = i === 0 ? "Today" : i === 1 ? "Tomorrow" : formatIST(date, { weekday: 'long', month: 'short', day: 'numeric' });

            dates.push({ value: formattedDate, label: displayDate });
        }

        return dates;
    };

    const getTimeSlots = () => {
        const slots = [];
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        const isToday = scheduledPickup?.date === getCurrentDate();

        const startHour = isToday ? currentHour + 1 : 8;

        for (let hour = startHour; hour <= 21; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                if (isToday && hour === currentHour && minute <= currentMinutes) continue;

                const formattedHour = hour % 12 || 12;
                const period = hour < 12 ? 'AM' : 'PM';
                const formattedMinute = minute === 0 ? '00' : minute;

                const timeString = `${formattedHour}:${formattedMinute} ${period}`;
                const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

                slots.push({ value, label: timeString });
            }
        }

        return slots;
    };

    const dates = getNextDays(7);
    const timeSlots = getTimeSlots();

    const handleCheckout = () => {
        if (!scheduledPickup) {
            toast({
                title: "Pickup time required",
                description: "Please select a pickup date and time",
            });
            setIsDatePickerOpen(true);
            return;
        }

        // Navigate to checkout page with cart information
        navigate("/checkout", { state: { scheduledPickup, selectedPaymentMethod } });
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-muted to-white">
                <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold text-primary">Your Cart</h1>

                    {cartItems.length > 0 ? (
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <Card className="border border-border shadow-md overflow-hidden animate-fade-in">
                                    <CardHeader className="bg-primary text-white">
                                        <CardTitle>Order Items ({cartItems.length})</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-6">
                                        {cartItems.map((item) => {
                                            // Try to parse notes if it's a JSON string
                                            let parsedNotes: any = null;
                                            try {
                                                if (item.customizations?.notes) {
                                                    parsedNotes = JSON.parse(item.customizations.notes);
                                                }
                                            } catch (e) {
                                                parsedNotes = null;
                                            }

                                                                    const lineTotal = toNumber(item.price) * toNumber(item.quantity || 1);
                                            return (
                                                <div key={item.id} className="flex items-start justify-between py-4 border-b last:border-b-0 hover:bg-muted transition-colors rounded-md p-2">
                                                    <div className="flex gap-4 flex-grow">
                                                        <img
                                                            src={ensureImageSrc(item.image, item.menuItemId || item.id, 160, 96)}
                                                            alt={item.name}
                                                            onError={(e) => { (e.target as HTMLImageElement).src = getPlaceholderImage(item.id, 160, 96); }}
                                                            className="w-24 h-16 object-cover rounded-md"
                                                        />
                                                        <div className="flex-grow">
                                                            <div className="flex items-start justify-between">
                                                                <h3 className="font-medium text-primary">{item.name}</h3>
                                                                <p className="font-semibold text-primary">₹{lineTotal.toFixed(2)}</p>
                                                            </div>
                                                            <p className="text-sm text-gray-500">{item.canteenName}</p>

                                                            <div className="mt-2 text-sm text-gray-600 bg-muted/30 p-2 rounded-md">
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <span>Unit price</span>
                                                                        <span>₹{toNumber(item.price).toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <span>Quantity</span>
                                                                        <span>{item.quantity}</span>
                                                                    </div>

                                                                    {item.customizations?.size && (
                                                                        <div className="flex items-center justify-between">
                                                                            <span>Size</span>
                                                                            <span className="capitalize">{item.customizations.size}</span>
                                                                        </div>
                                                                    )}

                                                                    {item.customizations?.additions?.length > 0 && (
                                                                        <div>
                                                                            <div className="text-xs font-medium">Additions</div>
                                                                            <div className="text-sm">{item.customizations.additions.join(', ')}</div>
                                                                        </div>
                                                                    )}

                                                                    {item.customizations?.removals?.length > 0 && (
                                                                        <div>
                                                                            <div className="text-xs font-medium">Removals</div>
                                                                            <div className="text-sm">{item.customizations.removals.join(', ')}</div>
                                                                        </div>
                                                                    )}

                                                                    {parsedNotes && (
                                                                        <div>
                                                                            {parsedNotes.userNotes && <div><strong>Notes:</strong> {parsedNotes.userNotes}</div>}
                                                                            {parsedNotes.cookingRequests && <div><strong>Cooking:</strong> {parsedNotes.cookingRequests}</div>}
                                                                        </div>
                                                                    )}

                                                                    {!parsedNotes && item.customizations?.notes && (
                                                                        <div><strong>Notes:</strong> {item.customizations.notes}</div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center mt-2 gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="w-7 h-7 border-border text-primary"
                                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </Button>
                                                                <span className="w-8 text-center">{item.quantity}</span>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="w-7 h-7 border-border text-primary"
                                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                                    disabled={item.stockCount != null && item.quantity >= Number(item.stockCount)}
                                                                    title={item.stockCount != null && item.quantity >= Number(item.stockCount) ? `Only ${item.stockCount} left` : undefined}
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>

                                <Card className="mt-6 border border-border shadow-md animate-fade-in">
                                    <CardHeader className="bg-primary text-white">
                                        <CardTitle>Pickup Details</CardTitle>
                                        <CardDescription className="text-muted-foreground">
                                            Choose when you want to pick up your order
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                                                <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between border-border hover:bg-muted hover:border-border">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                                                        {scheduledPickup ? (
                                                            <>
                                                                <span className="text-primary">
                                                                    {dates.find(d => d.value === scheduledPickup.date)?.label || scheduledPickup.date}
                                                                </span>
                                                                <span className="mx-2">at</span>
                                                                <Clock className="w-4 h-4 mr-2 text-primary" />
                                                                <span className="text-primary">
                                                                    {timeSlots.find(t => t.value === scheduledPickup.time)?.label || scheduledPickup.time}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-500">Select pickup date & time</span>
                                                        )}
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 ml-2 text-primary" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="border-border">
                                                <DialogHeader>
                                                    <DialogTitle className="text-primary">Select Pickup Time</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Date</label>
                                                        <Select
                                                            value={scheduledPickup?.date || ""}
                                                            onValueChange={(date) => setScheduledPickup({
                                                                date,
                                                                time: scheduledPickup?.time || timeSlots[0]?.value || "12:00"
                                                            })}
                                                        >
                                                            <SelectTrigger className="border-border">
                                                                <SelectValue placeholder="Select date" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {dates.map((date) => (
                                                                    <SelectItem key={date.value} value={date.value}>
                                                                        {date.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Time</label>
                                                        <Select
                                                            value={scheduledPickup?.time || ""}
                                                            onValueChange={(time) => setScheduledPickup({
                                                                date: scheduledPickup?.date || getCurrentDate(),
                                                                time
                                                            })}
                                                            disabled={!scheduledPickup?.date}
                                                        >
                                                            <SelectTrigger className="border-border">
                                                                <SelectValue placeholder="Select time" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {timeSlots.map((time) => (
                                                                    <SelectItem key={time.value} value={time.value}>
                                                                        {time.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <Button
                                                        className="w-full mt-4 bg-primary hover:bg-primary/90"
                                                        onClick={() => setIsDatePickerOpen(false)}
                                                        disabled={!scheduledPickup?.date || !scheduledPickup?.time}
                                                    >
                                                        Confirm Pickup Time
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </CardContent>
                                    </Card>

                                    <Card className="mt-6 border border-border shadow-md animate-fade-in">
                                        <CardHeader className="bg-primary text-white">
                                            <CardTitle>Payment Method</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="flex gap-3">
                                                <button
                                                    className={`px-4 py-2 rounded-md border ${selectedPaymentMethod === PaymentMethods.UPI ? 'bg-primary text-white' : 'bg-white'}`}
                                                    onClick={() => setSelectedPaymentMethod(PaymentMethods.UPI)}
                                                >
                                                    UPI / Online
                                                </button>
                                                <button
                                                    className={`px-4 py-2 rounded-md border ${selectedPaymentMethod === PaymentMethods.CASH ? 'bg-primary text-white' : 'bg-white'}`}
                                                    onClick={() => setSelectedPaymentMethod(PaymentMethods.CASH)}
                                                >
                                                    Cash on Pickup
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                            </div>

                            <div>
                                <Card className="sticky top-20 border border-border shadow-md animate-fade-in">
                                    <CardHeader className="bg-primary text-white">
                                        <CardTitle>Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>₹{totalAmount.toFixed(2)}</span>
                                        </div>
                                        {/* <div className="flex justify-between text-sm text-gray-500">
                                            <span>Service fee</span>
                                            <span>₹{SERVICE_FEE.toFixed(2)}</span>
                                        </div> */}
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Taxes ({(TAX_RATE * 100).toFixed(0)}%)</span>
                                            <span>₹{(totalAmount * TAX_RATE).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                                            <span>Total</span>
                                            <span className="text-primary">₹{(totalAmount  + totalAmount * TAX_RATE).toFixed(2)}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex-col space-y-4 p-6 bg-gradient-to-br from-muted to-white">
                                        <Button
                                            className="w-full bg-primary hover:bg-primary/90"
                                            onClick={handleCheckout}
                                            disabled={isProcessingPayment}
                                        >
                                            {isProcessingPayment ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingBag className="w-4 h-4 mr-2" /> Checkout
                                                </>
                                            )}
                                        </Button>
                                        <Button variant="outline" className="w-full border-border text-primary hover:bg-muted" onClick={() => navigate("/menu")}> 
                                            Continue Shopping
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
                            <div className="p-8 mb-8 text-8xl bg-muted/30 rounded-full">
                                <ShoppingBag className="w-20 h-20 text-primary" />
                            </div>
                            <h2 className="mb-3 text-3xl font-semibold text-primary">Your cart is empty</h2>
                            <p className="mb-8 text-lg text-gray-600 max-w-md text-center">Looks like you haven't added any items to your cart yet. Explore our delicious menu to get started!</p>
                            <Button onClick={() => navigate("/menu")} className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 animate-pulse">
                                Browse Menu
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Cart;
