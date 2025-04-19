import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApolloClient } from "@apollo/client";
import { GET_CART_ITEMS } from "../gql/queries/cart";
import { GET_CURRENT_USER } from "../gql/queries/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";

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

    const totalAmount = cartItems.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);

    const handleRemoveItem = async (itemId) => {
        // TODO: Implement remove item mutation
        toast({
            title: "Item removed",
            description: "Item has been removed from your cart",
        });
        await fetchCartItems(userId);
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        // TODO: Implement update quantity mutation
        await fetchCartItems(userId);
    };

    const getCurrentDate = () => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    };

    const getNextDays = (days) => {
        const dates = [];
        const now = new Date();

        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() + i);

            const formattedDate = date.toISOString().split('T')[0];
            const displayDate = i === 0 ? "Today" : i === 1 ? "Tomorrow" : date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

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

        setIsProcessingPayment(true);

        setTimeout(() => {
            toast({
                title: "Order placed successfully!",
                description: "Your order has been confirmed.",
            });
            // TODO: Clear cart mutation or state update needed here
            navigate("/orders");

            setIsProcessingPayment(false);
        }, 2000);
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
                <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold text-orange-600">Your Cart</h1>

                    {cartItems.length > 0 ? (
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <Card className="border border-orange-100 shadow-md overflow-hidden animate-fade-in">
                                    <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                                        <CardTitle>Order Items ({cartItems.length})</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-6">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex items-start justify-between py-4 border-b last:border-b-0 hover:bg-orange-50 transition-colors rounded-md p-2">
                                                <div className="flex-grow">
                                                    <div className="flex items-start justify-between">
                                                        <h3 className="font-medium text-orange-700">{item.name}</h3>
                                                        <p className="font-semibold text-orange-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{item.canteenName}</p>

                                                    {(item.customizations?.size ||
                                                        item.customizations?.additions?.length ||
                                                        item.customizations?.removals?.length ||
                                                        item.customizations?.notes) && (
                                                            <div className="mt-2 text-sm text-gray-600 bg-orange-50 p-2 rounded-md">
                                                                {item.customizations.size && (
                                                                    <p className="capitalize">Size: {item.customizations.size}</p>
                                                                )}

                                                                {item.customizations.additions?.length && (
                                                                    <p>Additions: {item.customizations.additions.join(", ")}</p>
                                                                )}

                                                                {item.customizations.removals?.length && (
                                                                    <p>Removals: {item.customizations.removals.join(", ")}</p>
                                                                )}

                                                                {item.customizations.notes && (
                                                                    <p>Notes: {item.customizations.notes}</p>
                                                                )}
                                                            </div>
                                                        )}

                                                    <div className="flex items-center mt-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="w-7 h-7 border-orange-200 text-orange-600"
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </Button>
                                                        <span className="w-8 text-center">{item.quantity}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="w-7 h-7 border-orange-200 text-orange-600"
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card className="mt-6 border border-orange-100 shadow-md animate-fade-in">
                                    <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                                        <CardTitle>Pickup Details</CardTitle>
                                        <CardDescription className="text-orange-100">
                                            Choose when you want to pick up your order
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between border-orange-200 hover:bg-orange-50 hover:border-orange-300">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                                                        {scheduledPickup ? (
                                                            <>
                                                                <span className="text-orange-700">
                                                                    {dates.find(d => d.value === scheduledPickup.date)?.label || scheduledPickup.date}
                                                                </span>
                                                                <span className="mx-2">at</span>
                                                                <Clock className="w-4 h-4 mr-2 text-orange-500" />
                                                                <span className="text-orange-700">
                                                                    {timeSlots.find(t => t.value === scheduledPickup.time)?.label || scheduledPickup.time}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-500">Select pickup date & time</span>
                                                        )}
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 ml-2 text-orange-500" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="border-orange-200">
                                                <DialogHeader>
                                                    <DialogTitle className="text-orange-600">Select Pickup Time</DialogTitle>
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
                                                            <SelectTrigger className="border-orange-200">
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
                                                            <SelectTrigger className="border-orange-200">
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
                                                        className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
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
                            </div>

                            <div>
                                <Card className="sticky top-20 border border-orange-100 shadow-md animate-fade-in">
                                    <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                                        <CardTitle>Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>₹{totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Taxes (5%)</span>
                                            <span>₹{(totalAmount * 0.05).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-lg pt-2 border-t border-orange-100">
                                            <span>Total</span>
                                            <span className="text-orange-600">₹{(totalAmount * 1.05).toFixed(2)}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex-col space-y-4 p-6 bg-gradient-to-br from-orange-50 to-white">
                                        <Button
                                            className="w-full bg-orange-500 hover:bg-orange-600"
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
                                        <Button variant="outline" className="w-full border-orange-200 text-orange-600 hover:bg-orange-50" onClick={() => navigate("/menu")}>
                                            Continue Shopping
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
                            <div className="p-8 mb-8 text-8xl bg-orange-100 rounded-full">
                                <ShoppingBag className="w-20 h-20 text-orange-500" />
                            </div>
                            <h2 className="mb-3 text-3xl font-semibold text-orange-600">Your cart is empty</h2>
                            <p className="mb-8 text-lg text-gray-600 max-w-md text-center">Looks like you haven't added any items to your cart yet. Explore our delicious menu to get started!</p>
                            <Button onClick={() => navigate("/menu")} className="px-8 py-6 text-lg bg-orange-500 hover:bg-orange-600 animate-pulse">
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
