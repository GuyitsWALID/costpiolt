'use client';

import { useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

export default function StripeTestCard() {
  const [showTestInfo, setShowTestInfo] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-2">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          Development Mode - Test Cards Available
        </h3>
        <button
          onClick={() => setShowTestInfo(!showTestInfo)}
          className="ml-auto text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
        >
          {showTestInfo ? 'Hide' : 'Show'} Test Cards
        </button>
      </div>
      
      {showTestInfo && (
        <div className="space-y-3 text-sm text-yellow-700 dark:text-yellow-300">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span className="font-mono">4242 4242 4242 4242</span>
            <span>- Visa (Success)</span>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span className="font-mono">4000 0000 0000 0002</span>
            <span>- Card Declined</span>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span className="font-mono">4000 0000 0000 9995</span>
            <span>- Insufficient Funds</span>
          </div>
          <div className="text-xs mt-2">
            Use any future expiry date (e.g., 12/34) and any 3-digit CVC.
          </div>
        </div>
      )}
    </div>
  );
}
