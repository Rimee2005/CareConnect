import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import VitalProfile from '@/models/VitalProfile';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const reviews = await Review.find({ guardianId: params.id })
      .populate('vitalId', 'name', VitalProfile)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

