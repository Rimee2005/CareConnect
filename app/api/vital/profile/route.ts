import { NextResponse } from 'next/server';
import { requireVital } from '@/lib/rbac';
import connectDB from '@/lib/db';
import VitalProfile from '@/models/VitalProfile';
import { sendEmail, emailTemplates } from '@/lib/email';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await requireVital();
    await connectDB();

    const profile = await VitalProfile.findOne({ userId: session.user.id }).lean();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
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

    // Check if profile already exists
    const existing = await VitalProfile.findOne({ userId: session.user.id });
    if (existing) {
      return NextResponse.json({ error: 'Profile already exists' }, { status: 400 });
    }

    const data = await request.json();
    const profile = await VitalProfile.create({
      userId: session.user.id,
      ...data,
    });

    // Send email
    const user = await User.findById(session.user.id);
    if (user?.email) {
      await sendEmail({
        to: user.email,
        ...emailTemplates.vitalProfileCreated(data.name),
      });
    }

    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireVital();
    await connectDB();

    const data = await request.json();
    const profile = await VitalProfile.findOneAndUpdate(
      { userId: session.user.id },
      data,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await requireVital();
    await connectDB();

    await VitalProfile.findOneAndDelete({ userId: session.user.id });

    return NextResponse.json({ message: 'Profile deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Failed to delete profile' }, { status: 500 });
  }
}

