
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { canteens } from '@/data/mockData';

// Define feedback form schema
const feedbackSchema = z.object({
  canteenId: z.string().min(1, { message: "Please select a canteen" }),
  rating: z.string().min(1, { message: "Please select a rating" }),
  reviewTitle: z.string().min(3, { message: "Title must be at least 3 characters" }).max(100),
  review: z.string().min(10, { message: "Review must be at least 10 characters" }).max(500),
  recommend: z.string().optional(),
});

// Define complaint form schema
const complaintSchema = z.object({
  canteenId: z.string().min(1, { message: "Please select a canteen" }),
  orderId: z.string().optional(),
  complaintType: z.string().min(1, { message: "Please select a complaint type" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(1000),
  severity: z.string().min(1, { message: "Please select severity level" }),
});

type FeedbackValues = z.infer<typeof feedbackSchema>;
type ComplaintValues = z.infer<typeof complaintSchema>;

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Feedback form
  const feedbackForm = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      canteenId: "",
      rating: "",
      reviewTitle: "",
      review: "",
      recommend: "yes",
    },
  });
  
  // Complaint form
  const complaintForm = useForm<ComplaintValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      canteenId: "",
      orderId: "",
      complaintType: "",
      description: "",
      severity: "",
    },
  });
  
  const onFeedbackSubmit = (values: FeedbackValues) => {
    // In a real app, this would submit feedback to an API
    console.log("Feedback submitted:", values);
    
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback! It helps us improve our services.",
    });
    
    feedbackForm.reset();
    navigate('/');
  };
  
  const onComplaintSubmit = (values: ComplaintValues) => {
    // In a real app, this would submit complaint to an API
    console.log("Complaint submitted:", values);
    
    toast({
      title: "Complaint Filed",
      description: "Your complaint has been logged. We'll look into it immediately.",
    });
    
    complaintForm.reset();
    navigate('/');
  };
  
  return (
    <MainLayout>
      <div className="py-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Feedback & Complaints</h1>
        
        <Tabs defaultValue="feedback" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="feedback">Submit Feedback</TabsTrigger>
            <TabsTrigger value="complaint">File a Complaint</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Share Your Experience</CardTitle>
                <CardDescription>
                  Let us know about your dining experience. Your feedback helps us improve.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...feedbackForm}>
                  <form onSubmit={feedbackForm.handleSubmit(onFeedbackSubmit)} className="space-y-6">
                    <FormField
                      control={feedbackForm.control}
                      name="canteenId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canteen</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a canteen" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {canteens.map((canteen) => (
                                <SelectItem key={canteen.id} value={canteen.id.toString()}>
                                  {canteen.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={feedbackForm.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Rating</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <FormItem 
                                  key={rating} 
                                  className="flex flex-col items-center space-y-1"
                                >
                                  <FormControl>
                                    <RadioGroupItem 
                                      value={rating.toString()} 
                                      className="sr-only" 
                                      id={`rating-${rating}`}
                                    />
                                  </FormControl>
                                  <label
                                    htmlFor={`rating-${rating}`}
                                    className={`p-2 cursor-pointer rounded-full ${
                                      field.value === rating.toString() 
                                        ? "bg-primary text-primary-foreground" 
                                        : "hover:bg-muted"
                                    }`}
                                  >
                                    <svg 
                                      className="h-6 w-6" 
                                      fill="currentColor" 
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  </label>
                                  <span className="text-xs">{rating}</span>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={feedbackForm.control}
                      name="reviewTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review Title</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Excellent service!" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={feedbackForm.control}
                      name="review"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Review</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your experience..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Your review will help others learn about this canteen.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={feedbackForm.control}
                      name="recommend"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Would you recommend this canteen?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="yes" />
                                </FormControl>
                                <FormLabel className="font-normal">Yes</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="no" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">Submit Feedback</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="complaint">
            <Card>
              <CardHeader>
                <CardTitle>File a Complaint</CardTitle>
                <CardDescription>
                  Report an issue with your order or experience. We take all complaints seriously.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...complaintForm}>
                  <form onSubmit={complaintForm.handleSubmit(onComplaintSubmit)} className="space-y-6">
                    <FormField
                      control={complaintForm.control}
                      name="canteenId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canteen</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a canteen" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {canteens.map((canteen) => (
                                <SelectItem key={canteen.id} value={canteen.id.toString()}>
                                  {canteen.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={complaintForm.control}
                      name="orderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order ID (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your order ID if applicable" {...field} />
                          </FormControl>
                          <FormDescription>
                            If your complaint is about a specific order, please provide the order ID.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={complaintForm.control}
                      name="complaintType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complaint Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select complaint type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="food_quality">Food Quality</SelectItem>
                              <SelectItem value="wrong_order">Wrong Order</SelectItem>
                              <SelectItem value="service">Poor Service</SelectItem>
                              <SelectItem value="hygiene">Hygiene Issues</SelectItem>
                              <SelectItem value="payment">Payment Problem</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={complaintForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complaint Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please provide detailed information about your complaint..."
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Please be specific and include any relevant details that can help us address your concern.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={complaintForm.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select severity level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low - Minor issue</SelectItem>
                              <SelectItem value="medium">Medium - Significant problem</SelectItem>
                              <SelectItem value="high">High - Serious concern</SelectItem>
                              <SelectItem value="urgent">Urgent - Requires immediate attention</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">Submit Complaint</Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <p className="text-sm text-gray-500">
                  Note: All complaints are initially sent to the canteen management. If not resolved within 48 hours, they will be escalated to campus administration.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Feedback;
