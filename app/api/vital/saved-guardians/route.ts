import { NextResponse } from 'next/server';
import { requireVital } from '@/lib/rbac';
import connectDB from '@/lib/db';
import SavedGuardian from '@/models/SavedGuardian';
import VitalProfile from '@/models/VitalProfile';
import GuardianProfile from '@/models/GuardianProfile';
import Review from '@/models/Review';

export async function GET() {
  try {
    const session = await requireVital();
    await connectDB();

    const vitalProfile = await VitalProfile.findOne({
      userId: session.user.id,
    });

    if (!vitalProfile) {
      return NextResponse.json({ error: 'Vital profile not found' }, { status: 404 });
    }

    const savedGuardians = await SavedGuardian.find({ vitalId: vitalProfile._id })
      .populate('guardianId')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate ratings for each guardian
    const guardiansWithRatings = await Promise.all(
      savedGuardians.map(async (sg: any) => {
        const guardian = sg.guardianId;
        if (!guardian) return null;

        const reviews = await Review.find({ guardianId: guardian._id }).lean();
        const ratings = reviews.map((r: any) => r.rating);
        const averageRating =
          ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : undefined;

        return {
          ...guardian,
          averageRating,
          reviewCount: reviews.length,
        };
      })
    );

    return NextResponse.json(guardiansWithRatings.filter(g => g !== null));
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireVital();
    await connectDB();

    const { guardianId } = await request.json();

    if (!guardianId) {
      return NextResponse.json({ error: 'Guardian ID is required' }, { status: 400 });
    }

    const vitalProfile = await VitalProfile.findOne({
      userId: session.user.id,
    });

    if (!vitalProfile) {
      return NextResponse.json({ error: 'Vital profile not found' }, { status: 404 });
    }

    // Check if already saved
    const existing = await SavedGuardian.findOne({
      vitalId: vitalProfile._id,
      guardianId,
    });

    if (existing) {
      return NextResponse.json({ error: 'Guardian already saved' }, { status: 400 });
    }

    const savedGuardian = await SavedGuardian.create({
      vitalId: vitalProfile._id,
      guardianId,
    });

    return NextResponse.json(savedGuardian, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Guardian already saved' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireVital();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const guardianId = searchParams.get('guardianId');

    if (!guardianId) {
      return NextResponse.json({ error: 'Guardian ID is required' }, { status: 400 });
    }

    const vitalProfile = await VitalProfile.findOne({
      userId: session.user.id,
    });

    if (!vitalProfile) {
      return NextResponse.json({ error: 'Vital profile not found' }, { status: 404 });
    }

    await SavedGuardian.deleteOne({
      vitalId: vitalProfile._id,
      guardianId,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

