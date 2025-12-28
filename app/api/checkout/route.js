import { NextResponse } from "next/server";
import Stripe from "stripe";
import {generateToken} from "@/Utilities/module";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const body = await req.json();

    const token = await generateToken({
      userId: body?.userId || "anon",
      name: body?.name || "customer",
    });

    const successUrl = `https://boltform.buttnetworks.com/success?token=${token}`;
    const cancelUrl = `https://boltform.buttnetworks.com/cart`;

    if (!Array.isArray(body?.items) || body.items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    const line_items = body.items.map((item) => {
      if (!item?.price || !item?.title || !item?.quantity) {
        throw new Error("Invalid item data in cart");
      }
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
          },
          unit_amount: Math.round(item.price * 100), // ✅ Ensure integer
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("🔥 Stripe Checkout Error:", err.message);
    return NextResponse.json(
      { error: "Checkout session failed", message: err.message },
      { status: 500 }
    );
  }
}
