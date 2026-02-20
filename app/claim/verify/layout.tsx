import { Suspense } from 'react';
import ClaimVerifyPage from './page';

export default function ClaimVerifyWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Verifying...</div>}>
      <ClaimVerifyPage />
    </Suspense>
  );
}
