'use client';

import { useState } from 'react';

export function ClaimButton({ serverId, serverName }: { serverId: string; serverName: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [devLink, setDevLink] = useState('');
  const [error, setError] = useState('');

  const handleClaim = async () => {
    if (!email) return;
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId, email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('sent');
        if (data.devLink) setDevLink(data.devLink);
      } else {
        setStatus('error');
        setError(data.error ?? 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setError('Network error. Please try again.');
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-center text-sm text-gray-400 hover:text-blue-600 border border-dashed border-gray-200 hover:border-blue-300 rounded-xl py-3 px-4 transition-all"
      >
        Is this your integration? <span className="font-semibold text-blue-500">Claim listing →</span>
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">Claim: {serverName}</h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>

      {status === 'sent' ? (
        <div className="text-center py-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-green-600 text-lg">✓</span>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">Check your email!</p>
          <p className="text-xs text-gray-500">We sent a verification link to <strong>{email}</strong></p>
          {devLink && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-700 font-medium mb-1">Dev mode — no email configured:</p>
              <a href={devLink} className="text-xs text-blue-600 break-all underline">{devLink}</a>
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-3">Enter the email you used when submitting this integration. We&apos;ll send you a verification link.</p>
          {error && <p className="text-xs text-red-500 mb-2 bg-red-50 p-2 rounded">{error}</p>}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleClaim()}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleClaim}
            disabled={!email || status === 'sending'}
            className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            {status === 'sending' ? 'Sending...' : 'Send Verification Link'}
          </button>
        </>
      )}
    </div>
  );
}
