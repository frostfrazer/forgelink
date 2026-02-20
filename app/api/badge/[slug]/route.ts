import { db } from '../../../../lib/db';
import { mcpServers } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';

const CATEGORY_COLORS: Record<string, string> = {
  'Database':      '#3B82F6',
  'Cloud':         '#8B5CF6',
  'Communication': '#10B981',
  'Development':   '#4B5563',
  'Analytics':     '#F97316',
  'Finance':       '#059669',
  'AI & ML':       '#EC4899',
  'Productivity':  '#EAB308',
};

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const servers = await db.select().from(mcpServers).where(eq(mcpServers.slug, params.slug));
  const server = servers[0];

  const name = server?.name ?? 'ForgeLink';
  const rating = server?.ratingAvg ?? '5.0';
  const installs = server?.installCount ?? 0;
  const isVerified = server?.isVerified ?? false;
  const category = server?.category ?? 'MCP';
  const color = CATEGORY_COLORS[category] ?? '#3B82F6';

  // Format installs compactly
  const installStr = installs >= 1000 ? `${(installs / 1000).toFixed(1)}k` : String(installs);

  // Measure text widths (approximate: ~7px per char)
  const nameWidth = name.length * 7.2 + 16;
  const ratingWidth = 52;
  const installWidth = (installStr.length * 6.5) + 44;
  const verifiedWidth = isVerified ? 72 : 0;
  const totalWidth = nameWidth + ratingWidth + installWidth + verifiedWidth + 8;

  let x = 0;
  const nameSectionW = nameWidth;
  const ratingSectionX = nameSectionW;
  const installSectionX = ratingSectionX + ratingWidth;
  const verifiedSectionX = installSectionX + installWidth;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${name} on ForgeLink">
  <title>${name} on ForgeLink</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#555" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <mask id="m">
      <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </mask>
  </defs>
  <g mask="url(#m)">
    <!-- Name section (colored) -->
    <rect width="${nameSectionW}" height="20" fill="${color}"/>
    <!-- Rating section -->
    <rect x="${ratingSectionX}" width="${ratingWidth}" height="20" fill="#555"/>
    <!-- Installs section -->
    <rect x="${installSectionX}" width="${installWidth}" height="20" fill="#444"/>
    ${isVerified ? `<!-- Verified section -->
    <rect x="${verifiedSectionX}" width="${verifiedWidth}" height="20" fill="#1D4ED8"/>` : ''}
    <rect width="${totalWidth}" height="20" fill="url(#bg)"/>
  </g>
  <!-- Name text -->
  <text x="${nameSectionW / 2}" y="14" fill="#fff" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11" text-anchor="middle" font-weight="bold">${name}</text>
  <!-- Star + rating -->
  <text x="${ratingSectionX + 10}" y="14" fill="#FBBF24" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">★</text>
  <text x="${ratingSectionX + 22}" y="14" fill="#fff" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">${rating}</text>
  <!-- Installs -->
  <text x="${installSectionX + 8}" y="14" fill="#ccc" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="10">⬇</text>
  <text x="${installSectionX + 20}" y="14" fill="#fff" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">${installStr}</text>
  ${isVerified ? `<!-- Verified -->
  <text x="${verifiedSectionX + verifiedWidth / 2}" y="14" fill="#93C5FD" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="10" text-anchor="middle">✓ verified</text>` : ''}
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
