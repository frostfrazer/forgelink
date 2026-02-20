'use client';

import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';

export function WaitlistActions({ total }: { total: number }) {
  const [copied, setCopied] = useState(false);

  const exportCsv = () => {
    window.location.href = '/api/admin/waitlist?pwd=forgelink_admin_2025';
  };

  const copyEmails = async () => {
    try {
      const res = await fetch('/api/admin/waitlist?pwd=forgelink_admin_2025');
      const csv = await res.text();
      const emails = csv.split('\n').slice(1).map(line => line.split(',')[0]).filter(Boolean).join('\n');
      await navigator.clipboard.writeText(emails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  if (total === 0) return null;

  return (
    <div className="flex gap-2">
      <button
        onClick={copyEmails}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
          copied
            ? 'bg-green-50 border-green-300 text-green-700'
            : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600'
        }`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy emails'}
      </button>
      <button
        onClick={exportCsv}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>
    </div>
  );
}
