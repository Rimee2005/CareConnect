import Review from '@/models/Review';
import Booking from '@/models/Booking';

export interface RatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentRating: number; // Weighted average of recent reviews
}

/**
 * Calculate aggregated rating statistics for a Guardian
 * Includes weighted recent reviews for AI matching
 */
export async function calculateGuardianRating(guardianId: string): Promise<RatingStats> {
  const reviews = await Review.find({ guardianId })
    .sort({ createdAt: -1 })
    .lean();

  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      recentRating: 0,
    };
  }

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  // Rating distribution
  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  // Calculate recent rating (weighted - last 30 days get higher weight)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let recentWeightedSum = 0;
  let recentWeightedCount = 0;

  reviews.forEach((review) => {
    const reviewDate = new Date(review.createdAt);
    const daysAgo = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);

    // Weight: recent reviews (last 30 days) get 2x weight, older get 1x
    const weight = daysAgo <= 30 ? 2 : 1;
    recentWeightedSum += review.rating * weight;
    recentWeightedCount += weight;
  });

  const recentRating = recentWeightedCount > 0 ? recentWeightedSum / recentWeightedCount : averageRating;

  return {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalReviews: reviews.length,
    ratingDistribution,
    recentRating: Math.round(recentRating * 10) / 10,
  };
}

/**
 * Get completion reliability score (accepted vs cancelled bookings)
 */
export async function calculateCompletionReliability(guardianId: string): Promise<number> {
  const bookings = await Booking.find({ guardianId }).lean();

  if (bookings.length === 0) return 0;

  const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelled = bookings.filter((b) => b.status === 'REJECTED').length;
  const total = bookings.length;

  // Reliability = (completed / total) * 100, penalize cancellations
  const reliability = ((completed - cancelled * 0.5) / total) * 100;
  return Math.max(0, Math.min(100, reliability)); // Clamp between 0-100
}

