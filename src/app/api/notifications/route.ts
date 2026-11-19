import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import NotificationModel from '@/models/Notification';
import { InAppNotification } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr_active_scout';

    const conn = await connectToDatabase();
    if (conn) {
      try {
        const docs = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(30).lean();
        if (docs) {
          const items: InAppNotification[] = docs.map((d: any) => ({
            id: d._id?.toString() || d.id,
            userId: d.userId,
            title: d.title,
            message: d.message,
            type: d.type,
            link: d.link,
            read: d.read,
            createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
          }));

          const unreadCount = items.filter((n) => !n.read).length;
          return NextResponse.json({
            notifications: items,
            unreadCount,
          });
        }
      } catch (err) {
        console.warn('DB notification query failed:', err);
      }
    }

    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, markAll, userId } = body;

    const conn = await connectToDatabase();
    if (conn) {
      try {
        if (markAll && userId) {
          await NotificationModel.updateMany({ userId }, { $set: { read: true } });
        } else if (notificationId) {
          await NotificationModel.findByIdAndUpdate(notificationId, { $set: { read: true } });
        }
      } catch (err) {
        console.warn('DB notification update error:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update notifications' }, { status: 500 });
  }
}
