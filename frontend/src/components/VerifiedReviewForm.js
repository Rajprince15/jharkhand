import React, { useState } from 'react';
import { Star, Shield, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const VerifiedReviewForm = ({ 
  bookingId, 
  destinationId, 
  onReviewSubmitted, 
  isBlockchainVerified = false 
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [enableBlockchainVerification, setEnableBlockchainVerification] = useState(true);
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');

  const submitReview = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Review comment must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      // First submit the regular review
      const reviewResponse = await fetch(`${backendUrl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination_id: destinationId,
          rating: rating,
          comment: comment.trim(),
          booking_id: bookingId
        })
      });

      if (!reviewResponse.ok) {
        throw new Error('Failed to submit review');
      }

      const reviewData = await reviewResponse.json();

      // If blockchain verification is enabled and booking is verified, verify the review
      if (enableBlockchainVerification && isBlockchainVerified) {
        try {
          const verifyResponse = await fetch(`${backendUrl}/api/blockchain/reviews/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              review_id: reviewData.review.id,
              booking_id: bookingId,
              destination_id: destinationId
            })
          });

          if (verifyResponse.ok) {
            const verificationData = await verifyResponse.json();
            reviewData.blockchain_verification = verificationData;
          }
        } catch (verificationError) {
          console.error('Blockchain verification failed:', verificationError);
          // Continue even if blockchain verification fails
        }
      }

      setSuccess(true);
      if (onReviewSubmitted) {
        onReviewSubmitted(reviewData);
      }

      // Reset form
      setTimeout(() => {
        setRating(0);
        setComment('');
        setSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, setRating, disabled = false }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setRating(star)}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => !disabled && setHoverRating(0)}
            className={`p-1 ${disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (success) {
    return (
      <div className="bg-green-50 rounded-lg p-6 border border-green-200 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-green-900 mb-2">
          Review Submitted Successfully!
        </h3>
        <p className="text-green-700">
          {enableBlockchainVerification && isBlockchainVerified 
            ? 'Your review has been submitted and verified on the blockchain.'
            : 'Your review has been submitted successfully.'}
        </p>
        {enableBlockchainVerification && isBlockchainVerified && (
          <div className="mt-3 flex items-center justify-center text-sm text-green-600">
            <Shield className="h-4 w-4 mr-2" />
            Blockchain Verified Review
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Write a Review
        </h3>
        {isBlockchainVerified && (
          <div className="flex items-center text-sm text-green-600">
            <Shield className="h-4 w-4 mr-2" />
            Blockchain Verified Booking
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={submitReview} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-3">
            <StarRating rating={rating} setRating={setRating} disabled={isSubmitting} />
            <span className="text-sm text-gray-500">
              {rating > 0 ? `${rating} out of 5 stars` : 'Select a rating'}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Review Comment *
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this destination..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 characters (minimum 10 required)
          </p>
        </div>

        {/* Blockchain Verification Option */}
        {isBlockchainVerified && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start">
              <input
                id="blockchain-verification"
                type="checkbox"
                checked={enableBlockchainVerification}
                onChange={(e) => setEnableBlockchainVerification(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <div className="ml-3">
                <label htmlFor="blockchain-verification" className="text-sm font-medium text-blue-900">
                  Verify this review on blockchain
                </label>
                <p className="text-sm text-blue-700 mt-1">
                  Create an immutable record of your review, increasing trust and authenticity. 
                  Verified reviews may receive additional loyalty points.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isBlockchainVerified && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  Blockchain verification not available
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  To submit blockchain-verified reviews, your booking must first be verified on the blockchain.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Review
                {enableBlockchainVerification && isBlockchainVerified && (
                  <Shield className="h-4 w-4 ml-2" />
                )}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Blockchain Benefits */}
      {isBlockchainVerified && enableBlockchainVerification && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Shield className="h-4 w-4 mr-2 text-green-500" />
            Blockchain Verification Benefits
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center">
              <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
              Immutable review record
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
              Increased trustworthiness
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
              Bonus loyalty points
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
              Fraud prevention
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifiedReviewForm;