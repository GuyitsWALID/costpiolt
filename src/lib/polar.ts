interface PolarSDK {
  checkouts: {
    create: (request: {
      productPriceId: string;
      successUrl: string;
      customerEmail?: string;
      metadata?: Record<string, string>;
    }) => Promise<{ id: string; url: string }>;
  };
  products: {
    get: (params: { id: string }) => Promise<{
      id: string;
      name: string;
      prices: Array<{ id: string; priceAmount: number }>;
    }>;
    list: (params: { organizationId?: string; limit?: number }) => Promise<unknown>;
  };
  organizations: {
    get: (params: { id: string }) => Promise<{ id: string; name: string }>;
    list: () => Promise<unknown>;
  };
}

// Initialize with mock first, then try to load real SDK
let polar: PolarSDK = {
  checkouts: {
    create: async () => {
      throw new Error('Polar integration is not available in this environment');
    }
  },
  products: {
    get: async () => {
      throw new Error('Polar integration is not available in this environment');
    },
    list: async () => {
      throw new Error('Polar integration is not available in this environment');
    }
  },
  organizations: {
    get: async () => {
      throw new Error('Polar integration is not available in this environment');
    },
    list: async () => {
      throw new Error('Polar integration is not available in this environment');
    }
  }
};

// Try to load the real Polar SDK
if (typeof window === 'undefined') {
  // Server-side - use dynamic import
  try {
    import('@polar-sh/sdk').then(PolarModule => {
      const PolarClass = PolarModule.Polar;
      
      // Initialize Polar client with correct configuration
      const realPolar = new PolarClass({
        accessToken: process.env.POLAR_ACCESS_TOKEN || '',
      });
      
      // Cast to our interface (the real SDK should be compatible)
      polar = realPolar as unknown as PolarSDK;
    }).catch(() => {
      // Keep mock implementation
      console.warn('Failed to load Polar SDK, using mock implementation');
    });
  } catch {
    // Keep mock implementation
    console.warn('Polar SDK not available, using mock implementation');
  }
}

export { polar };

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

export const POLAR_CONFIG = {
  organizationName: 'costpilot',
  baseCheckoutUrl: 'https://polar.sh/checkout/costpilot',
  plans: {
    pro: {
      id: 'pro-plan',
      name: 'Pro Plan',
      price: 29,
      checkoutUrl: 'https://polar.sh/checkout/costpilot/pro-plan'
    },
    enterprise: {
      id: 'enterprise-plan', 
      name: 'Enterprise Plan',
      price: 99,
      checkoutUrl: 'https://polar.sh/checkout/costpilot/enterprise-plan'
    }
  },
  // Environment variables for production
  organizationId: process.env.NEXT_PUBLIC_POLAR_ORGANIZATION_ID || '',
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || '',
};

export const redirectToPolarCheckout = (planType: 'pro' | 'enterprise', userId?: string) => {
  const plan = POLAR_CONFIG.plans[planType];
  const params = new URLSearchParams({
    ...(userId && { customer_id: userId }),
  });
  
  const checkoutUrl = `${plan.checkoutUrl}${params.toString() ? '?' + params.toString() : ''}`;
  window.open(checkoutUrl, '_blank');
};

export const getPlanByProductId = (productId: string) => {
  return Object.values(POLAR_CONFIG.plans).find(plan => plan.id === productId);
};

export const isPolarWebhookValid = (signature: string, payload: string, secret: string): boolean => {
  // Implement Polar webhook signature validation
  // This will depend on Polar's webhook signing method
  return true; // Placeholder - implement based on Polar's documentation
};

