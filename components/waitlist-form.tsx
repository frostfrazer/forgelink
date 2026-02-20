'use client';

import { useState } from 'react';

export function WaitlistForm({ source = 'homepage', dark = false }: { source?: string; dark?: boolean }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setMessage("You're on the list! We'll be in touch.");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-2 text-sm font-medium ${dark ? 'text-green-400' : 'text-green-600'}`}>
        <span className="text-lg">✓</span>
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap sm:flex-nowrap w-full max-w-md">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className={`flex-1 px-4 py-3 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 ${
          dark
            ? 'bg-white/10 border-white/20 text-white placeholder-white/50'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
        }`}
      />
      <button
        type="submit"
        disabled={status === 'loading' || !email}
        className={`px-5 py-3 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap disabled:opacity-60 ${
          dark
            ? 'bg-white text-blue-700 hover:bg-blue-50'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
      </button>
      {status === 'error' && (
        <p className={`w-full text-xs mt-1 ${dark ? 'text-red-300' : 'text-red-500'}`}>{message}</p>
      )}
    </form>
  );
}
