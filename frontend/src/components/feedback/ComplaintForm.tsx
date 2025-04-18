
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNotification } from '@/contexts/NotificationContext';
import { AlertTriangle } from 'lucide-react';

interface ComplaintFormProps {
  orderId?: number;
  canteenId?: number;
  onSubmitSuccess?: () => void;
}

type ComplaintType = 'wrong-order' | 'quality-issue' | 'delivery-issue' | 'payment-issue' | 'other';

const ComplaintForm: React.FC<ComplaintFormProps> = ({ 
  orderId, 
  canteenId,
  onSubmitSuccess 
}) => {
  const { addNotification } = useNotification();
  const [complaintType, setComplaintType] = useState<ComplaintType>('wrong-order');
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error("Please describe your issue");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call to submit complaint
    setTimeout(() => {
      console.log("Complaint submitted:", {
        orderId,
        canteenId,
        complaintType,
        description,
        contactNumber,
        urgency
      });
      
      toast.success("Your complaint has been registered");
      
      addNotification({
        title: "Complaint Registered",
        description: `Your complaint (#${Math.floor(Math.random() * 10000)}) has been registered. We'll get back to you soon.`,
        type: "info",
      });

      setDescription('');
      setContactNumber('');
      setIsSubmitting(false);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    }, 1500);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
          Report an Issue
        </CardTitle>
        <CardDescription>
          We're sorry to hear you've experienced an issue. Please let us know what went wrong.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>What type of issue are you facing?</Label>
            <RadioGroup 
              value={complaintType} 
              onValueChange={value => setComplaintType(value as ComplaintType)}
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wrong-order" id="wrong-order" />
                <Label htmlFor="wrong-order" className="cursor-pointer">Wrong/Incomplete Order</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quality-issue" id="quality-issue" />
                <Label htmlFor="quality-issue" className="cursor-pointer">Food Quality Issue</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery-issue" id="delivery-issue" />
                <Label htmlFor="delivery-issue" className="cursor-pointer">Delivery/Pickup Issue</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="payment-issue" id="payment-issue" />
                <Label htmlFor="payment-issue" className="cursor-pointer">Payment Problem</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="cursor-pointer">Other Issue</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Describe the issue in detail</Label>
            <Textarea
              id="description"
              placeholder="Please provide as much detail as possible..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact number (optional)</Label>
            <Input
              id="contactNumber"
              type="tel"
              placeholder="Your phone number for follow-up"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency level</Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger id="urgency">
                <SelectValue placeholder="Select urgency level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Can be resolved later</SelectItem>
                <SelectItem value="medium">Medium - Needs attention soon</SelectItem>
                <SelectItem value="high">High - Immediate attention required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md bg-blue-50 p-3 text-sm">
            <p className="text-blue-700">
              Your complaint will be directed to the canteen manager first. If not resolved within 24 hours, it will be escalated to campus administration.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setDescription('');
              setContactNumber('');
            }}
            disabled={isSubmitting}
          >
            Clear
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Complaint"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ComplaintForm;
