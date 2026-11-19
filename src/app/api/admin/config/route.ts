import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const paymentsEnabled = process.env.PAYMENTS_ENABLED !== 'false' && process.env.NEXT_PUBLIC_ENABLE_PAYMENTS !== 'false';
    const emailNotificationsEnabled = process.env.EMAIL_NOTIFICATIONS_ENABLED !== 'false';
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const hasRazorpaySecret = Boolean(process.env.RAZORPAY_KEY_SECRET);
    const hasWebhookSecret = Boolean(process.env.RAZORPAY_WEBHOOK_SECRET);
    const resendApiKey = process.env.RESEND_API_KEY || '';

    return NextResponse.json({
      success: true,
      config: {
        paymentsEnabled,
        emailNotificationsEnabled,
        razorpay: {
          configured: Boolean(razorpayKeyId && hasRazorpaySecret),
          mode: razorpayKeyId.startsWith('rzp_live_') ? 'live' : 'test',
          keyIdMasked: razorpayKeyId ? razorpayKeyId.substring(0, 8) + '...' : 'Not configured (sandbox mode)',
          hasWebhookSecret,
        },
        resend: {
          configured: Boolean(resendApiKey && !resendApiKey.startsWith('re_mock') && !resendApiKey.startsWith('re_test')),
          isLive: Boolean(resendApiKey && !resendApiKey.startsWith('re_mock') && !resendApiKey.startsWith('re_test')),
          from: process.env.EMAIL_FROM || 'VicePulse Recon <recon@vicepulse.net>',
          replyTo: process.env.EMAIL_REPLY_TO || 'support@vicepulse.net',
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (key === 'PAYMENTS_ENABLED') {
      process.env.PAYMENTS_ENABLED = String(value);
      return NextResponse.json({ success: true, key, value: process.env.PAYMENTS_ENABLED });
    }

    if (key === 'EMAIL_NOTIFICATIONS_ENABLED') {
      process.env.EMAIL_NOTIFICATIONS_ENABLED = String(value);
      return NextResponse.json({ success: true, key, value: process.env.EMAIL_NOTIFICATIONS_ENABLED });
    }

    return NextResponse.json({ error: 'Unsupported configuration key' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Config update error' }, { status: 500 });
  }
}
