import { NextResponse } from 'next/server';
import { requireVital } from '@/lib/rbac';
import connectDB from '@/lib/db';
import { matchGuardians } from '@/lib/ai-matching';
import { calculateGuardianRating } from '@/lib/ratings';
import VitalProfile from '@/models/VitalProfile';

export async function GET(request: Request) {
  try {
    const session = await requireVital();
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

    // Enrich with rating stats
    const enrichedGuardians = await Promise.all(
      matchedGuardians.map(async ({ guardian, matchScore }) => {
        const ratingStats = await calculateGuardianRating(guardian._id.toString());
        return {
          ...guardian,
          _id: guardian._id.toString(),
          averageRating: ratingStats.averageRating,
          reviewCount: ratingStats.totalReviews,
          aiMatch: {
            score: matchScore.score,
            explanation: matchScore.explanation,
            reasons: matchScore.reasons,
            isRecommended: matchScore.score > 50, // Threshold for "recommended"
          },
        };
      })
    );

    return NextResponse.json(enrichedGuardians);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

