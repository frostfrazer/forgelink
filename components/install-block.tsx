'use client';

import { useState } from 'react';
import { CopyButton } from './copy-button';
import { Download } from 'lucide-react';

export function InstallBlock({
  command,
  serverId,
  initialCount,
}: {
  command: string;
  serverId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [tracked, setTracked] = useState(false);

  const handleCopy = async () => {
    if (tracked) return;
    setTracked(true);
    setCount(c => c + 1);
    fetch(`/api/install/${serverId}`, { method: 'POST' }).catch(() => {});
  };

  return (
    <div className="space-y-3">
      <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-500 text-xs"># Install command</p>
          <CopyButton text={command} onCopy={handleCopy} />
        </div>
        <code className="text-green-400 break-all">{command}</code>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Download className="w-3.5 h-3.5" />
        <span><strong className="text-gray-600">{count.toLocaleString()}</strong> installs</span>
        {tracked && <span className="text-green-500 font-medium">· counted!</span>}
      </div>
    </div>
  );
}
