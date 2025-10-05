import { Polar } from '@polar-sh/sdk';

// Initialize Polar client with correct configuration
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || '',
});

// Types for Polar integration
export interface PolarSubscription {
  id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  product: {
    id: string;
    name: string;
    price: {
      amount: number;
      currency: string;
    };
  };
  user_id: string;
}

export interface PolarProduct {
  id: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    recurring_interval: 'month' | 'year';
  };
  is_archived: boolean;
}

