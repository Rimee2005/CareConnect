import { NextResponse } from 'next/server';
import { requireGuardian } from '@/lib/rbac';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import GuardianProfile from '@/models/GuardianProfile';
import VitalProfile from '@/models/VitalProfile';

export async function GET() {
  try {
    const session = await requireGuardian();
    await connectDB();

    // Get Guardian profile
    const guardianProfile = await GuardianProfile.findOne({
      userId: session.user.id,
    });

    if (!guardianProfile) {
      return NextResponse.json({ error: 'Guardian profile not found' }, { status: 404 });
    }

    // Fetch all reviews for this Guardian
    const reviews = await Review.find({ guardianId: guardianProfile._id })
      .populate('vitalId', 'name profilePhoto', VitalProfile)
      .sort({ createdAt: -1 })
      .lean();

    // Format reviews for frontend
    const formattedReviews = reviews.map((review) => {
      const vitalId = typeof review.vitalId === 'object' && review.vitalId !== null && '_id' in review.vitalId
        ? review.vitalId as { _id: any; name?: string; profilePhoto?: string }
        : null;
      
      return {
        ...review,
        _id: review._id.toString(),
        bookingId: review.bookingId.toString(),
        vitalId: vitalId ? {
          _id: vitalId._id.toString(),
          name: vitalId.name || '',
          profilePhoto: vitalId.profilePhoto || '',
        } : { _id: '', name: '', profilePhoto: '' },
        reviewText: review.reviewText || '',
        createdAt: review.createdAt,
      };
    });

    return NextResponse.json(formattedReviews);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

