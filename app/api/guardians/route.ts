import { NextResponse } from 'next/server';
import { requireVital } from '@/lib/rbac';
import connectDB from '@/lib/db';
import GuardianProfile from '@/models/GuardianProfile';
import Review from '@/models/Review';

export async function GET() {
  try {
    const session = await requireVital();
    await connectDB();

    const guardians = await GuardianProfile.find({}).lean();

    // Calculate average ratings
    const guardiansWithRatings = await Promise.all(
      guardians.map(async (guardian) => {
        const reviews = await Review.find({ guardianId: guardian._id }).lean();
        const ratings = reviews.map((r) => r.rating);
        const averageRating =
          ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : undefined;

        return {
          ...guardian,
          averageRating,
          reviewCount: reviews.length,
        };
      })
    );

    return NextResponse.json(guardiansWithRatings);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

