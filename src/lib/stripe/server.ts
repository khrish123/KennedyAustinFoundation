import Stripe from "stripe"

const createStripeClient = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(key, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
  })
}

// Lazy initialization to avoid build errors
let stripeInstance: Stripe | null = null

export const getStripe = () => {
  if (!stripeInstance) {
    stripeInstance = createStripeClient()
  }
  return stripeInstance
}

// Backwards compatibility
export const stripe = {
  get checkout() {
    return getStripe().checkout
  },
  get webhooks() {
    return getStripe().webhooks
  },
}

export async function createCheckoutSession({
  priceId,
  mode,
  successUrl,
  cancelUrl,
  customerEmail,
  metadata,
}: {
  priceId?: string
  mode: "payment" | "subscription"
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  metadata?: Record<string, string>
}) {
  const session = await stripe.checkout.sessions.create({
    mode,
    payment_method_types: ["card"],
    line_items: priceId
      ? [{ price: priceId, quantity: 1 }]
      : undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata,
  })

  return session
}

export async function createDonationCheckoutSession({
  amount,
  isRecurring,
  donorEmail,
  donorName,
  message,
  successUrl,
  cancelUrl,
}: {
  amount: number
  isRecurring: boolean
  donorEmail?: string
  donorName?: string
  message?: string
  successUrl: string
  cancelUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
    mode: isRecurring ? "subscription" : "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: isRecurring ? "Monthly Donation" : "One-time Donation",
            description: `Supporting the Kennedy Austin Foundation${message ? `: "${message}"` : ""}`,
          },
          unit_amount: amount * 100, // Convert to cents
          ...(isRecurring && { recurring: { interval: "month" } }),
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: donorEmail,
    metadata: {
      type: "donation",
      donor_name: donorName || "",
      donor_email: donorEmail || "",
      message: message || "",
      is_recurring: isRecurring ? "true" : "false",
    },
  })

  return session
}

export async function createClassPaymentSession({
  classId,
  classTitle,
  price,
  customerEmail,
  userId,
  successUrl,
  cancelUrl,
}: {
  classId: string
  classTitle: string
  price: number
  customerEmail?: string
  userId?: string
  successUrl: string
  cancelUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: classTitle,
            description: "Class enrollment",
          },
          unit_amount: price * 100,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      type: "class_enrollment",
      class_id: classId,
      user_id: userId || "",
    },
  })

  return session
}

export async function handleWebhookEvent(
  body: string,
  signature: string
) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  return event
}
