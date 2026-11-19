import { IEmailProvider, SendEmailOptions, EmailSendResult } from './types';
import { Resend } from 'resend';

export class ResendEmailProvider implements IEmailProvider {
  name = 'resend';
  private resend: Resend | null = null;
  private defaultFrom: string;
  private defaultReplyTo: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey.trim() !== '' && !apiKey.startsWith('re_mock') && !apiKey.startsWith('re_test_placeholder')) {
      try {
        this.resend = new Resend(apiKey);
      } catch (err) {
        console.warn('[Resend] Client initialization warning:', err);
      }
    }
    this.defaultFrom = process.env.EMAIL_FROM || 'VicePulse Recon <recon@vicepulse.net>';
    this.defaultReplyTo = process.env.EMAIL_REPLY_TO || 'support@vicepulse.net';
  }

  isLive(): boolean {
    return Boolean(this.resend);
  }

  async sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
    const from = options.from || this.defaultFrom;
    const replyTo = options.replyTo || this.defaultReplyTo;
    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    // Live Resend integration if API key is active
    if (this.resend) {
      try {
        const payload: any = {
          from,
          to: recipients,
          subject: options.subject,
          html: options.html,
          text: options.text,
          replyTo,
        };

        if (options.attachments && options.attachments.length > 0) {
          payload.attachments = options.attachments.map((a) => ({
            filename: a.filename,
            content: a.content,
            contentType: a.contentType,
          }));
        }

        const data = await this.resend.emails.send(payload);

        if ((data as any).error) {
          const errMsg = (data as any).error.message || '';
          if (errMsg.toLowerCase().includes('domain') && !from.includes('onboarding@resend.dev')) {
            console.warn('[Resend] Custom domain not verified yet, falling back to onboarding@resend.dev...');
            payload.from = 'VicePulse Recon <onboarding@resend.dev>';
            const retryData = await this.resend.emails.send(payload);
            if (!retryData.error && retryData.data?.id) {
              return {
                success: true,
                messageId: retryData.data.id,
                provider: 'resend',
              };
            }
          }

          console.error('[Resend Error]', (data as any).error);
          return {
            success: false,
            error: (data as any).error.message || 'Resend API returned an error',
            provider: 'resend',
          };
        }

        return {
          success: true,
          messageId: data.data?.id,
          provider: 'resend',
        };
      } catch (err: any) {
        console.error('[Resend Exception]', err);
        return {
          success: false,
          error: err.message || 'Failed to dispatch email via Resend',
          provider: 'resend',
        };
      }
    }

    // Graceful fallback for testing / sandbox mode without live keys
    const mockId = `mock-resend-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    console.log(`\n========================================================`);
    console.log(`[VicePulse Dispatch] MOCK RESEND TRANSMISSION (${mockId})`);
    console.log(`From:     ${from}`);
    console.log(`Reply-To: ${replyTo}`);
    console.log(`To:       ${recipients.join(', ')}`);
    console.log(`Subject:  ${options.subject}`);
    console.log(`Payload:  (HTML ${options.html.length} chars, Text ${options.text?.length || 0} chars)`);
    console.log(`========================================================\n`);

    return {
      success: true,
      messageId: mockId,
      provider: 'resend_mock',
    };
  }
}
