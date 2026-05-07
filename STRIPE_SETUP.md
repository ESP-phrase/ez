# Stripe Integration Setup Guide

This guide walks you through setting up Stripe payments for PolyGoat.

## Prerequisites

- Stripe account (https://stripe.com)
- Active Stripe API keys

## Step 1: Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
3. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

## Step 2: Create Price Objects in Stripe Dashboard

### Pro Plan ($1 first month, then $39/month)

1. Go to https://dashboard.stripe.com/products
2. Click "Create product"
3. Name: "PolyGoat Pro"
4. Click "Add pricing"
5. Pricing model: Standard pricing
6. Price: $1.00
7. Billing period: Monthly
8. Click "Save product"
9. Copy the **Price ID** (starts with `price_`)

### Elite Plan ($99/month)

1. Go to https://dashboard.stripe.com/products
2. Click "Create product"
3. Name: "PolyGoat Elite"
4. Click "Add pricing"
5. Pricing model: Standard pricing
6. Price: $99.00
7. Billing period: Monthly
8. Click "Save product"
9. Copy the **Price ID** (starts with `price_`)

## Step 3: Create Webhook Secret

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhooks` (for local dev, use ngrok or similar)
4. Events to send:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add events"
6. Click "Create endpoint"
7. Copy the **Signing secret** (starts with `whsec_`)

For local development, you can use:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

This will output a signing secret you can use locally.

## Step 4: Set Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ELITE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_URL=http://localhost:3000
```

## Step 5: Test the Integration

1. Start the dev server: `npm run dev`
2. Navigate to the pricing page: `http://localhost:3000/#pricing`
3. Click "Get Pro for $1"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Expiry: Any future date
6. CVC: Any 3 digits
7. You should be redirected to `/dashboard?session_id=...`

## Testing with Stripe CLI

For testing webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Listen for webhook events
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

## Production Deployment

When deploying to production:

1. Use your **live** Stripe keys (starts with `sk_live_` and `pk_live_`)
2. Update webhook endpoint URL to your production domain
3. Enable webhook signing verification (already implemented)
4. Test with real transactions in live mode (small amounts recommended)

## File Reference

- **Checkout endpoint**: `app/api/stripe/checkout/route.ts`
- **Webhook handler**: `app/api/stripe/webhooks/route.ts`
- **Success handler**: `app/api/stripe/success/route.ts`
- **Customer portal**: `app/api/stripe/customer-portal/route.ts`
- **Subscription status**: `app/api/subscription-status/route.ts`
- **Stripe config**: `lib/stripe.ts`
- **Subscription utilities**: `lib/subscription.ts`
- **Database schema**: `prisma/schema.prisma`

## Database Schema

The User model in Prisma now includes:
- `stripeCustomerId`: Stripe customer ID
- `plan`: Subscription tier (FREE, PRO, ELITE)
- `subscriptionStatus`: Status (INACTIVE, TRIALING, ACTIVE, PAST_DUE, CANCELED, UNPAID)
- `subscriptionId`: Stripe subscription ID
- `currentPeriodEnd`: When current billing period ends

## Troubleshooting

### Webhook not receiving events
- Check that your webhook URL is correct
- Verify signing secret is set correctly
- Check Stripe dashboard webhook logs for errors

### Checkout session not creating
- Verify STRIPE_SECRET_KEY is set correctly
- Check that price IDs are valid in Stripe dashboard
- Look for errors in server logs

### Subscription not updating
- Verify webhook is receiving events
- Check database for User record with matching email
- Review webhook handler logs

## Next Steps

1. Implement feature gating based on subscription tier
2. Add trial period logic
3. Set up customer support for subscription issues
4. Monitor subscription churn and revenue metrics
