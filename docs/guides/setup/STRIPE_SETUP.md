# Stripe Setup Guide

## Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration (Sandbox/Test Environment)
STRIPE_SECRET_KEY=sk_test_***REDACTED***
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Sib5T1GFr14wZC5DLrIvz488RP4ccZHysQtwEHrD38GrZe2tDkYgJdntgxzgIuZ3KfQZVeKrqclRZ21akbZl4zv00lU9Ein7p

# Stripe Webhook Secret (for production - get from Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Vercel Environment Variables

For Vercel deployments, add these in the Vercel dashboard:
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Webhook secret (get from Stripe Dashboard)

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

See: https://stripe.com/docs/testing

