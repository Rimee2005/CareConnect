import { NextResponse } from 'next/server';
import { requireVital } from '@/lib/rbac';
import connectDB from '@/lib/db';
import GuardianProfile from '@/models/GuardianProfile';
import Review from '@/models/Review';
import Booking from '@/models/Booking';
import { calculateResponseSpeed, calculateRepeatBookings, calculateReliabilityScore } from '@/lib/guardian-metrics';
import { featureFlags } from '@/lib/feature-flags';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireVital();
    await connectDB();

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Guardian ID is required' }, { status: 400 });
    }

    const guardian = await GuardianProfile.findById(id).lean();

    if (!guardian) {
      return NextResponse.json({ error: 'Guardian not found' }, { status: 404 });
    }

    // Calculate rating
    const reviews = await Review.find({ guardianId: id }).lean();
    const ratings = reviews.map((r) => r.rating);
    const averageRating =
      ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : undefined;

    const response: any = {
      ...guardian,
      _id: guardian._id.toString(),
      averageRating,
      reviewCount: reviews.length,
      // Explicitly include all fields to ensure they're returned (preserve actual values, don't convert to empty arrays)
      pricing: guardian.pricing ? {
        hourly: guardian.pricing.hourly,
        daily: guardian.pricing.daily,
        monthly: guardian.pricing.monthly,
        priceBreakdown: guardian.pricing.priceBreakdown,
      } : undefined,
      careTags: guardian.careTags ? [...guardian.careTags] : undefined,
      languages: guardian.languages ? [...guardian.languages] : undefined,
      introduction: guardian.introduction || undefined,
      experienceBreakdown: guardian.experienceBreakdown ? [...guardian.experienceBreakdown] : undefined,
      certifications: guardian.certifications ? [...guardian.certifications] : undefined,
    };

    // Add new metrics if feature flag is enabled
    if (featureFlags.ADVANCED_GUARDIAN_PROFILE) {
      response.responseSpeed = await calculateResponseSpeed(id);
      response.repeatBookings = await calculateRepeatBookings(id);
      response.reliability = await calculateReliabilityScore(id);
      
      // Calculate verification badges
      const bookings = await Booking.find({ guardianId: id }).lean();
      const hasRepeatBookings = bookings.length > 0 && new Set(bookings.map(b => b.vitalId.toString())).size < bookings.length;
      
      response.verificationBadges = {
        idVerified: guardian.isVerified || false,
        certificationUploaded: guardian.certifications && guardian.certifications.length > 0,
        highlyRated: averageRating ? averageRating >= 4.5 && reviews.length >= 5 : false,
        repeatBookings: hasRepeatBookings,
      };
    }

    return NextResponse.json(response);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

