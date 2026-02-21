const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = 'ForgeLink <noreply@forgelink.io>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://forgelink-pi.vercel.app';

async function send(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping:', subject);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[email] Resend error:', err);
  }
}

// ─── 1. Admin notification on new submission ──────────────────────────────────
export async function sendSubmissionNotification(data: {
  name: string; authorName: string; authorEmail: string;
  category: string; protocol: string; tier: string;
  githubUrl: string; id: string;
}) {
  const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? 'jmuranga489@gmail.com';
  const tierLabel =
    data.tier === 'early-bird' ? '🎉 EARLY BIRD FREE' :
    data.tier === 'verified'   ? '⭐ VERIFIED $99'    : '⏳ FREE REVIEW';

  await send(
    NOTIFY_EMAIL,
    `🔔 New submission: ${data.name} [${data.tier.toUpperCase()}]`,
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:20px 24px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:18px">⚡ New ForgeLink Submission</h1>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#64748b">Integration</td><td style="padding:8px 0;font-weight:600">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Author</td><td style="padding:8px 0">${data.authorName}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Email</td><td style="padding:8px 0"><a href="mailto:${data.authorEmail}">${data.authorEmail}</a></td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Category</td><td style="padding:8px 0">${data.category} / ${data.protocol}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Tier</td><td style="padding:8px 0"><strong style="color:#2563eb">${tierLabel}</strong></td></tr>
          ${data.githubUrl ? `<tr><td style="padding:8px 0;color:#64748b">GitHub</td><td style="padding:8px 0"><a href="${data.githubUrl}">${data.githubUrl}</a></td></tr>` : ''}
        </table>
        <a href="${APP_URL}/admin/server/${data.id}"
           style="display:inline-block;margin-top:20px;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          Review in Admin →
        </a>
      </div>
    </div>`
  );
}

// ─── 2. Confirmation to submitter ────────────────────────────────────────────
export async function sendSubmissionConfirmation(data: {
  authorName: string; authorEmail: string; name: string; tier: string;
}) {
  const first = data.authorName.split(' ')[0];
  const tierBlock =
    data.tier === 'early-bird' ? `
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0">
        <p style="color:#15803d;font-weight:600;margin:0 0 6px">🎉 You got an Early Bird FREE spot!</p>
        <ul style="color:#166534;margin:0;padding-left:18px;font-size:14px;line-height:1.8">
          <li>Verified badge included — no charge</li>
          <li>Priority placement in search</li>
          <li>Live within 24 hours of review</li>
        </ul>
      </div>` :
    data.tier === 'verified' ? `
      <div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:16px;margin:16px 0">
        <p style="color:#1d4ed8;font-weight:600;margin:0 0 6px">⭐ Verified Listing — $99 one-time</p>
        <p style="color:#1e40af;font-size:14px;margin:0">We'll send you a payment link once we've reviewed your submission (within 24 hours).</p>
      </div>` : `
      <div style="background:#fefce8;border:1px solid #fde047;border-radius:8px;padding:16px;margin:16px 0">
        <p style="color:#854d0e;font-weight:600;margin:0 0 6px">⏳ Free Review Queue (7–14 days)</p>
        <p style="color:#713f12;font-size:14px;margin:0">Want to go live faster? Reply to this email to upgrade to Verified ($99).</p>
      </div>`;

  await send(
    data.authorEmail,
    `✅ Submission received: ${data.name} — ForgeLink`,
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:20px 24px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:18px">⚡ ForgeLink</h1>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">
        <h2 style="margin:0 0 8px;font-size:20px">Hi ${first}! 👋</h2>
        <p style="color:#475569">We received your submission for <strong>${data.name}</strong>.</p>
        ${tierBlock}
        <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0">
          <p style="font-weight:600;margin:0 0 8px;font-size:14px">What happens next:</p>
          <ol style="color:#475569;margin:0;padding-left:18px;font-size:14px;line-height:2">
            <li>We review your integration (within 24 hours)</li>
            <li>You receive an approval confirmation</li>
            <li>Your listing goes live on ForgeLink</li>
          </ol>
        </div>
        <p style="color:#94a3b8;font-size:13px;margin-top:24px">Questions? Just reply to this email. — ForgeLink Team</p>
      </div>
    </div>`
  );
}

// ─── 3. Approval email to server author ──────────────────────────────────────
export async function sendApprovalEmail(data: {
  authorName: string; authorEmail: string; name: string;
  slug: string; isVerified: boolean; isFeatured: boolean;
}) {
  const first = data.authorName.split(' ')[0];
  const serverUrl = `${APP_URL}/server/${data.slug}`;

  await send(
    data.authorEmail,
    `🚀 ${data.name} is now LIVE on ForgeLink!`,
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:20px 24px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:18px">⚡ ForgeLink</h1>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">
        <h2 style="margin:0 0 8px;font-size:20px">🎉 You're live, ${first}!</h2>
        <p style="color:#475569"><strong>${data.name}</strong> is now listed on ForgeLink and visible to developers worldwide.</p>
        ${data.isVerified ? `
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px 16px;margin:16px 0">
          <p style="color:#15803d;margin:0;font-size:14px">✓ <strong>Verified badge active</strong> — you appear in priority search results</p>
        </div>` : ''}
        ${data.isFeatured ? `
        <div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:8px;padding:12px 16px;margin:16px 0">
          <p style="color:#7e22ce;margin:0;font-size:14px">★ <strong>Featured listing active</strong> — you're at the top of the browse page</p>
        </div>` : ''}
        <a href="${serverUrl}"
           style="display:inline-block;margin:20px 0;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          View Your Listing →
        </a>
        <p style="color:#64748b;font-size:13px">
          Want more visibility?
          <a href="${APP_URL}/pricing?serverId=${data.slug}" style="color:#2563eb">Upgrade to Featured</a>
          for top placement and homepage exposure ($199/mo).
        </p>
        <p style="color:#94a3b8;font-size:13px;margin-top:16px">— ForgeLink Team</p>
      </div>
    </div>`
  );
}

// ─── 4. Review notification to listing owner ─────────────────────────────────
export async function sendReviewNotification(data: {
  ownerEmail: string; serverName: string; slug: string;
  reviewerName: string; rating: number; comment: string | null;
}) {
  const stars = '⭐'.repeat(data.rating);
  await send(
    data.ownerEmail,
    `${stars} New review on ${data.serverName}`,
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:20px 24px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:18px">⚡ ForgeLink</h1>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">
        <h2 style="margin:0 0 4px;font-size:18px">New review on <strong>${data.serverName}</strong></h2>
        <p style="color:#475569;margin:0 0 16px;font-size:14px">from ${data.reviewerName}</p>
        <div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px">
          <p style="font-size:22px;margin:0 0 8px">${stars}</p>
          ${data.comment ? `<p style="color:#334155;margin:0;font-size:15px;line-height:1.6">"${data.comment}"</p>` : '<p style="color:#94a3b8;font-size:14px;margin:0">No comment left.</p>'}
        </div>
        <a href="${APP_URL}/server/${data.slug}"
           style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          View listing →
        </a>
      </div>
    </div>`
  );
}
