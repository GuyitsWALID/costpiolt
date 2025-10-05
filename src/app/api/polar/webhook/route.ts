import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PolarSubscription {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  metadata?: {
    user_id?: string;
    plan_name?: string;
    plan_price?: string;
  };
}

interface PolarCheckout {
  id: string;
  subscription_id?: string;
  metadata?: {
    user_id?: string;
    plan_name?: string;
    plan_price?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-polar-signature');
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

    if (!webhookSecret || !signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature or secret' },
        { status: 400 }
      );
    }

    const body = await request.text();
    
    // Parse webhook event
    const event = JSON.parse(body);
    
    console.log('Received Polar webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event.data as PolarSubscription);
        break;
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data as PolarSubscription);
        break;
      
      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data as PolarSubscription);
        break;
      
      case 'checkout.completed':
        await handleCheckoutCompleted(event.data as PolarCheckout);
        break;
      
      default:
        console.log(`Unhandled Polar event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Polar webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: PolarSubscription) {
  console.log('Processing subscription created:', subscription.id);
  
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: subscription.metadata?.user_id,
      polar_subscription_id: subscription.id,
      status: subscription.status,
      plan_name: subscription.metadata?.plan_name,
      plan_price: parseFloat(subscription.metadata?.plan_price || '0'),
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
}

async function handleSubscriptionUpdated(subscription: PolarSubscription) {
  console.log('Processing subscription updated:', subscription.id);
  
  await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      updated_at: new Date().toISOString()
    })
    .eq('polar_subscription_id', subscription.id);
}

async function handleSubscriptionCanceled(subscription: PolarSubscription) {
  console.log('Processing subscription canceled:', subscription.id);
  
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('polar_subscription_id', subscription.id);
}

async function handleCheckoutCompleted(checkout: PolarCheckout) {
  console.log('Processing checkout completed:', checkout.id);
  
  if (checkout.subscription_id) {
    // This will be handled by subscription.created event
    return;
  }
  
  // Handle one-time payments if needed
  console.log('One-time payment completed:', checkout);
}
