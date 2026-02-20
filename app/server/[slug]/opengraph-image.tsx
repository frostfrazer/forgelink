import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ForgeLink Integration';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CATEGORY_COLORS: Record<string, { bg: string }> = {
  'Database':      { bg: '#3B82F6' },
  'Cloud':         { bg: '#8B5CF6' },
  'Communication': { bg: '#10B981' },
  'Development':   { bg: '#4B5563' },
  'Analytics':     { bg: '#F97316' },
  'Finance':       { bg: '#059669' },
  'AI & ML':       { bg: '#EC4899' },
  'Productivity':  { bg: '#EAB308' },
};

export default async function Image({ params }: { params: { slug: string } }) {
  // Fetch server data via API (avoids edge runtime DB incompatibility)
  let name = 'ForgeLink Integration';
  let tagline = 'AI Agent Integration Hub';
  let category = 'Development';
  let protocol = 'MCP';
  let rating = '5.0';
  let installs = 0;
  let isVerified = false;

  try {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://forgelink-pi.vercel.app').replace(/\/$/, '');
    if (!baseUrl.startsWith('http')) throw new Error('invalid url');
    const res = await fetch(`${baseUrl}/api/server/${params.slug}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      name = data.name ?? name;
      tagline = data.tagline ?? tagline;
      category = data.category ?? category;
      protocol = data.protocol ?? protocol;
      rating = data.ratingAvg ?? rating;
      installs = data.installCount ?? installs;
      isVerified = data.isVerified ?? isVerified;
    }
  } catch {
    // use defaults
  }

  const color = CATEGORY_COLORS[category]?.bg ?? '#3B82F6';

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200, height: 630,
          display: 'flex', flexDirection: 'column',
          backgroundColor: '#F8FAFC',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top color bar */}
        <div style={{ width: '100%', height: 8, backgroundColor: color, display: 'flex' }} />

        <div style={{ display: 'flex', flex: 1, padding: '60px 80px', gap: 60 }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                backgroundColor: '#2563EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'white', fontSize: 20 }}>⚡</span>
              </div>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#1E293B' }}>ForgeLink</span>
              <span style={{ fontSize: 14, color: '#94A3B8', marginLeft: 4 }}>AI Integration Hub</span>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <div style={{ backgroundColor: color, color: 'white', padding: '6px 16px', borderRadius: 100, fontSize: 14, fontWeight: 600 }}>
                {category}
              </div>
              <div style={{ backgroundColor: '#E2E8F0', color: '#475569', padding: '6px 16px', borderRadius: 100, fontSize: 14, fontWeight: 600 }}>
                {protocol}
              </div>
              {isVerified && (
                <div style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', padding: '6px 16px', borderRadius: 100, fontSize: 14, fontWeight: 600 }}>
                  ✓ Verified
                </div>
              )}
            </div>

            {/* Name */}
            <div style={{ fontSize: name.length > 25 ? 52 : 62, fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginBottom: 20 }}>
              {name}
            </div>

            {/* Tagline */}
            <div style={{ fontSize: 24, color: '#64748B', lineHeight: 1.4, maxWidth: 620 }}>
              {tagline.length > 80 ? tagline.slice(0, 80) + '…' : tagline}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32, marginTop: 'auto', paddingTop: 40 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>⭐ {rating}</span>
                <span style={{ fontSize: 14, color: '#94A3B8' }}>Rating</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{installs.toLocaleString()}</span>
                <span style={{ fontSize: 14, color: '#94A3B8' }}>Installs</span>
              </div>
            </div>
          </div>

          {/* Right icon */}
          <div style={{ width: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 200, height: 200, borderRadius: 40,
              background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 96,
              boxShadow: `0 20px 60px ${color}40`,
            }}>
              ⚡
            </div>
            <div style={{ marginTop: 24, fontSize: 16, color: '#94A3B8', textAlign: 'center' }}>
              forgelink-pi.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
