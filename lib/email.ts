import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

// Notify admin of new submission
export async function sendSubmissionNotification(data: {
  name: string;
  authorName: string;
  authorEmail: string;
  category: string;
  protocol: string;
  tier: string;
  slug: string;
  id: string;
}) {
  const tierLabel = data.tier === 'early-bird' ? '🎉 EARLY BIRD FREE' :
                    data.tier === 'verified' ? '⭐ VERIFIED $99' : '⏳ FREE REVIEW';

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_FROM,
    subject: `🔔 New ForgeLink Submission: ${data.name} [${data.tier.toUpperCase()}]`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:20px 24px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">⚡ New ForgeLink Submission</h1>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Integration Name</td><td style="padding:8px 0;font-weight:600">${data.name}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Author</td><td style="padding:8px 0">${data.authorName}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td><td style="padding:8px 0"><a href="mailto:${data.authorEmail}">${data.authorEmail}</a></td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Category</td><td style="padding:8px 0">${data.category}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Protocol</td><td style="padding:8px 0">${data.protocol}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Tier</td><td style="padding:8px 0"><strong style="color:#2563eb">${tierLabel}</strong></td></tr>
          </table>
          <div style="margin-top:20px;display:flex;gap:12px">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/server/${data.id}" 
               style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
              Review in Admin →
            </a>
          </div>
        </div>
      </div>
    `,
  });
}

// Send confirmation to submitter
export async function sendSubmissionConfirmation(data: {
  authorName: string;
  authorEmail: string;
  name: string;
  tier: string;
  slug: string;
}) {
  const firstName = data.authorName.split(' ')[0];

  const tierContent = data.tier === 'early-bird' ? `
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0">
      <p style="color:#15803d;font-weight:600;margin:0 0 8px">🎉 You got the Early Bird FREE spot!</p>
      <ul style="color:#166534;margin:0;padding-left:20px;font-size:14px">
        <li>Verified badge included</li>
        <li>Priority placement</li>
        <li>Live within 24 hours</li>
      </ul>
    </div>
  ` : data.tier === 'verified' ? `
    <div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:16px;margin:16px 0">
      <p style="color:#1d4ed8;font-weight:600;margin:0 0 8px">⭐ Verified Listing — $99 one-time</p>
      <p style="color:#1e40af;font-size:14px;margin:0">We'll send you a payment link once we've reviewed your submission (within 24 hours).</p>
    </div>
  ` : `
    <div style="background:#fefce8;border:1px solid #fde047;border-radius:8px;padding:16px;margin:16px 0">
      <p style="color:#854d0e;font-weight:600;margin:0 0 8px">⏳ Free Review (7-14 days)</p>
      <p style="color:#713f12;font-size:14px;margin:0">Want to go live faster? Reply to this email to upgrade to Verified ($99).</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.authorEmail,
    subject: `✅ Submission received: ${data.name} — ForgeLink`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:20px 24px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">⚡ ForgeLink</h1>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">
          <h2 style="margin:0 0 8px">Hi ${firstName}! 👋</h2>
          <p style="color:#475569">We received your submission for <strong>${data.name}</strong>. Here's what happens next:</p>
          ${tierContent}
          <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0">
            <p style="font-weight:600;margin:0 0 8px">Next steps:</p>
            <ol style="color:#475569;margin:0;padding-left:20px;font-size:14px;line-height:1.8">
              <li>We review your integration (within 24 hours)</li>
              <li>You receive approval confirmation</li>
              <li>Your listing goes live on ForgeLink</li>
            </ol>
          </div>
          <p style="color:#64748b;font-size:14px">Questions? Just reply to this email.</p>
          <p style="color:#64748b;font-size:14px;margin:24px 0 0">— ForgeLink Team</p>
        </div>
      </div>
    `,
  });
}

// Send approval notification to server author
export async function sendApprovalEmail(data: {
  authorName: string;
  authorEmail: string;
  name: string;
  slug: string;
  isVerified: boolean;
  isFeatured: boolean;
}) {
  const firstName = data.authorName.split(' ')[0];
  const serverUrl = `${process.env.NEXT_PUBLIC_APP_URL}/server/${data.slug}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.authorEmail,
    subject: `🚀 ${data.name} is now LIVE on ForgeLink!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:20px 24px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">⚡ ForgeLink</h1>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">
          <h2 style="margin:0 0 8px">🎉 You're live, ${firstName}!</h2>
          <p style="color:#475569"><strong>${data.name}</strong> is now listed on ForgeLink and visible to thousands of developers.</p>
          ${data.isVerified ? `
          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px 16px;margin:16px 0">
            <p style="color:#15803d;margin:0;font-size:14px">✓ Verified badge active — you're showing up in priority search results</p>
          </div>` : ''}
          ${data.isFeatured ? `
          <div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:8px;padding:12px 16px;margin:16px 0">
            <p style="color:#7e22ce;margin:0;font-size:14px">★ Featured listing active — you're at the top of the browse page</p>
          </div>` : ''}
          <a href="${serverUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;margin:16px 0">
            View Your Listing →
          </a>
          <p style="color:#64748b;font-size:13px;margin-top:24px">
            Want more visibility? <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="color:#2563eb">Upgrade to Featured</a> for top placement and homepage exposure.
          </p>
        </div>
      </div>
    `,
  });
}
