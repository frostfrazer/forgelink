'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

type Tab = 'markdown' | 'html' | 'url';

export function BadgeEmbed({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('markdown');
  const [copied, setCopied] = useState(false);

  const baseUrl = 'https://forgelink-pi.vercel.app';
  const badgeUrl = `${baseUrl}/api/badge/${slug}`;
  const pageUrl = `${baseUrl}/server/${slug}`;

  const codes: Record<Tab, string> = {
    markdown: `[![${name} on ForgeLink](${badgeUrl})](${pageUrl})`,
    html: `<a href="${pageUrl}" target="_blank"><img src="${badgeUrl}" alt="${name} on ForgeLink" /></a>`,
    url: badgeUrl,
  };

  const copy = () => {
    navigator.clipboard.writeText(codes[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-center text-sm text-gray-400 hover:text-blue-600 border border-dashed border-gray-200 hover:border-blue-300 rounded-xl py-3 px-4 transition-all"
      >
        Add a badge to your README <span className="font-semibold text-blue-500">Get embed code →</span>
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">README Badge</h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>

      {/* Live preview */}
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center border border-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/badge/${slug}`} alt={`${name} on ForgeLink`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {(['markdown', 'html', 'url'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'markdown' ? 'Markdown' : t === 'html' ? 'HTML' : 'URL'}
          </button>
        ))}
      </div>

      {/* Code */}
      <div className="relative">
        <div className="bg-gray-900 rounded-lg p-3 pr-10 text-xs font-mono text-green-400 break-all leading-relaxed">
          {codes[tab]}
        </div>
        <button
          onClick={copy}
          className={`absolute top-2 right-2 p-1.5 rounded-md transition-colors ${
            copied ? 'bg-green-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Paste this into your GitHub README. The badge auto-updates with live ratings and installs.
      </p>
    </div>
  );
}
