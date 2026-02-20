import Link from 'next/link';
import { Nav } from '../../../components/nav';

export default function SubmitSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Submission Received!</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your integration has been submitted for review. Our team will review it within <strong>24-48 hours</strong> and notify you by email once it is approved.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm font-semibold text-blue-800 mb-2">What happens next?</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. Our team reviews your submission</li>
              <li>2. You receive an email confirmation</li>
              <li>3. Your listing goes live on the marketplace</li>
              <li>4. Upgrade to Verified for priority placement</li>
            </ul>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/browse" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm">
              Browse Marketplace
            </Link>
            <Link href="/pricing" className="border border-gray-300 hover:border-blue-400 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors text-sm">
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
