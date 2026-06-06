import { db } from "@/server/db";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  console.log("Webhook called");
  const payload = await req.text();
  const sig = (await headers()).get("stripe-signature")! as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.log(err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
  if (!event) {
    return;
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    await fulfillCheckout(event.data.object);
  }

  return Response.json(
    { message: "Credits added successfully" },
    { status: 200 },
  );
}

async function fulfillCheckout(session: Stripe.Checkout.Session) {
  // Set your secret key. Remember to switch to your live secret key in production.
  // See your keys here: https://dashboard.stripe.com/apikeys

  console.log("Fulfilling Checkout Session " + session.id);

  // TODO: Make this function safe to run multiple times,
  // even concurrently, with the same session ID

  // TODO: Make sure fulfillment hasn't already been
  // performed for this Checkout Session

  // Retrieve the Checkout Session from the API with line_items expanded
  const checkoutSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items"],
  });

  // Check the Checkout Session's payment_status property
  // to determine if fulfillment should be performed
  if (checkoutSession.payment_status !== "unpaid") {
    // TODO: Perform fulfillment of the line items
    // TODO: Record/save fulfillment status for this
    // Checkout Session
    const credits = Number(session.metadata?.credits);
    const userId = session.client_reference_id;
    if (!userId || !credits) {
      return Response.json({
        message: "Missing userId or credits",
        status: 400,
      });
    }
    await db.stripeTransaction.create({
      data: {
        userId,
        creditsPurchased: credits,
        amount: credits / 50,
      },
    });
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        credits: {
          increment: credits,
        },
      },
    });
  }
}
