import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeTier } from "@/lib/stripe";

function toDate(ts: number) {
  return new Date(ts * 1000).toISOString();
}

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const obj = event.data.object as unknown as Record<string, unknown>;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = obj;
      const userId = (session.metadata as Record<string, string>)?.userId;
      const subscriptionId = session.subscription as string;

      if (userId && subscriptionId) {
        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId,
        )) as unknown as Record<string, unknown>;

        await supabase
          .from("profiles")
          .update({
            stripe_subscription_id: subscription.id as string,
            stripe_customer_id: session.customer as string,
            plan_tier: "solo_pro",
            subscription_status: subscription.status as string,
            subscription_period_start: toDate(subscription.current_period_start as number),
            subscription_period_end: toDate(subscription.current_period_end as number),
          })
          .eq("id", userId);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = obj;
      const subscriptionId = invoice.subscription as string;
      if (subscriptionId) {
        await supabase
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("stripe_subscription_id", subscriptionId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = obj;
      const userId = (subscription.metadata as Record<string, string>)?.userId;

      const update: Record<string, unknown> = {
        subscription_status: subscription.status,
        subscription_period_start: toDate(subscription.current_period_start as number),
        subscription_period_end: toDate(subscription.current_period_end as number),
      };

      if (event.type === "customer.subscription.deleted") {
        update.plan_tier = "solo";
        update.stripe_subscription_id = null;
      }

      if (userId) {
        await supabase.from("profiles").update(update).eq("id", userId);
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_subscription_id", subscription.id as string)
          .single();

        if (profile) {
          await supabase.from("profiles").update(update).eq("id", profile.id);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
