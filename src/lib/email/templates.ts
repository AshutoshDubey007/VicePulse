const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface EmailRenderResult {
  subject: string;
  html: string;
  text: string;
}

function baseTemplate(
  content: string,
  previewText: string,
  options?: { unsubscribeUrl?: string; isTransactional?: boolean }
): string {
  const unsubLink = options?.unsubscribeUrl || `${APP_URL}/settings/notifications`;
  const isTransactional = options?.isTransactional ?? false;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VicePulse Intel</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0E1012; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAF7F0; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #17191B; border: 1px solid #2A2E35; }
    .header { background-color: #0E1012; padding: 24px 32px; border-bottom: 2px solid #F46A38; text-align: left; }
    .logo { font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #FAF7F0; text-transform: uppercase; text-decoration: none; }
    .logo span { color: #F46A38; }
    .subtag { font-family: monospace; font-size: 10px; color: #65B8B1; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-top: 4px; }
    .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #F4EBDD; }
    .btn { display: inline-block; background-color: #F46A38; color: #0E1012 !important; font-family: monospace; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 12px 24px; text-decoration: none; margin: 20px 0; border-radius: 2px; }
    .btn-secondary { display: inline-block; background-color: #25292E; color: #FAF7F0 !important; border: 1px solid #343A42; font-family: monospace; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 12px 24px; text-decoration: none; margin: 20px 0; border-radius: 2px; }
    .badge { display: inline-block; font-family: monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; background-color: #25292E; border: 1px solid #343A42; border-radius: 2px; margin-bottom: 12px; }
    .footer { background-color: #0E1012; padding: 24px 32px; border-top: 1px solid #25292E; font-size: 11px; font-family: monospace; color: #96918A; line-height: 1.6; }
    .footer a { color: #F46A38; text-decoration: none; }
    .box { background-color: #121416; border: 1px solid #25292E; padding: 16px; margin: 16px 0; font-family: monospace; font-size: 12px; line-height: 1.6; }
    ul { margin: 8px 0; padding-left: 20px; }
    li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0E1012;padding:24px 12px;">
    <tr>
      <td align="center">
        <div class="wrapper">
          <div class="header">
            <a href="${APP_URL}" class="logo">VICE<span>PULSE</span></a>
            <span class="subtag">Leonida Surveillance & Intelligence Network</span>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>You received this dispatch because you have an account or notification registered with VicePulse.</p>
            <p>
              <a href="${APP_URL}/settings/notifications">Notification Preferences</a> • 
              ${isTransactional ? '<span>Essential Transaction Notice</span>' : `<a href="${unsubLink}">Unsubscribe</a>`} • 
              <a href="${APP_URL}">Tactical Terminal</a>
            </p>
            <p style="color:#666;font-size:10px;margin-top:12px;">VicePulse is an independent GTA VI community intelligence portal. Not affiliated with Rockstar Games or Take-Two Interactive.</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// -----------------------------------------------------------------------------
// 1. WELCOME EMAIL
// -----------------------------------------------------------------------------
export function welcomeEmail(
  username: string,
  options?: { unsubscribeUrl?: string }
): EmailRenderResult {
  const subject = `[VicePulse] Callsign Verified: Welcome Scout ${username}`;
  const html = baseTemplate(
    `
    <div class="badge" style="color:#65B8B1;border-color:#65B8B1;">CALLSIGN REGISTERED</div>
    <h2 style="margin:0 0 16px;color:#FAF7F0;font-size:22px;">Welcome to VicePulse, Scout ${username}.</h2>
    <p>Your field credentials are now active on the Leonida Surveillance Grid. You are authorized to search world discoveries, review raw intelligence from across gaming communities, and file new reconnaissance reports.</p>
    
    <div class="box">
      <strong style="color:#F46A38;">FIELD SCOUT DIRECTIVE:</strong><br>
      • Cross-reference all leak coordinates with trailer frames.<br>
      • Independent replication is required for community verification.<br>
      • Document in-game time and weather conditions for every sighting.
    </div>

    <a href="${APP_URL}/feed" class="btn">Access Discovery Feed →</a>
    `,
    `Your field credentials on the Leonida intelligence network are now active.`,
    options
  );

  const text = `VICEPULSE — CALLSIGN REGISTERED
Welcome to VicePulse, Scout ${username}.

Your field credentials are now active on the Leonida Surveillance Grid. You are authorized to search world discoveries, review raw intelligence, and file new reconnaissance reports.

FIELD SCOUT DIRECTIVE:
• Cross-reference all leak coordinates with trailer frames.
• Independent replication is required for community verification.
• Document in-game time and weather conditions for every sighting.

Access Discovery Feed: ${APP_URL}/feed

Manage Preferences: ${APP_URL}/settings/notifications
VicePulse is an independent community intelligence portal. Not affiliated with Rockstar Games.`;

  return { subject, html, text };
}

// -----------------------------------------------------------------------------
// 2. ACCOUNT VERIFICATION EMAIL
// -----------------------------------------------------------------------------
export function accountVerificationEmail(
  username: string,
  verifyUrl: string,
  options?: { unsubscribeUrl?: string }
): EmailRenderResult {
  const subject = `[VicePulse Security] Verify Your Scout Credentials`;
  const html = baseTemplate(
    `
    <div class="badge" style="color:#65B8B1;border-color:#65B8B1;">SECURITY CLEARANCE</div>
    <h2 style="margin:0 0 16px;color:#FAF7F0;font-size:22px;">Verify Field Scout Email</h2>
    <p>Hello Scout <strong>${username}</strong>, please authenticate your email address to confirm your access to the VicePulse Leonida Surveillance Network.</p>
    
    <div class="box">
      <strong>VERIFICATION LINK VALIDITY:</strong> 24 hours<br>
      <strong>CLEARANCE LEVEL:</strong> Field Scout (Tier 1)
    </div>

    <a href="${verifyUrl}" class="btn">Verify Terminal Account →</a>
    <p style="font-size:12px;color:#96918A;">If you did not register for VicePulse, please disregard this dispatch.</p>
    `,
    `Verify your email address to activate your VicePulse field credentials.`,
    { ...options, isTransactional: true }
  );

  const text = `VICEPULSE — SECURITY CLEARANCE
Verify Field Scout Email

Hello Scout ${username}, please authenticate your email address to confirm access to the VicePulse Leonida Surveillance Network.

Verification Link: ${verifyUrl}
Link Validity: 24 hours

If you did not register for VicePulse, please disregard this dispatch.
VicePulse — Independent GTA VI Community Intelligence Portal.`;

  return { subject, html, text };
}

// -----------------------------------------------------------------------------
// 3. PASSWORD RESET EMAIL
// -----------------------------------------------------------------------------
export function passwordResetEmail(
  username: string,
  resetUrl: string,
  options?: { unsubscribeUrl?: string }
): EmailRenderResult {
  const subject = `[VicePulse Security] Reset Your Terminal Access Passphrase`;
  const html = baseTemplate(
    `
    <div class="badge" style="color:#F46A38;border-color:#F46A38;">SECURITY DISPATCH</div>
    <h2 style="margin:0 0 16px;color:#FAF7F0;font-size:22px;">Scout Access Key Reset</h2>
    <p>Hello <strong>${username}</strong>, an access token reset was requested for your VicePulse field scout account.</p>
    <p>Click below to establish a new secure encryption passphrase for your terminal:</p>
    
    <div class="box">
      <strong>SECURITY NOTICE:</strong> This reset key expires in 60 minutes and can only be used once.
    </div>

    <a href="${resetUrl}" class="btn">Reset Passphrase →</a>
    <p style="font-size:12px;color:#96918A;">If you did not request this reset, your terminal credentials remain secure and you can disregard this message.</p>
    `,
    `Secure password reset link for your VicePulse account.`,
    { ...options, isTransactional: true }
  );

  const text = `VICEPULSE — SECURITY DISPATCH
Scout Access Key Reset

Hello ${username}, an access token reset was requested for your VicePulse field scout account.

Reset Passphrase: ${resetUrl}
Validity: 60 minutes (single-use)

If you did not request this reset, your credentials remain secure and you can disregard this message.
VicePulse — Independent GTA VI Community Intelligence Portal.`;

  return { subject, html, text };
}

// -----------------------------------------------------------------------------
// 4. NEW DISCOVERY ALERT EMAIL
// -----------------------------------------------------------------------------
export function newDiscoveryAlertEmail(
  username: string,
  discovery: {
    id: string;
    title: string;
    category: string;
    district?: string;
    summary?: string;
    url?: string;
  },
  options?: { unsubscribeUrl?: string }
): EmailRenderResult {
  const targetUrl = discovery.url || `${APP_URL}/discoveries/${discovery.id}`;
  const subject = `[VicePulse Recon] New Discovery: ${discovery.title}`;

  const html = baseTemplate(
    `
    <div class="badge" style="color:#65B8B1;border-color:#65B8B1;">NEW SIGHTING LOGGED</div>
    <h2 style="margin:0 0 16px;color:#FAF7F0;font-size:22px;">${discovery.title}</h2>
    <p>Scout ${username}, the autonomous surveillance engine has verified a new GTA VI discovery in Leonida:</p>
    
    <div class="box">
      <strong>CATEGORY:</strong> <span style="color:#F46A38;text-transform:uppercase;">${discovery.category.replace('_', ' ')}</span><br>
      ${discovery.district ? `<strong>DISTRICT:</strong> ${discovery.district}<br>` : ''}
      <strong>DOSSIER ID:</strong> #${discovery.id}<br>
      ${discovery.summary ? `<strong>SUMMARY:</strong> ${discovery.summary}` : ''}
    </div>

    <a href="${targetUrl}" class="btn">Inspect Coordinates & Dossier →</a>
    `,
    `New verified GTA VI discovery logged in Leonida: ${discovery.title}`,
    options
  );

  const text = `VICEPULSE RECON BULLETIN
New Discovery Logged: ${discovery.title}

Scout ${username}, the autonomous surveillance engine has verified a new GTA VI discovery in Leonida:

Category: ${discovery.category}
${discovery.district ? `District: ${discovery.district}\n` : ''}Dossier ID: #${discovery.id}
${discovery.summary ? `Summary: ${discovery.summary}\n` : ''}
View Dossier & Coordinates: ${targetUrl}

Manage Preferences: ${APP_URL}/settings/notifications
Unsubscribe: ${options?.unsubscribeUrl || `${APP_URL}/settings/notifications`}`;

  return { subject, html, text };
}

// -----------------------------------------------------------------------------
// 5. IMPORTANT GTA VI NEWS ALERT EMAIL
// -----------------------------------------------------------------------------
export function importantNewsAlertEmail(
  username: string,
  news: {
    id: string;
    title: string;
    category?: string;
    summary?: string;
    url?: string;
  },
  options?: { unsubscribeUrl?: string }
): EmailRenderResult {
  const targetUrl = news.url || `${APP_URL}/news/${news.id}`;
  const subject = `[VicePulse Priority] GTA VI News Bulletin: ${news.title}`;

  const html = baseTemplate(
    `
    <div class="badge" style="color:#F46A38;border-color:#F46A38;">HIGH PRIORITY DISPATCH</div>
    <h2 style="margin:0 0 16px;color:#FAF7F0;font-size:22px;">${news.title}</h2>
    <p>Greetings Scout ${username}, a critical official development or breaking intelligence update has been published regarding Grand Theft Auto VI:</p>
    
    <div class="box">
      ${news.category ? `<strong>CATEGORY:</strong> <span style="color:#65B8B1;text-transform:uppercase;">${news.category}</span><br>` : ''}
      <strong>SOURCE:</strong> Verified Intelligence Stream<br>
      ${news.summary ? `<strong>KEY INTEL:</strong> ${news.summary}` : ''}
    </div>

    <a href="${targetUrl}" class="btn">Read Full News Analysis →</a>
    `,
    `High-priority GTA VI intelligence update: ${news.title}`,
    options
  );

  const text = `VICEPULSE PRIORITY BULLETIN
GTA VI News: ${news.title}

Greetings Scout ${username}, a critical intelligence update has been published regarding Grand Theft Auto VI:

${news.category ? `Category: ${news.category}\n` : ''}${news.summary ? `Summary: ${news.summary}\n` : ''}
Read Full Analysis: ${targetUrl}

Manage Preferences: ${APP_URL}/settings/notifications
Unsubscribe: ${options?.unsubscribeUrl || `${APP_URL}/settings/notifications`}`;

  return { subject, html, text };
}

// -----------------------------------------------------------------------------
// 6. PAYMENT CONFIRMATION / RECEIPT EMAIL
// -----------------------------------------------------------------------------
export function paymentConfirmationEmail(
  username: string,
  planName: string,
  amount: number,
  currency: string,
  orderId: string,
  paymentId: string,
  renewalDate: string,
  options?: { unsubscribeUrl?: string }
): EmailRenderResult {
  const subject = `[VicePulse Receipt] ${planName} Payment Confirmed (${currency} ${amount})`;

  const html = baseTemplate(
    `
    <div class="badge" style="color:#65B8B1;border-color:#65B8B1;">PAYMENT CONFIRMED & RECEIPT</div>
    <h2 style="margin:0 0 16px;color:#FAF7F0;font-size:22px;">Payment Received for ${planName}</h2>
    <p>Hello ${username}, thank you for supporting the VicePulse intelligence initiative. Your transaction has been cryptographically validated and settled.</p>
    
    <div class="box">
      <strong>PLAN TIER:</strong> ${planName}<br>
      <strong>AMOUNT PAID:</strong> ${currency} ${amount}<br>
      <strong>TRANSACTION ID:</strong> ${paymentId || orderId}<br>
      <strong>ORDER ID:</strong> ${orderId}<br>
      <strong>ACCESS VALID UNTIL:</strong> ${new Date(renewalDate).toLocaleDateString()}
    </div>

    <p>A separate activation notice has been issued with your upgraded clearance protocols.</p>
    <a href="${APP_URL}/billing" class="btn">View Account & Billing Terminal →</a>
    `,
    `Payment confirmed for ${planName}. Official receipt and transaction record.`,
    { ...options, isTransactional: true }
  );

  const text = `VICEPULSE PAYMENT RECEIPT
Plan: ${planName}
Amount Paid: ${currency} ${amount}
Transaction ID: ${paymentId || orderId}
Order ID: ${orderId}
Valid Until: ${new Date(renewalDate).toLocaleDateString()}

Hello ${username}, thank you for supporting VicePulse. Your transaction has been cryptographically validated and settled.

View Account & Billing: ${APP_URL}/billing
VicePulse — Independent GTA VI Community Intelligence Portal.`;

  return { subject, html, text };
}

// Backwards-compatible alias
export const paymentReceiptEmail = paymentConfirmationEmail;

// -----------------------------------------------------------------------------
// 7. PREMIUM ACTIVATION EMAIL
// -----------------------------------------------------------------------------
export function premiumActivationEmail(
  username: string,
  planName: string,
  renewalDate: string,
  features: string[],
  options?: { unsubscribeUrl?: string }
): EmailRenderResult {
  const subject = `[VicePulse] Clearance Upgraded: ${planName} Activated!`;

  const featureItems = features && features.length > 0 
    ? features.map((f) => `<li>${f}</li>`).join('')
    : `<li>Classified Satellite & Heatmap Overlays</li>
       <li>Advanced Telemetry & Biome Filters</li>
       <li>GPX / JSON Coordinates Export Protocol</li>
       <li>Priority Community Verification Queue</li>`;

  const html = baseTemplate(
    `
    <div class="badge" style="color:#65B8B1;border-color:#65B8B1;">SECURITY CLEARANCE UPGRADED</div>
    <h2 style="margin:0 0 16px;color:#FAF7F0;font-size:22px;">${planName} Privileges Active</h2>
    <p>Greetings Scout ${username}, your terminal has been elevated with premium tactical capabilities on the Leonida Surveillance Grid.</p>
    
    <div class="box">
      <strong style="color:#F46A38;">ACTIVATED PROTOCOLS:</strong>
      <ul>
        ${featureItems}
      </ul>
      <strong>EXPIRATION / NEXT BILLING CYCLE:</strong> ${new Date(renewalDate).toLocaleDateString()}
    </div>

    <a href="${APP_URL}/map" class="btn">Launch Satellite Grid →</a>
    <a href="${APP_URL}/billing" class="btn-secondary" style="margin-left:8px;">Manage Membership</a>
    `,
    `Your ${planName} privileges are now active on the VicePulse Leonida Grid.`,
    { ...options, isTransactional: true }
  );

  const text = `VICEPULSE — CLEARANCE UPGRADED
${planName} Privileges Active

Greetings Scout ${username}, your terminal has been elevated with premium tactical capabilities on the Leonida Surveillance Grid.

Activated Protocols:
${features && features.length > 0 ? features.map((f) => `• ${f}`).join('\n') : '• Classified Satellite & Heatmap Overlays\n• Advanced Telemetry & Biome Filters\n• GPX / JSON Coordinates Export'}

Valid Until: ${new Date(renewalDate).toLocaleDateString()}

Launch Satellite Grid: ${APP_URL}/map
Manage Billing: ${APP_URL}/billing
VicePulse — Independent GTA VI Community Intelligence Portal.`;

  return { subject, html, text };
}

// -----------------------------------------------------------------------------
// 8. PAYMENT FAILURE EMAIL
// -----------------------------------------------------------------------------
export function paymentFailedEmail(
  username: string,
  planName: string,
  amount: number,
  retryUrl: string,
  failureReason?: string,
  options?: { unsubscribeUrl?: string }
): EmailRenderResult {
  const subject = `[VicePulse Alert] Action Required: Payment Failed for ${planName}`;

  const html = baseTemplate(
    `
    <div class="badge" style="color:#EF4444;border-color:#EF4444;">PAYMENT INCOMPLETE</div>
    <h2 style="margin:0 0 16px;color:#FAF7F0;font-size:22px;">Transaction Could Not Be Processed</h2>
    <p>Hello ${username}, an attempt to activate or renew your <strong>${planName}</strong> subscription did not complete.</p>
    
    <div class="box">
      <strong>PLAN ATTEMPTED:</strong> ${planName}<br>
      <strong>AMOUNT:</strong> ₹${amount}<br>
      <strong>SYSTEM REASON:</strong> ${failureReason || 'Card issuer authorization declined or network timeout.'}
    </div>

    <p>No funds were captured. If your banking application shows a temporary pending hold, your card issuer will release it within 3-5 business days.</p>
    
    <a href="${retryUrl}" class="btn" style="background-color:#EF4444;color:#FAF7F0 !important;">Retry Payment Protocol →</a>
    `,
    `Action required: Your payment attempt for ${planName} could not be completed.`,
    { ...options, isTransactional: true }
  );

  const text = `VICEPULSE ALERT — PAYMENT INCOMPLETE
Transaction Could Not Be Processed

Hello ${username}, an attempt to activate or renew your ${planName} subscription did not complete.

Plan: ${planName}
Amount: ₹${amount}
Reason: ${failureReason || 'Issuer declined or network timeout'}

No funds were captured. If a pending hold appears, your bank will release it within 3-5 banking days.

Retry Payment: ${retryUrl}
VicePulse — Independent GTA VI Community Intelligence Portal.`;

  return { subject, html, text };
}

// -----------------------------------------------------------------------------
// 9. PREMIUM EXPIRY REMINDER EMAIL
// -----------------------------------------------------------------------------
export function premiumExpiryReminderEmail(
  username: string,
  planName: string,
  daysLeft: number,
  expiryDate: string,
  renewalUrl?: string,
  options?: { unsubscribeUrl?: string }
): EmailRenderResult {
  const targetUrl = renewalUrl || `${APP_URL}/billing`;
  const subject = `[VicePulse Notice] Your ${planName} Access Expires in ${daysLeft} Day${daysLeft === 1 ? '' : 's'}`;

  const html = baseTemplate(
    `
    <div class="badge" style="color:#FBBF24;border-color:#FBBF24;">CLEARANCE EXPIRING SOON</div>
    <h2 style="margin:0 0 16px;color:#FAF7F0;font-size:22px;">${daysLeft} Days of ${planName} Remaining</h2>
    <p>Greetings Scout ${username}, this is an automated reminder that your premium clearance on the Leonida Grid will expire on <strong>${new Date(expiryDate).toLocaleDateString()}</strong>.</p>
    
    <div class="box">
      <strong>CURRENT PLAN:</strong> ${planName}<br>
      <strong>EXPIRY DATE:</strong> ${new Date(expiryDate).toLocaleDateString()}<br>
      <strong>STATUS UPON EXPIRY:</strong> Downgrade to standard Field Scout tier.
    </div>

    <p>To ensure uninterrupted access to satellite thermal maps, coordinate exports, and priority audits, renew your access token now.</p>

    <a href="${targetUrl}" class="btn">Renew Membership →</a>
    `,
    `Reminder: Your ${planName} access expires in ${daysLeft} days on ${new Date(expiryDate).toLocaleDateString()}.`,
    { ...options, isTransactional: true }
  );

  const text = `VICEPULSE NOTICE — CLEARANCE EXPIRING SOON
${daysLeft} Days of ${planName} Remaining

Greetings Scout ${username}, this is an automated reminder that your premium clearance will expire on ${new Date(expiryDate).toLocaleDateString()}.

Current Plan: ${planName}
Expiry Date: ${new Date(expiryDate).toLocaleDateString()}

To ensure uninterrupted access to satellite maps and coordinate exports, renew your subscription:
${targetUrl}

VicePulse — Independent GTA VI Community Intelligence Portal.`;

  return { subject, html, text };
}

// -----------------------------------------------------------------------------
// 10. RECON AUDIT & DIGEST TEMPLATES (Kept for compatibility)
// -----------------------------------------------------------------------------
export function discoveryStatusEmail(
  username: string,
  discoveryTitle: string,
  discoveryId: string,
  status: string,
  reason: string,
  options?: { unsubscribeUrl?: string }
): EmailRenderResult {
  const statusColor = status === 'community_verified' || status === 'personally_verified' ? '#65B8B1' : status === 'disputed' ? '#EF4444' : '#F46A38';

  const html = baseTemplate(
    `
    <div class="badge" style="color:${statusColor};border-color:${statusColor};">STATUS UPDATE: ${status.toUpperCase()}</div>
    <h2 style="margin:0 0 16px;color:#FAF7F0;font-size:20px;">Dossier #${discoveryId} Audited</h2>
    <p>Hello Scout ${username}, the Lead Auditors have completed a review of your submitted field report: <strong>"${discoveryTitle}"</strong>.</p>
    
    <div class="box">
      <strong>NEW STATUS:</strong> <span style="color:${statusColor};">${status.replace('_', ' ').toUpperCase()}</span><br>
      <strong>AUDITOR REPORT:</strong> ${reason}
    </div>

    <a href="${APP_URL}/discoveries/${discoveryId}" class="btn">View Updated Dossier →</a>
    `,
    `Auditor verdict logged for your discovery: ${discoveryTitle}.`,
    options
  );

  const text = `VICEPULSE AUDIT NOTICE
Dossier #${discoveryId} Audited: ${discoveryTitle}

Hello Scout ${username}, auditors reviewed your field report:
Status: ${status.replace('_', ' ').toUpperCase()}
Auditor Notes: ${reason}

View Dossier: ${APP_URL}/discoveries/${discoveryId}`;

  return {
    subject: `[VicePulse Recon] Status Update: ${discoveryTitle} (${status.toUpperCase()})`,
    html,
    text,
  };
}

export function discoveryConfirmationEmail(
  authorName: string,
  discoveryTitle: string,
  discoveryId: string,
  scoutName: string,
  totalConfirmations: number,
  options?: { unsubscribeUrl?: string }
): EmailRenderResult {
  const html = baseTemplate(
    `
    <div class="badge" style="color:#65B8B1;border-color:#65B8B1;">SIGHTING CONFIRMED</div>
    <h2 style="margin:0 0 16px;color:#FAF7F0;font-size:20px;">New Eyewitness Confirmation</h2>
    <p>Scout <strong>${scoutName}</strong> just confirmed your discovery: <strong>"${discoveryTitle}"</strong>.</p>
    
    <div class="box">
      <strong>TOTAL CONFIRMATIONS:</strong> ${totalConfirmations} Independent Scouts<br>
      <strong>TARGET GRID:</strong> Dossier #${discoveryId}
    </div>

    <p>Each corroboration brings your discovery closer to permanent <em>Community Verified</em> status.</p>
    <a href="${APP_URL}/discoveries/${discoveryId}" class="btn">Inspect Confirmations Log →</a>
    `,
    `${scoutName} independently confirmed your discovery on Leonida.`,
    options
  );

  const text = `VICEPULSE CORROBORATION
New Eyewitness Confirmation

Scout ${scoutName} just confirmed your discovery: "${discoveryTitle}".
Total Confirmations: ${totalConfirmations}
Dossier: #${discoveryId}

Inspect Confirmations: ${APP_URL}/discoveries/${discoveryId}`;

  return {
    subject: `[VicePulse] Scout ${scoutName} confirmed your discovery (${totalConfirmations} total)`,
    html,
    text,
  };
}

export function subscriptionCancelledEmail(
  username: string,
  planName: string,
  accessUntil: string,
  options?: { unsubscribeUrl?: string }
): EmailRenderResult {
  const html = baseTemplate(
    `
    <div class="badge" style="color:#96918A;border-color:#96918A;">SUBSCRIPTION CANCELLED</div>
    <h2 style="margin:0 0 16px;color:#FAF7F0;font-size:22px;">Subscription Status Notice</h2>
    <p>Hello ${username}, your <strong>${planName}</strong> subscription has been cancelled as requested.</p>
    
    <div class="box">
      <strong>CONTINUED ACCESS:</strong> You will continue to have full access to ${planName} features until <strong>${new Date(accessUntil).toLocaleDateString()}</strong>.<br>
      <strong>NEXT CYCLE:</strong> No future automatic renewals will be processed.
    </div>

    <p>You can reactivate your subscription anytime from your billing desk.</p>
    <a href="${APP_URL}/billing" class="btn">Billing Terminal →</a>
    `,
    `Confirmation of cancellation for your ${planName} subscription.`,
    { ...options, isTransactional: true }
  );

  const text = `VICEPULSE SUBSCRIPTION CANCELLATION
Confirmation: ${planName} Cancelled

Hello ${username}, your ${planName} subscription has been cancelled.
You will continue to have access until: ${new Date(accessUntil).toLocaleDateString()}
No future renewals will occur.

Manage: ${APP_URL}/billing`;

  return {
    subject: `[VicePulse] Subscription Cancellation Confirmation: ${planName}`,
    html,
    text,
  };
}

export function weeklyDigestEmail(
  username: string,
  discoveries: Array<{ title: string; id: string; district: string }>,
  options?: { unsubscribeUrl?: string }
): EmailRenderResult {
  const itemsHtml = discoveries
    .slice(0, 5)
    .map(
      (d) => `
      <div style="padding:10px 0;border-bottom:1px solid #25292E;">
        <span style="font-size:10px;color:#F46A38;text-transform:uppercase;">${d.district}</span><br>
        <a href="${APP_URL}/discoveries/${d.id}" style="color:#FAF7F0;font-weight:700;text-decoration:none;">${d.title}</a>
      </div>`
    )
    .join('');

  const html = baseTemplate(
    `
    <div class="badge" style="color:#F46A38;border-color:#F46A38;">WEEKLY RECON DIGEST</div>
    <h2 style="margin:0 0 16px;color:#FAF7F0;font-size:22px;">Leonida Intelligence Weekly Roundup</h2>
    <p>Greetings Scout ${username}, here are the top verified discoveries recorded across Vice City over the last 7 days:</p>
    
    <div class="box" style="padding:4px 16px;">
      ${itemsHtml}
    </div>

    <a href="${APP_URL}/trending" class="btn">Explore Hotspots Matrix →</a>
    `,
    `Weekly intelligence digest of top GTA VI discoveries across Leonida.`,
    options
  );

  const text = `VICEPULSE WEEKLY RECON DIGEST
Top Leonida Discoveries & Surge Hotspots

Greetings Scout ${username}, here are the top verified discoveries recorded over the last 7 days:
${discoveries.slice(0, 5).map((d) => `• [${d.district}] ${d.title}: ${APP_URL}/discoveries/${d.id}`).join('\n')}

Explore Hotspots: ${APP_URL}/trending
Unsubscribe: ${options?.unsubscribeUrl || `${APP_URL}/settings/notifications`}`;

  return {
    subject: `[VicePulse Weekly] Top Leonida Discoveries & Surge Hotspots`,
    html,
    text,
  };
}
