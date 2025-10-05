import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Check if Polar is configured
    if (!process.env.POLAR_ACCESS_TOKEN) {
      console.error('❌ Polar Access Token not found in environment variables');
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // Try to import Polar dynamically
    let polar;
    try {
      const { polar: polarClient } = await import('@/lib/polar');
      polar = polarClient;
    } catch (importError) {
      console.error('❌ Failed to import Polar SDK:', importError);
      return NextResponse.json(
        { error: 'Payment system is temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    console.log('✅ Polar client loaded, initializing checkout...');
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError?.message);
      return NextResponse.json(
        { error: 'You must be logged in to subscribe. Please sign in and try again.' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.email);

    const { productId, planName, planPrice } = await request.json();

    if (!productId || typeof productId !== 'string') {
      console.error('❌ Invalid Product ID provided:', productId);
      return NextResponse.json(
        { error: 'Invalid subscription plan selected. Please try again.' },
        { status: 400 }
      );
    }

    console.log('✅ Creating Polar checkout session for:', { 
      productId, 
      planName, 
      planPrice,
      userEmail: user.email 
    });

    try {
      // First, get the product to find its price ID
      const product = await polar.products.get({
        id: productId
      });

      console.log('✅ Product found:', product.name);

      if (!product || !product.prices || product.prices.length === 0) {
        console.error('❌ Product has no pricing:', productId);
        return NextResponse.json(
          { error: 'This subscription plan is not available. Please contact support.' },
          { status: 400 }
        );
      }

      // Find the appropriate price with proper type annotation
      interface PriceItem {
        id: string;
        priceAmount: number;
      }
      
      const price = product.prices.find((p: PriceItem) => 
        p.priceAmount === planPrice * 100 || // Match by amount in cents
        product.prices.length === 1 // Or use the only available price
      ) || product.prices[0]; // Fallback to first price

      console.log('✅ Using price:', price.id, 'Amount:', price.priceAmount);

      // Create Polar checkout session with price ID
      const checkoutSession = await polar.checkouts.create({
        productPriceId: price.id,
        successUrl: `${request.nextUrl.origin}/settings?success=true&plan=${encodeURIComponent(planName)}`,
        customerEmail: user.email!,
        metadata: {
          user_id: user.id,
          plan_name: planName,
          plan_price: planPrice.toString(),
          source: 'costpilot_app'
        },
      });

      console.log('✅ Polar checkout session created:', checkoutSession.id);

      return NextResponse.json({ 
        success: true,
        url: checkoutSession.url,
        checkoutId: checkoutSession.id 
      });

    } catch (polarError) {
      console.error('❌ Polar API Error:', polarError);
      
      // Handle specific Polar errors
      if (polarError instanceof Error) {
        if (polarError.message.includes('not available in this environment')) {
          return NextResponse.json(
            { error: 'Payment system is temporarily unavailable. Please try again later.' },
            { status: 503 }
          );
        }
        if (polarError.message.includes('product not found')) {
          return NextResponse.json(
            { error: 'The selected subscription plan is no longer available.' },
            { status: 404 }
          );
        }
        if (polarError.message.includes('unauthorized')) {
          return NextResponse.json(
            { error: 'Payment system authentication failed. Please contact support.' },
            { status: 500 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Failed to initialize payment. Please try again or contact support.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Unexpected error in checkout route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
