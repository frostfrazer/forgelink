import Link from 'next/link';
import { Zap } from 'lucide-react';
import { SearchAutocomplete } from './search-autocomplete';

export function Nav() {
  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ForgeLink</span>
          </Link>

          {/* Search — grows to fill space */}
          <div className="flex-1 max-w-sm hidden sm:block">
            <SearchAutocomplete />
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-5 ml-auto shrink-0">
            <Link href="/browse" className="text-gray-600 hover:text-gray-900 font-medium text-sm hidden md:block">
              Browse
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium text-sm hidden md:block">
              Pricing
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium text-sm hidden md:block">
              Dashboard
            </Link>
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 font-medium text-sm hidden md:block">
              Sign In
            </Link>
            <Link href="/submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap">
              Submit Free
            </Link>
          </div>
        </div>

        {/* Mobile search row */}
        <div className="sm:hidden pb-3">
          <SearchAutocomplete />
        </div>
      </div>
    </nav>
  );
}
