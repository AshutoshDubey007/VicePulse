import { NextRequest, NextResponse } from 'next/server';
import { emailQueue } from '@/lib/email/queue';
import { ResendEmailProvider } from '@/lib/email/resend';
import { 
  welcomeEmail, 
  accountVerificationEmail, 
  passwordResetEmail, 
  newDiscoveryAlertEmail, 
  importantNewsAlertEmail, 
  paymentConfirmationEmail, 
  premiumActivationEmail, 
  paymentFailedEmail, 
  premiumExpiryReminderEmail 
} from '@/lib/email/templates';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const [stats, logs] = await Promise.all([
      emailQueue.getStats(),
      emailQueue.getRecentLogs(50),
    ]);

    const provider = emailQueue.getProvider() as ResendEmailProvider;

    return NextResponse.json({
      success: true,
      stats,
      logs,
      providerInfo: {
        provider: provider.name || 'resend',
        isLive: provider.isLive ? provider.isLive() : false,
        notificationsEnabled: emailQueue.isNotificationsEnabled(),
        defaultFrom: process.env.EMAIL_FROM || 'VicePulse Recon <recon@vicepulse.net>',
        defaultReplyTo: process.env.EMAIL_REPLY_TO || 'support@vicepulse.net',
      },
    });
  } catch (err: any) {
    console.error('[API Admin Emails GET Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch email logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'send_test') {
      const { to, templateName = 'welcome' } = body;
      if (!to || !to.includes('@')) {
        return NextResponse.json({ error: 'Valid recipient email required' }, { status: 400 });
      }

      let rendered: { subject: string; html: string; text: string };
      const testUsername = 'AdminScout';

      switch (templateName) {
        case 'welcome':
          rendered = welcomeEmail(testUsername);
          break;
        case 'account_verification':
          rendered = accountVerificationEmail(testUsername, `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=test-token`);
          break;
        case 'password_reset':
          rendered = passwordResetEmail(testUsername, `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=test-reset`);
          break;
        case 'discovery_alert':
          rendered = newDiscoveryAlertEmail(testUsername, {
            id: 'disc-test-01',
            title: 'Submerged Cargo Hull near Port Gellhorn',
            category: 'hidden_location',
            district: 'Port Gellhorn',
            summary: 'Undersea wreckage sighted matching trailer 1 maritime coordinates.',
          });
          break;
        case 'news_alert':
          rendered = importantNewsAlertEmail(testUsername, {
            id: 'news-test-01',
            title: 'Rockstar Games Publishes GTA VI Trailer 2 Announcement Window',
            category: 'official_announcement',
            summary: 'Official confirmation of gameplay deep dive scheduled for spring.',
          });
          break;
        case 'payment_confirmation':
          rendered = paymentConfirmationEmail(
            testUsername,
            'Leonida Syndicate Pro',
            499,
            'INR',
            'order_test_admin',
            'pay_test_admin',
            new Date(Date.now() + 30 * 86400000).toISOString()
          );
          break;
        case 'premium_activation':
          rendered = premiumActivationEmail(
            testUsername,
            'Leonida Syndicate Pro',
            new Date(Date.now() + 30 * 86400000).toISOString(),
            [
              'Classified Satellite & Heatmap Overlays',
              'Advanced Telemetry Filters',
              'GPX & GeoJSON Coordinates Export',
              'Priority Verification Queue',
            ]
          );
          break;
        case 'payment_failed':
          rendered = paymentFailedEmail(
            testUsername,
            'Leonida Syndicate Pro',
            499,
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing`,
            'Test transaction simulation'
          );
          break;
        case 'premium_expiry':
          rendered = premiumExpiryReminderEmail(
            testUsername,
            'Leonida Syndicate Pro',
            3,
            new Date(Date.now() + 3 * 86400000).toISOString(),
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing`
          );
          break;
        default:
          rendered = welcomeEmail(testUsername);
          break;
      }

      const sendRes = await emailQueue.sendDirect({
        to,
        subject: `[TEST] ${rendered.subject}`,
        html: rendered.html,
        text: rendered.text,
        templateName,
        category: 'transactional',
      });

      return NextResponse.json({
        success: sendRes.success,
        messageId: sendRes.messageId,
        provider: sendRes.provider,
        templateName,
      });
    }

    if (action === 'retry') {
      const { logId } = body;
      if (!logId) {
        return NextResponse.json({ error: 'Email log ID is required' }, { status: 400 });
      }

      const retryRes = await emailQueue.retryEmail(logId);
      return NextResponse.json(retryRes);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('[API Admin Emails POST Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to dispatch test email' }, { status: 500 });
  }
}
