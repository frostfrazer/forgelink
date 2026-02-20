import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your integration has been upgraded successfully!
            </p>
            <div className="bg-green-50 p-4 rounded-lg text-sm mb-6 text-left">
              <p className="font-semibold text-green-800 mb-2">
                What's now active:
              </p>
              <ul className="text-green-700 space-y-1">
                <li>✅ Verified badge on your listing</li>
                <li>✅ Priority placement in search</li>
                <li>✅ Featured in verified section</li>
              </ul>
            </div>
            <div className="space-y-3">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                asChild
              >
                <Link href="/browse">View Marketplace</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}