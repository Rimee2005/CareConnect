import { NextResponse } from 'next/server';
import { requireVital } from '@/lib/rbac';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Booking from '@/models/Booking';

export async function POST(request: Request) {
  try {
    const session = await requireVital();
    await connectDB();

    const { bookingId, rating, reviewText } = await request.json();

    if (!bookingId || !rating) {
      return NextResponse.json(
        { error: 'Booking ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    if (reviewText && reviewText.length > 500) {
      return NextResponse.json(
        { error: 'Review text must be less than 500 characters' },
        { status: 400 }
      );
    }

    // Get Vital profile
    const VitalProfile = (await import('@/models/VitalProfile')).default;
    const vitalProfile = await VitalProfile.findOne({
      userId: session.user.id,
    });

    if (!vitalProfile) {
      return NextResponse.json({ error: 'Vital profile not found' }, { status: 404 });
    }

    // Verify booking exists and is completed
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Strict rule: Only completed bookings can be reviewed
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Only completed bookings can be reviewed' },
        { status: 400 }
      );
    }

    // Verify booking belongs to this Vital
    if (booking.vitalId.toString() !== vitalProfile._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if review already exists (one review per booking)
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this booking' },
        { status: 400 }
      );
    }

    // Create review
    const review = await Review.create({
      bookingId,
      vitalId: vitalProfile._id,
      guardianId: booking.guardianId,
      rating,
      reviewText: reviewText?.trim() || undefined,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      return NextResponse.json(
        { error: 'Review already exists for this booking' },
        { status: 400 }
      );
    }
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await requireVital();
    await connectDB();

    const VitalProfile = (await import('@/models/VitalProfile')).default;
    const vitalProfile = await VitalProfile.findOne({
      userId: session.user.id,
    });

    if (!vitalProfile) {
      return NextResponse.json({ error: 'Vital profile not found' }, { status: 404 });
    }

    const reviews = await Review.find({ vitalId: vitalProfile._id })
      .populate('guardianId', 'name', 'GuardianProfile')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reviews);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

