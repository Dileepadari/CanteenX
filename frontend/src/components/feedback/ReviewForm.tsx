
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewFormProps {
  itemId?: number;
  canteenId?: number;
  orderId?: number;
  onSubmitSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  itemId, 
  canteenId, 
  orderId,
  onSubmitSuccess 
}) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetName = itemId 
    ? "this item" 
    : canteenId 
      ? "this canteen" 
      : "your order";

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleStarHover = (hoveredRating: number) => {
    setHoverRating(hoveredRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating before submitting");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call to submit review
    setTimeout(() => {
      console.log("Review submitted:", {
        rating,
        reviewText,
        itemId,
        canteenId,
        orderId
      });
      
      toast.success(`Your review has been submitted. Thank you for your feedback!`);
      setRating(0);
      setReviewText('');
      setIsSubmitting(false);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience with {targetName}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {rating === 1
                ? "Poor"
                : rating === 2
                ? "Below Average"
                : rating === 3
                ? "Average"
                : rating === 4
                ? "Good"
                : rating === 5
                ? "Excellent"
                : "Select a rating"}
            </p>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder={`Tell us about your experience with ${targetName}...`}
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setRating(0);
              setReviewText('');
            }}
            disabled={isSubmitting}
          >
            Clear
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ReviewForm;
