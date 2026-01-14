import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/rbac';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Convert ObjectIds to strings for frontend
    const formattedNotifications = notifications.map((notif) => ({
      ...notif,
      _id: notif._id.toString(),
      relatedId: notif.relatedId ? notif.relatedId.toString() : undefined,
    }));

    return NextResponse.json(formattedNotifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

