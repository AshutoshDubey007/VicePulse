import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import NotificationSettingsModel from '@/models/NotificationSettings';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unsubscribe token required' }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      await NotificationSettingsModel.findOneAndUpdate(
        { unsubscribeToken: token },
        {
          marketingEmails: false,
          weeklyDigest: false,
          discoveryUpdates: false,
        }
      );
    }

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed — VicePulse Intel</title>
          <style>
            body { background: #0E1012; color: #FAF7F0; font-family: monospace; padding: 40px; text-align: center; }
            .box { max-width: 500px; margin: 40px auto; background: #17191B; border: 1px solid #2E333B; padding: 32px; }
            h1 { color: #F46A38; font-size: 20px; }
            p { color: #96918A; font-size: 13px; line-height: 1.6; }
            a { color: #65B8B1; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>UNSUBSCRIBED FROM MARKETING RECON</h1>
            <p>You have been unsubscribed from promotional and weekly digest emails. You will continue to receive essential security and transaction receipts.</p>
            <p><a href="/settings/notifications">Manage Full Communication Preferences →</a></p>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unsubscribe error' }, { status: 500 });
  }
}
