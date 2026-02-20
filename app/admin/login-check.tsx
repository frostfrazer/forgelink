'use client';
import { useState, useEffect } from 'react';

export function AdminLoginCheck({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_token');
    if (saved) setAuthed(true);
    setChecking(false);
  }, []);

  const login = () => {
    if (token === process.env.NEXT_PUBLIC_ADMIN_TOKEN || token === 'forgelink_admin_2025') {
      sessionStorage.setItem('admin_token', token);
      setAuthed(true);
    } else {
      setError(true);
    }
  };

  if (checking) return null;

  if (!authed) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Access</h1>
        <input
          type="password"
          value={token}
          onChange={e => { setToken(e.target.value); setError(false); }}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Enter admin token"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-3">Invalid token</p>}
        <button onClick={login} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg">
          Enter
        </button>
      </div>
    </div>
  );

  return <>{children}</>;
}
