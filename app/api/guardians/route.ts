import { NextResponse } from 'next/server';
import { requireVital } from '@/lib/rbac';
import connectDB from '@/lib/db';
import { matchGuardians } from '@/lib/ai-matching';
import { calculateGuardianRating } from '@/lib/ratings';
import { calculateResponseSpeed, calculateRepeatBookings, calculateReliabilityScore } from '@/lib/guardian-metrics';
import { featureFlags } from '@/lib/feature-flags';
import VitalProfile from '@/models/VitalProfile';
import GuardianProfile from '@/models/GuardianProfile';
import Review from '@/models/Review';
import Booking from '@/models/Booking';

export async function GET(request: Request) {
  try {
    const session = await requireVital(request);
    await connectDB();

    // Get Vital profile for AI matching input
    const vitalProfile = await VitalProfile.findOne({
      userId: session.user.id,
    }).lean();

    if (!vitalProfile) {
      return NextResponse.json({ error: 'Vital profile not found' }, { status: 404 });
    }

    // Prepare matching input
    const matchingInput = {
      vitalLocation: vitalProfile.location?.coordinates,
      vitalHealthNeeds: vitalProfile.healthNeeds,
      vitalHealthTags: vitalProfile.healthTags,
      vitalCity: vitalProfile.location?.city,
    };

    // Get AI-matched guardians
    const matchedGuardians = await matchGuardians(matchingInput);

    // Enrich with rating stats and new metrics
    const enrichedGuardians = await Promise.all(
      matchedGuardians.map(async ({ guardian, matchScore }) => {
        const ratingStats = await calculateGuardianRating(guardian._id.toString());
        const guardianId = guardian._id.toString();
        
        const enriched: any = {
          ...guardian,
          _id: guardianId,
          averageRating: ratingStats.averageRating,
          reviewCount: ratingStats.totalReviews,
          aiMatch: {
            score: matchScore.score,
            explanation: matchScore.explanation,
            reasons: matchScore.reasons,
            isRecommended: matchScore.score > 50, // Threshold for "recommended"
          },
        };

        // Add new metrics if feature flag is enabled
        if (featureFlags.ADVANCED_GUARDIAN_PROFILE) {
          enriched.responseSpeed = await calculateResponseSpeed(guardianId);
          enriched.repeatBookings = await calculateRepeatBookings(guardianId);
          enriched.reliability = await calculateReliabilityScore(guardianId);
          
          // Calculate verification badges
          const reviews = await Review.find({ guardianId }).lean();
          const bookings = await Booking.find({ guardianId }).lean();
          const hasRepeatBookings = bookings.length > 0 && new Set(bookings.map(b => b.vitalId.toString())).size < bookings.length;
          
          enriched.verificationBadges = {
            idVerified: guardian.isVerified || false,
            certificationUploaded: guardian.certifications && guardian.certifications.length > 0,
            highlyRated: ratingStats.averageRating >= 4.5 && ratingStats.totalReviews >= 5,
            repeatBookings: hasRepeatBookings,
          };
        }

        return enriched;
      })
    );

    return NextResponse.json(enrichedGuardians);
  } catch (error: any) {
    console.error('[Guardians API] Error:', error.message, error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

