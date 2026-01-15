import { NextResponse } from 'next/server';
import { requireGuardian } from '@/lib/rbac';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import GuardianProfile from '@/models/GuardianProfile';
import VitalProfile from '@/models/VitalProfile';
import mongoose from 'mongoose';

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
      // Handle populated vitalId - TypeScript doesn't know it's populated with .lean()
      const vitalId = review.vitalId as unknown as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; profilePhoto?: string };
      
      let vitalData: { _id: string; name: string; profilePhoto?: string };
      
      // Check if vitalId is populated (has name property) or just an ObjectId
      if (vitalId && typeof vitalId === 'object' && 'name' in vitalId) {
        // It's populated
        vitalData = {
          _id: vitalId._id.toString(),
          name: vitalId.name || 'Unknown',
          profilePhoto: vitalId.profilePhoto || undefined,
        };
      } else {
        // It's just an ObjectId - fetch the vital profile separately
        vitalData = {
          _id: (vitalId as mongoose.Types.ObjectId).toString(),
          name: 'Unknown',
          profilePhoto: undefined,
        };
      }

      return {
        ...review,
        _id: review._id.toString(),
        bookingId: review.bookingId.toString(),
        vitalId: vitalData,
        reviewText: review.reviewText || undefined,
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

