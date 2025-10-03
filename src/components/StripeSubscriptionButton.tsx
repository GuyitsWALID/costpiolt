'use client';

import { useState } from 'react';
import { Crown, Loader2 } from 'lucide-react';

interface StripeSubscriptionButtonProps {
  priceId: string;
  planName: string;
  planPrice: number;
  isCurrentPlan: boolean;
  disabled?: boolean;
}

export default function StripeSubscriptionButton({
  priceId,
  planName,
  planPrice,
  isCurrentPlan,
  disabled = false
}: StripeSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!priceId || priceId === '') {
      alert('This plan is not available for subscription yet.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          planName,
          planPrice
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start subscription process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isCurrentPlan) {
    return (
      <button
        disabled
        className="w-full py-2 px-4 rounded-md font-medium bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <Crown className="h-4 w-4" />
        <span>Current Plan</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={disabled || loading}
      className="w-full py-2 px-4 rounded-md font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white transition-colors flex items-center justify-center space-x-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <span>Upgrade to {planName}</span>
      )}
    </button>
  );
}
