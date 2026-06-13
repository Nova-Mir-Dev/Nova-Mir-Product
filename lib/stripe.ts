import Stripe from 'stripe'

function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error('Missing required environment variable: ' + name);
  return val;
}

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }
  return _stripe
}
