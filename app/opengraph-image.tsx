import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ForgeLink — AI Agent Integration Hub';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200, height: 630,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#0F172A',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            backgroundColor: '#2563EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 44,
          }}>
            ⚡
          </div>
          <span style={{ fontSize: 64, fontWeight: 800, color: 'white' }}>ForgeLink</span>
        </div>
        <div style={{ fontSize: 32, color: '#94A3B8', textAlign: 'center', maxWidth: 700, lineHeight: 1.4 }}>
          The AI Agent Integration Hub
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 48 }}>
          {['MCP', 'OpenAI GPT Actions', 'LangChain', 'AutoGPT'].map(t => (
            <div key={t} style={{
              backgroundColor: '#1E293B', color: '#94A3B8',
              padding: '10px 20px', borderRadius: 100,
              fontSize: 18, fontWeight: 600,
            }}>
              {t}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48, fontSize: 20, color: '#475569' }}>
          forgelink-pi.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
