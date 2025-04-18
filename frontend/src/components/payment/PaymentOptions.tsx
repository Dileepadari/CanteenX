
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';

type PaymentMethod = 'creditCard' | 'debitCard' | 'upi' | 'wallet' | 'cash' | 'payLater';

interface PaymentOptionsProps {
  totalAmount: number;
  onPaymentComplete: (method: string) => void;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ totalAmount, onPaymentComplete }) => {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [saveForLater, setSaveForLater] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  const handlePayNow = () => {
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentCancel = () => {
    setIsPaymentDialogOpen(false);
    setIsPaymentSuccess(false);
  };

  const handlePaymentSubmit = () => {
    // Validate payment details based on selected method
    if (selectedMethod === 'creditCard' || selectedMethod === 'debitCard') {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        toast.error('Please fill in all card details');
        return;
      }
    } else if (selectedMethod === 'upi' && !upiId) {
      toast.error('Please enter your UPI ID');
      return;
    } else if (selectedMethod === 'wallet' && !walletId) {
      toast.error('Please enter your wallet details');
      return;
    }

    // Process payment
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaymentSuccess(true);
      
      // Simulate a delay before closing the dialog
      setTimeout(() => {
        setIsPaymentDialogOpen(false);
        setIsPaymentSuccess(false);
        onPaymentComplete(selectedMethod);
        
        // Reset form
        setCardNumber('');
        setCardName('');
        setCardExpiry('');
        setCardCvv('');
        setUpiId('');
        setWalletId('');
      }, 2000);
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const val = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = val.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    
    if (val.length <= 2) {
      setCardExpiry(val);
    } else if (val.length <= 4) {
      setCardExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    }
  };

  return (
    <div className="w-full">
      <Button 
        onClick={handlePayNow} 
        className="w-full flex items-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        Pay Now (₹{totalAmount.toFixed(2)})
      </Button>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {isPaymentSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
              <p className="text-gray-600 text-center mb-6">
                Your payment of ₹{totalAmount.toFixed(2)} has been processed successfully.
              </p>
              <Button onClick={() => setIsPaymentDialogOpen(false)}>
                Continue
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Payment Options</DialogTitle>
                <DialogDescription>
                  Choose your preferred payment method to complete your order.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="mb-6">
                  <RadioGroup 
                    value={selectedMethod} 
                    onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="creditCard" id="creditCard" />
                      <Label htmlFor="creditCard">Credit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="debitCard" id="debitCard" />
                      <Label htmlFor="debitCard">Debit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi">UPI</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet">Wallet</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">Cash on Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="payLater" id="payLater" />
                      <Label htmlFor="payLater">Pay Later</Label>
                    </div>
                  </RadioGroup>
                </div>

                {(selectedMethod === 'creditCard' || selectedMethod === 'debitCard') && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input 
                        id="cardNumber" 
                        value={cardNumber} 
                        onChange={handleCardNumberChange} 
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input 
                        id="cardName" 
                        value={cardName} 
                        onChange={(e) => setCardName(e.target.value)} 
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry">Expiry Date</Label>
                        <Input 
                          id="cardExpiry" 
                          value={cardExpiry} 
                          onChange={handleExpiryChange} 
                          placeholder="MM/YY"
                          maxLength={5}
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input 
                          id="cardCvv" 
                          value={cardCvv} 
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))} 
                          placeholder="123"
                          maxLength={3}
                          type="password"
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === 'upi' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input 
                        id="upiId" 
                        value={upiId} 
                        onChange={(e) => setUpiId(e.target.value)} 
                        placeholder="yourname@upi"
                      />
                    </div>
                    <div className="rounded-md bg-yellow-50 p-3 text-sm flex items-start">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                      <p className="text-yellow-700">You'll receive a payment request on your UPI app.</p>
                    </div>
                  </div>
                )}

                {selectedMethod === 'wallet' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="walletId">Wallet ID / Mobile Number</Label>
                      <Input 
                        id="walletId" 
                        value={walletId} 
                        onChange={(e) => setWalletId(e.target.value)} 
                        placeholder="Your wallet ID or mobile number"
                      />
                    </div>
                    <div className="rounded-md bg-blue-50 p-3 text-sm flex items-start">
                      <AlertCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                      <p className="text-blue-700">You'll be redirected to your wallet app to complete the payment.</p>
                    </div>
                  </div>
                )}

                {selectedMethod === 'payLater' && (
                  <div className="rounded-md bg-gray-50 p-4 text-sm">
                    <h3 className="font-medium mb-2">Pay Later Eligibility</h3>
                    <p className="text-gray-600 mb-4">This option is available for faculty members and registered hostel students only. Your campus ID will be verified.</p>
                    <div className="space-y-2">
                      <Label htmlFor="campusId">Campus ID</Label>
                      <Input 
                        id="campusId" 
                        placeholder="Enter your campus ID"
                      />
                    </div>
                  </div>
                )}

                {selectedMethod !== 'cash' && selectedMethod !== 'payLater' && (
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox 
                      id="savePayment" 
                      checked={saveForLater}
                      onCheckedChange={(checked) => setSaveForLater(checked as boolean)}
                    />
                    <label
                      htmlFor="savePayment"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Save payment details for future orders
                    </label>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={handlePaymentCancel} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button onClick={handlePaymentSubmit} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentOptions;
