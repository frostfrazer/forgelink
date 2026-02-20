'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, Star, Shield } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serverId = searchParams.get('server_id');
  const tier = searchParams.get('tier');
  const reference = searchParams.get('reference') ?? searchParams.get('trxref');

  const [status, setStatus] = useState<'verifying' | 'success' | 'already' | 'error'>('verifying');
  const [serverSlug, setServerSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) { setStatus('error'); return; }

    // Verify the transaction with Paystack
    async function verify() {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${reference}&server_id=${serverId}&tier=${tier}`);
        const data = await res.json();
        if (data.ok) {
          setStatus('success');
          setServerSlug(data.slug ?? null);
        } else if (data.already) {
          setStatus('already');
          setServerSlug(data.slug ?? null);
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    }
    verify();
  }, [reference, serverId, tier]);

  const tierLabel = tier === 'featured' ? 'Featured Listing' : 'Verified Badge';
  const TierIcon = tier === 'featured' ? Star : Shield;

  if (status === 'verifying') {
    return (
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying your payment…</h1>
        <p className="text-gray-500">This takes just a second.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500 mb-6">We couldn't verify your payment. If you were charged, please contact support.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/pricing" className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Try again</Link>
          <a href="mailto:support@forgelink.io" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Contact support</a>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Success icon */}
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <TierIcon className="w-4 h-4 text-white" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {status === 'already' ? 'Already Active!' : 'Payment Confirmed!'}
      </h1>
      <p className="text-gray-500 mb-2">
        Your <strong className="text-blue-600">{tierLabel}</strong> is now active.
      </p>
      <p className="text-sm text-gray-400 mb-8">A confirmation email has been sent to you.</p>

      {/* What you get */}
      <div className={`inline-flex flex-col gap-2 text-left mb-8 bg-gradient-to-br p-5 rounded-xl text-sm ${tier === 'featured' ? 'from-yellow-50 to-orange-50 border border-yellow-200' : 'from-blue-50 to-blue-100 border border-blue-200'}`}>
        {tier === 'featured' ? (
          <>
            <p className="font-semibold text-gray-900 mb-1">⭐ Featured Listing includes:</p>
            <p className="text-gray-700">✓ Featured badge on your listing</p>
            <p className="text-gray-700">✓ Top placement in browse results</p>
            <p className="text-gray-700">✓ Homepage carousel rotation</p>
            <p className="text-gray-700">✓ Verified badge included</p>
          </>
        ) : (
          <>
            <p className="font-semibold text-gray-900 mb-1">✓ Verified Badge includes:</p>
            <p className="text-gray-700">✓ Verified checkmark on your listing</p>
            <p className="text-gray-700">✓ Priority in search results</p>
            <p className="text-gray-700">✓ Trust badge on all pages</p>
          </>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        {serverSlug ? (
          <Link href={`/server/${serverSlug}`} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors">
            View your listing →
          </Link>
        ) : (
          <Link href="/browse" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors">
            Browse marketplace →
          </Link>
        )}
        <Link href="/pricing" className="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm transition-colors">
          View pricing
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 max-w-lg w-full">
        <Suspense fallback={<div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
