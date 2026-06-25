const express = require("express");
const Stripe = require("stripe");
const authMiddleware = require("../middleware/authMiddleware");
const { supabase } = require("../config/supabase");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

async function updateUserBilling(userId, updates) {
  const { error } = await supabase.from("users").update(updates).eq("id", userId);

  if (error) {
    console.error("SUPABASE BILLING UPDATE ERROR:", error);
    throw error;
  }
}

router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRO_PRICE_ID) {
      return res.status(500).json({
        message: "Stripe environment variables are missing",
      });
    }

    let customerId = req.user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: req.user.id,
        },
      });

      customerId = customer.id;

      await updateUserBilling(req.user.id, {
        stripe_customer_id: customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        userId: req.user.id,
        plan: "pro",
      },
      subscription_data: {
        metadata: {
          userId: req.user.id,
          plan: "pro",
        },
      },
      success_url: `${CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/dashboard?payment=cancelled`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error("STRIPE CHECKOUT ERROR:", error);
    return res.status(500).json({
      message: error.message || "Failed to create checkout session",
    });
  }
});

router.post("/webhook", async (req, res) => {
  let event;

  try {
    const signature = req.headers["stripe-signature"];

    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("STRIPE WEBHOOK SIGNATURE ERROR:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription;
      const customerId = session.customer;

      if (userId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await updateUserBilling(userId, {
          plan: "pro",
          subscription_status: subscription.status,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0]?.price?.id || "",
          current_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: subscription.cancel_at_period_end || false,
        });
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;

      if (userId) {
        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        await updateUserBilling(userId, {
          plan: isActive ? "pro" : "trial",
          subscription_status:
            subscription.status === "canceled" ? "canceled" : subscription.status,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0]?.price?.id || "",
          current_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: subscription.cancel_at_period_end || false,
        });
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata?.userId;

        if (userId) {
          await updateUserBilling(userId, {
            plan: "trial",
            subscription_status: "past_due",
            current_period_end: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: subscription.cancel_at_period_end || false,
          });
        }
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("STRIPE WEBHOOK HANDLER ERROR:", error);
    return res.status(500).json({ message: "Webhook handler failed" });
  }
});

router.post("/create-portal-session", authMiddleware, async (req, res) => {
  try {
    if (!req.user.stripeCustomerId) {
      return res.status(400).json({
        message: "No Stripe customer found for this user",
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: req.user.stripeCustomerId,
      return_url: `${CLIENT_URL}/settings`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error("STRIPE PORTAL ERROR:", error);
    return res.status(500).json({
      message: error.message || "Failed to open billing portal",
    });
  }
});

router.get("/subscription", authMiddleware, async (req, res) => {
  return res.json({
    plan: req.user.plan,
    subscriptionStatus: req.user.subscriptionStatus,
    trialEndsAt: req.user.trialEndsAt,
    stripeCustomerId: req.user.stripeCustomerId,
    stripeSubscriptionId: req.user.stripeSubscriptionId,
    currentPeriodEnd: req.user.currentPeriodEnd,
    cancelAtPeriodEnd: req.user.cancelAtPeriodEnd,
  });
});

module.exports = router;