'use client';

import { useState } from 'react';
import { Crown, Loader2, ExternalLink } from 'lucide-react';

interface PolarSubscriptionButtonProps {
  productId: string;
  planName: string;
  planPrice: number;
  isCurrentPlan: boolean;
  disabled?: boolean;
}

export default function PolarSubscriptionButton({
  productId,
  planName,
  planPrice,
  isCurrentPlan,
  disabled = false
}: PolarSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!productId || productId === '') {
      setError('This plan is not available for subscription yet. Please check back later.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/polar/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          planName,
          planPrice
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to create checkout`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Open Polar checkout in same window for better UX
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start subscription process';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isCurrentPlan) {
    return (
      <div className="w-full">
        <button
          disabled
          className="w-full py-2 px-4 rounded-md font-medium bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 cursor-default flex items-center justify-center space-x-2"
        >
          <Crown className="h-4 w-4" />
          <span>Current Plan</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <button
        onClick={handleSubscribe}
        disabled={disabled || loading}
        className="w-full py-2 px-4 rounded-md font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white transition-colors flex items-center justify-center space-x-2 min-h-[40px]"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Upgrade to {planName}</span>
            <ExternalLink className="h-4 w-4" />
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <p className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        </div>
      )}

      {planPrice > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Secure checkout powered by Polar
        </p>
      )}
    </div>
  );
}
