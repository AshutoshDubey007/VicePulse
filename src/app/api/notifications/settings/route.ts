import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import NotificationSettingsModel from '@/models/NotificationSettings';
import { NotificationPreferences } from '@/types';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  marketingEmails: z.boolean(),
  weeklyDigest: z.boolean(),
  discoveryUpdates: z.boolean(),
  commentReplies: z.boolean(),
  userId: z.string().optional(),
});

// Fallback settings in-memory
const mockSettings: Record<string, NotificationPreferences> = {
  'usr-1': {
    userId: 'usr-1',
    marketingEmails: true,
    weeklyDigest: true,
    discoveryUpdates: true,
    commentReplies: true,
    securityAndTransactional: true, // Always true
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-1';

    const conn = await connectToDatabase();
    if (conn) {
      try {
        const doc = await NotificationSettingsModel.findOne({ userId }).lean();
        if (doc) {
          return NextResponse.json({
            settings: {
              userId: (doc as any).userId,
              marketingEmails: (doc as any).marketingEmails,
              weeklyDigest: (doc as any).weeklyDigest,
              discoveryUpdates: (doc as any).discoveryUpdates,
              commentReplies: (doc as any).commentReplies,
              securityAndTransactional: true,
            },
          });
        }
      } catch (e) {
        console.warn('[Notification Settings API] DB lookup error:', e);
      }
    }

    const settings = mockSettings[userId] || {
      userId,
      marketingEmails: true,
      weeklyDigest: true,
      discoveryUpdates: true,
      commentReplies: true,
      securityAndTransactional: true,
    };

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = updateSettingsSchema.parse(body);
    const userId = validated.userId || 'usr-1';

    const updated: NotificationPreferences = {
      userId,
      marketingEmails: validated.marketingEmails,
      weeklyDigest: validated.weeklyDigest,
      discoveryUpdates: validated.discoveryUpdates,
      commentReplies: validated.commentReplies,
      securityAndTransactional: true, // Immutable requirement
      updatedAt: new Date().toISOString(),
    };

    mockSettings[userId] = updated;

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await NotificationSettingsModel.findOneAndUpdate(
          { userId },
          {
            marketingEmails: validated.marketingEmails,
            weeklyDigest: validated.weeklyDigest,
            discoveryUpdates: validated.discoveryUpdates,
            commentReplies: validated.commentReplies,
            securityAndTransactional: true,
            unsubscribeToken: `unsub_${userId}`,
          },
          { upsert: true }
        );
      } catch (e) {
        console.warn('[Notification Settings API] DB persist error:', e);
      }
    }

    return NextResponse.json({
      success: true,
      settings: updated,
      message: 'Reconnaissance communication preferences saved.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update preferences' }, { status: 500 });
  }
}
