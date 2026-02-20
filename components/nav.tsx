import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Nav() {
  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ForgeLink</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/browse" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
              Browse
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
              Pricing
            </Link>
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
              Sign In
            </Link>
            <Link href="/submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
              Submit Free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
