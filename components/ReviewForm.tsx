'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { StarRating } from './StarRating';
import { Toast } from './ui/toast';

interface ReviewFormProps {
  bookingId: string;
  guardianName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ bookingId, guardianName, onSuccess }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setToastMessage('Please select a rating');
      setShowToast(true);
      return;
    }

    if (reviewText.length > 500) {
      setToastMessage('Review text must be less than 500 characters');
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          rating,
          reviewText: reviewText.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToastMessage(data.error || 'Failed to submit review');
        setShowToast(true);
        return;
      }

      setToastMessage('✅ Thank you! Your review helps improve care quality.');
      setShowToast(true);

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      setToastMessage('An error occurred. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
          <CardDescription>
            Your feedback helps improve care quality. Share your experience with {guardianName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="rating" className="mb-2 block">
                Rating *
              </Label>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="lg"
                readonly={false}
              />
              <p className="mt-2 text-xs text-text-muted">
                Select a rating from 1 to 5 stars
              </p>
            </div>

            <div>
              <Label htmlFor="reviewText" className="mb-2 block">
                Review (Optional)
              </Label>
              <Textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience... (max 500 characters)"
                rows={5}
                maxLength={500}
                className="resize-none"
                aria-describedby="reviewText-help"
              />
              <p id="reviewText-help" className="mt-1 text-xs text-text-muted">
                {reviewText.length}/500 characters
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || rating === 0} className="flex-1">
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-text-muted italic">
              Note: Reviews cannot be edited after submission.
            </p>
          </form>
        </CardContent>
      </Card>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastMessage.includes('✅') ? 'success' : 'error'}
          onClose={() => setShowToast(false)}
          duration={5000}
        />
      )}
    </>
  );
}

