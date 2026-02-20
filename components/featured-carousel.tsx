'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Star, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  'Database':      'from-blue-500 to-blue-700',
  'Cloud':         'from-purple-500 to-purple-700',
  'Communication': 'from-green-500 to-green-700',
  'Development':   'from-gray-600 to-gray-800',
  'Analytics':     'from-orange-500 to-orange-700',
  'Finance':       'from-emerald-500 to-emerald-700',
  'AI & ML':       'from-pink-500 to-pink-700',
  'Productivity':  'from-yellow-500 to-yellow-700',
};

type Server = {
  id: string; name: string; slug: string; tagline: string;
  category: string; ratingAvg: string | null; installCount: number | null;
  isVerified: boolean | null; isFeatured: boolean | null; authorName: string;
};

export function FeaturedCarousel({ servers }: { servers: Server[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((next: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setActive((next + servers.length) % servers.length);
      setAnimating(false);
    }, 200);
  }, [animating, servers.length]);

  const prev = () => go(active - 1);
  const next = () => go(active + 1);

  // Auto-advance every 4s unless paused
  useEffect(() => {
    if (paused || servers.length <= 1) return;
    const t = setInterval(() => go(active + 1), 4000);
    return () => clearInterval(t);
  }, [active, paused, go, servers.length]);

  if (!servers.length) return null;

  const server = servers[active];
  const color = CATEGORY_COLORS[server.category] ?? 'from-blue-500 to-blue-700';

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Main card */}
      <div className={`bg-gradient-to-br ${color} p-8 sm:p-12 transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-3xl">
          {/* Badges */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {server.isFeatured && (
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-semibold backdrop-blur-sm">
                ★ Featured
              </span>
            )}
            {server.isVerified && (
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-semibold backdrop-blur-sm">
                ✓ Verified
              </span>
            )}
            <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-semibold backdrop-blur-sm">
              {server.category}
            </span>
          </div>

          {/* Name */}
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            {server.name}
          </h3>
          <p className="text-white/80 text-lg mb-6 max-w-xl">{server.tagline}</p>

          {/* Stats */}
          <div className="flex items-center gap-6 text-white/70 text-sm mb-8">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
              <strong className="text-white">{server.ratingAvg ?? '5.0'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              <strong className="text-white">{(server.installCount ?? 0).toLocaleString()}</strong> installs
            </span>
            <span>by {server.authorName}</span>
          </div>

          <Link
            href={`/server/${server.slug}`}
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            View Integration →
          </Link>
        </div>
      </div>

      {/* Controls */}
      {servers.length > 1 && (
        <>
          {/* Prev / Next */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {servers.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Progress bar */}
          {!paused && (
            <div className="absolute bottom-0 left-0 h-0.5 bg-white/30 w-full">
              <div
                key={active}
                className="h-full bg-white/70 animate-[grow_4s_linear_forwards]"
                style={{ animation: 'grow 4s linear forwards' }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
