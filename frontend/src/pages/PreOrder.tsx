
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, Info } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useNotification } from '@/contexts/NotificationContext';
import { format, addDays, isBefore, set } from 'date-fns';

const PreOrder = () => {
  const { items, totalPrice, checkout } = useCart();
  const { toast } = useToast();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  
  // Set min date to today and max date to 7 days from now
  const today = new Date();
  const maxDate = addDays(today, 7);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [scheduleNote, setScheduleNote] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  
  // Generate available time slots (from 8am to 8pm, every 30 mins)
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    
    // Start from 8am
    let hour = 8;
    let minute = 0;
    
    while (hour < 20) { // Until 8pm
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // If selected date is today, only show future time slots
      if (!selectedDate || (
          isSameDay(selectedDate, now) && 
          (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes()))
        )) {
        // Skip this time slot
      } else {
        slots.push(timeString);
      }
      
      // Move to next slot
      minute += 30;
      if (minute >= 60) {
        hour += 1;
        minute = 0;
      }
    }
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  // Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };
  
  const getPrepTime = () => {
    // Calculate total preparation time based on items
    const totalPrepTime = items.reduce((total, item) => {
      // Assuming each item takes 5-15 mins to prepare
      const prepTime = Math.floor(Math.random() * 10) + 5;
      return total + (prepTime * item.quantity);
    }, 0);
    
    // Cap at reasonable max time
    return Math.min(totalPrepTime, 45);
  };
  
  const handleScheduleOrder = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select date and time",
        description: "You need to choose when you want to pick up your order",
        variant: "destructive",
      });
      return;
    }
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const pickupDate = set(selectedDate, { hours, minutes });
    
    // In a real app, this would send the scheduled order to the backend
    toast({
      title: "Order scheduled successfully",
      description: `Your order will be ready for pickup on ${format(pickupDate, 'PPP')} at ${selectedTime}`,
    });
    
    // Add a notification
    addNotification({
      title: "Pre-Order Scheduled",
      description: `Your order is scheduled for pickup on ${format(pickupDate, 'PPP')} at ${selectedTime}`,
      type: "success",
      action: {
        text: "View Order",
        onClick: () => navigate("/orders"),
      }
    });
    
    // Navigate to orders page after successful checkout
    checkout();
    navigate('/orders');
  };
  
  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Schedule Pickup</h1>
          <p className="text-gray-500 mb-6">Your cart is empty. Add items to your cart before scheduling a pickup.</p>
          <Button asChild>
            <a href="/canteens">Browse Canteens</a>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="py-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Schedule Pickup</h1>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Pre-order Benefits</AlertTitle>
          <AlertDescription>
            Schedule your pickup in advance to avoid waiting in line. Your food will be prepared fresh just before your selected time.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
              <CardDescription>Choose when you want to pick up your order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Pickup Date</h3>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => isBefore(date, today) || isBefore(maxDate, date)}
                  className="rounded-md border"
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Pickup Time</h3>
                {selectedDate ? (
                  timeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className="text-sm"
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No available time slots for the selected date.</p>
                  )
                ) : (
                  <p className="text-sm text-gray-500">Please select a date first.</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Special Instructions (Optional)</h3>
                <textarea 
                  className="w-full p-2 border rounded-md resize-none" 
                  rows={3}
                  placeholder="Any special requests for your order?"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your order details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.quantity} × {item.name}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="mt-4 bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium mb-2">Estimated Preparation Time</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Approximately {getPrepTime()} minutes</span>
                  </div>
                </div>
                
                {selectedDate && selectedTime && (
                  <>
                    <Separator />
                    <div className="mt-4 bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium mb-2">Pickup Information</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{selectedTime}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleScheduleOrder}
                disabled={!selectedDate || !selectedTime}
              >
                Schedule Order
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PreOrder;
