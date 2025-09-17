import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Star, MessageCircle } from 'lucide-react';
import { reviewsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const ReviewModal = ({ isOpen, onClose, item, itemType, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please write a comment about your experience.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const reviewData = {
        rating,
        comment: comment.trim(),
        [itemType === 'destination' ? 'destination_id' : 'provider_id']: item.destination_id || item.provider_id
      };

      await reviewsAPI.create(reviewData);
      
      toast({
        title: "Review Submitted!",
        description: `Thank you for reviewing ${item.destination_name || item.provider_name}`,
      });

      // Reset form
      setRating(0);
      setComment('');
      
      // Call callback to refresh data
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      onClose();
      
    } catch (error) {
      console.error('Review submission error:', error);
      const errorMessage = error.response?.data?.detail || "Failed to submit review. Please try again.";
      toast({
        title: "Review Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Write a Review
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Info */}
          <div className="text-center bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold">
              {item.destination_name || item.provider_name}
            </h3>
            <p className="text-sm text-gray-600">
              {itemType === 'destination' ? 'Destination' : 'Service Provider'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Booking Date: {new Date(item.booking_date).toLocaleDateString()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div className="text-center">
              <label className="block text-sm font-medium mb-3">
                How would you rate your experience?
              </label>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRatingClick(star)}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {rating} out of 5 stars
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <MessageCircle className="h-4 w-4 inline mr-1" />
                Tell others about your experience
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details about your experience, what you liked, and any tips for future visitors..."
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="5"
                maxLength="500"
                required
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {comment.length}/500 characters
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || rating === 0 || !comment.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>

          {/* Review Guidelines */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Review Guidelines:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Be honest and helpful to other travelers</li>
              <li>• Focus on your personal experience</li>
              <li>• Avoid offensive or inappropriate content</li>
              <li>• Reviews can only be submitted for completed bookings</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;