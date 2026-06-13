import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generatePaymentFiles(config: BootConfig): GeneratedFile[] {
  const { payments } = config

  switch (payments) {
    case 'none':
      return []

    case 'stripe': {
      const stripeClient: GeneratedFile = {
        path: 'lib/stripe.ts',
        content: `import Stripe from 'stripe'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'), {
  apiVersion: '2025-03-31.basil',
  typescript: true,
})
`,
      }

      const webhook: GeneratedFile = {
        path: 'app/api/stripe/route.ts',
        content: `import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { handleStripeEvent } from '@/lib/billing'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      getEnv('STRIPE_WEBHOOK_SECRET')
    )
    await handleStripeEvent(event)
    return NextResponse.json({ received: true })
  } catch (err) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
`,
      }

      const billing: GeneratedFile = {
        path: 'lib/billing.ts',
        content: `import { stripe } from './stripe'
import type Stripe from 'stripe'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
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
  return stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: getEnv('STRIPE_SUCCESS_URL'),
    cancel_url: getEnv('STRIPE_CANCEL_URL'),
  })
}

export async function createCustomerPortal(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: getEnv('STRIPE_RETURN_URL'),
  })
  return session.url
}
`,
      }

      return [stripeClient, webhook, billing]
    }

    case 'lemonsqueezy': {
      const lsClient: GeneratedFile = {
        path: 'lib/lemonsqueezy.ts',
        content: `import { createLemonSqueezy } from '@lemonsqueezy/lemonsqueezy.js'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export const ls = createLemonSqueezy({
  apiKey: getEnv('LEMON_SQUEEZY_API_KEY'),
})

export async function createCheckout(variantId: string, email: string) {
  const { data } = await ls.createCheckout({
    storeId: getEnv('LEMON_SQUEEZY_STORE_ID'),
    variantId,
    checkoutData: { email },
  })
  return data?.data.attributes.url
}
`,
      }

      const webhook: GeneratedFile = {
        path: 'app/api/lemonsqueezy/route.ts',
        content: `import { NextResponse } from 'next/server'
import crypto from 'node:crypto'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('x-signature')!

  const hmac = crypto.createHmac('sha256', getEnv('LEMON_SQUEEZY_SIGNING_SECRET'))
  const digest = hmac.update(body).digest('hex')

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)
  console.log('LemonSqueezy event:', event.meta.event_name)
  return NextResponse.json({ received: true })
}
`,
      }

      return [lsClient, webhook]
    }

    case 'paddle': {
      const paddleClient: GeneratedFile = {
        path: 'lib/paddle.ts',
        content: `import { Paddle } from '@paddle/paddle-node-sdk'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export const paddle = new Paddle(getEnv('PADDLE_API_KEY'), {
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
})
`,
      }

      const webhook: GeneratedFile = {
        path: 'app/api/paddle/route.ts',
        content: `import { NextResponse } from 'next/server'
import { paddle } from '@/lib/paddle'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('paddle-signature') ?? ''

  try {
    const event = paddle.webhooks.unmarshal(
      body,
      getEnv('PADDLE_WEBHOOK_SECRET'),
      sig.split(';').reduce(
        (acc, pair) => {
          const [k, v] = pair.split('=')
          acc[k] = v
          return acc
        },
        {} as Record<string, string>,
      ),
    )
    console.log('Paddle event:', event.eventType)
    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
`,
      }

      return [paddleClient, webhook]
    }
  }
}
