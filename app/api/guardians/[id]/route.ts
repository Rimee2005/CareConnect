import { NextResponse } from 'next/server';
import { requireVital } from '@/lib/rbac';
import connectDB from '@/lib/db';
import GuardianProfile from '@/models/GuardianProfile';
import Review from '@/models/Review';

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

    return NextResponse.json({
      ...guardian,
      averageRating,
      reviewCount: reviews.length,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

