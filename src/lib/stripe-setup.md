# Stripe Setup Guide for CostPilot

## Step 1: Install Stripe Packages

Run the following command in your project root:

```bash
npm install stripe @types/stripe
```

## Step 2: Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a new account or log in
3. Complete the account verification process

## Step 3: Get API Keys

1. In your Stripe Dashboard, go to **Developers > API keys**
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)
4. Add these to your `.env.local` file

## Step 4: Create Subscription Products

### Create Pro Plan Product:

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add product**
3. Fill in:
   - **Name**: "Pro Plan"
   - **Description**: "Unlimited projects with advanced analytics"
   - **Pricing**: $19.00 USD per month
   - **Billing period**: Monthly
4. Click **Save product**
5. Copy the **Price ID** (starts with `price_`) and add to `.env.local` as `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`

### Create Enterprise Plan Product:

1. Click **+ Add product** again
2. Fill in:
   - **Name**: "Enterprise Plan"
   - **Description**: "Everything in Pro plus team collaboration"
   - **Pricing**: $49.00 USD per month
   - **Billing period**: Monthly
3. Click **Save product**
4. Copy the **Price ID** and add to `.env.local` as `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID`

## Step 5: Configure Webhooks

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **+ Add endpoint**
3. Set **Endpoint URL** to: `https://yourdomain.com/api/stripe/webhook`
   - For local development: `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) and add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Step 6: Set Up Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_price DECIMAL(10,2) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');
```

## Step 7: Test the Integration

1. Start your development server: `npm run dev`
2. Go to Settings > Subscription
3. Try upgrading to a paid plan
4. Use Stripe's test card: `4242 4242 4242 4242`
5. Check that the webhook receives events in Stripe Dashboard

## Development vs Production

### Development:
- Use test API keys (pk_test_, sk_test_)
- Use ngrok or similar for webhook testing
- Test with Stripe test cards

### Production:
- Switch to live API keys (pk_live_, sk_live_)
- Update webhook endpoint to production URL
- Test with real payment methods

## Troubleshooting

### Common Issues:

1. **Webhook not receiving events**: Check URL is publicly accessible
2. **Invalid signature**: Ensure STRIPE_WEBHOOK_SECRET is correct
3. **Database errors**: Check Supabase RLS policies
4. **Price ID not found**: Verify price IDs in environment variables

### Testing Webhooks Locally:

Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
# Then forward events to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
