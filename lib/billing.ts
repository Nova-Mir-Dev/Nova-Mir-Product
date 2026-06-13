import { getStripe } from './stripe'
import type Stripe from 'stripe'

function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error('Missing required environment variable: ' + name);
  return val;
}

export async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      console.log('Checkout completed:', session.id)
      break
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object
      console.log('Subscription updated:', subscription.id)
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      console.log('Subscription cancelled:', subscription.id)
      break
    }
    default:
      console.log('Unhandled event type:', event.type)
  }
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
) {
  return getStripe().checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: getEnv('STRIPE_SUCCESS_URL'),
    cancel_url: getEnv('STRIPE_CANCEL_URL'),
  })
}

export async function createCustomerPortal(customerId: string) {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: getEnv('STRIPE_RETURN_URL'),
  })
  return session.url
}
