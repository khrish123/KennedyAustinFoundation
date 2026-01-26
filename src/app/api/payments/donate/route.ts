import { NextResponse } from "next/server"
import { createDonationCheckoutSession } from "@/lib/stripe/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, isRecurring, donorName, donorEmail, message } = body

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: "Invalid donation amount" },
        { status: 400 }
      )
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL

    const session = await createDonationCheckoutSession({
      amount,
      isRecurring,
      donorName,
      donorEmail,
      message,
      successUrl: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/donate`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Donation checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
