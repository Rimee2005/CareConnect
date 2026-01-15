import Booking from '@/models/Booking';
import Review from '@/models/Review';
import GuardianProfile from '@/models/GuardianProfile';

/**
 * Calculate average response time for a Guardian
 * Based on time between booking request and acceptance/rejection
 */
export async function calculateResponseSpeed(guardianId: string): Promise<number | null> {
  try {
    const bookings = await Booking.find({
      guardianId,
      status: { $in: ['ACCEPTED', 'REJECTED'] },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    if (bookings.length === 0) {
      return null;
    }

    let totalResponseTime = 0;
    let validResponses = 0;

    for (const booking of bookings) {
      // Find when status changed to ACCEPTED or REJECTED
      // For simplicity, we'll use updatedAt - createdAt as approximation
      // In production, you'd track status change timestamps
      const responseTime = booking.updatedAt.getTime() - booking.createdAt.getTime();
      if (responseTime > 0 && responseTime < 7 * 24 * 60 * 60 * 1000) { // Within 7 days
        totalResponseTime += responseTime;
        validResponses++;
      }
    }

    if (validResponses === 0) {
      return null;
    }

    const avgResponseTimeMs = totalResponseTime / validResponses;
    return Math.round(avgResponseTimeMs / (60 * 1000)); // Convert to minutes
  } catch (error) {
    console.error('Error calculating response speed:', error);
    return null;
  }
}

/**
 * Format response speed for display
 */
export function formatResponseSpeed(minutes: number | null): string {
  if (!minutes) {
    return 'Response time not available';
  }

  if (minutes < 15) {
    return 'Usually responds within 15 minutes';
  } else if (minutes < 60) {
    return `Responds within ${Math.round(minutes)} minutes`;
  } else if (minutes < 1440) {
    const hours = Math.round(minutes / 60);
    return `Responds within ${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.round(minutes / 1440);
    return `Responds within ${days} day${days > 1 ? 's' : ''}`;
  }
}

/**
 * Calculate repeat booking count
 * Number of unique Vitals who booked this Guardian more than once
 */
export async function calculateRepeatBookings(guardianId: string): Promise<number> {
  try {
    const bookings = await Booking.find({ guardianId })
      .select('vitalId')
      .lean();

    const vitalBookingCounts = new Map<string, number>();
    bookings.forEach((booking) => {
      const vitalId = booking.vitalId.toString();
      vitalBookingCounts.set(vitalId, (vitalBookingCounts.get(vitalId) || 0) + 1);
    });

    let repeatCount = 0;
    vitalBookingCounts.forEach((count) => {
      if (count > 1) {
        repeatCount++;
      }
    });

    return repeatCount;
  } catch (error) {
    console.error('Error calculating repeat bookings:', error);
    return 0;
  }
}

/**
 * Get availability status for today/tomorrow
 */
export function getAvailabilityStatus(
  availability: {
    days: string[];
    hours: { start: string; end: string };
    shiftType?: 'Morning' | 'Night' | '24×7';
  }
): {
  today: 'Available' | 'Not Available' | 'Limited';
  tomorrow: 'Available' | 'Not Available' | 'Limited';
  shiftType?: string;
} {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[today.getDay()];
  const tomorrowName = dayNames[tomorrow.getDay()];

  const isAvailableToday = availability.days.includes(todayName);
  const isAvailableTomorrow = availability.days.includes(tomorrowName);

  return {
    today: isAvailableToday ? 'Available' : 'Not Available',
    tomorrow: isAvailableTomorrow ? 'Available' : 'Not Available',
    shiftType: availability.shiftType,
  };
}

/**
 * Calculate reliability score (completion rate)
 */
export async function calculateReliabilityScore(guardianId: string): Promise<number> {
  try {
    const totalBookings = await Booking.countDocuments({
      guardianId,
      status: { $in: ['ACCEPTED', 'ONGOING', 'COMPLETED'] },
    });

    if (totalBookings === 0) {
      return 0;
    }

    const completedBookings = await Booking.countDocuments({
      guardianId,
      status: 'COMPLETED',
    });

    return Math.round((completedBookings / totalBookings) * 100);
  } catch (error) {
    console.error('Error calculating reliability score:', error);
    return 0;
  }
}

/**
 * Format reliability score for display
 */
export function formatReliabilityScore(score: number): string {
  if (score >= 95) {
    return `${score}% bookings completed`;
  } else if (score >= 80) {
    return `${score}% completion rate`;
  } else {
    return `Low cancellation rate`;
  }
}

