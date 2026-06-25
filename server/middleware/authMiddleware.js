const jwt = require("jsonwebtoken");
const { supabase } = require("../config/supabase");

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    token = token.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from("users")
      .select(`
        id,
        name,
        email,
        plan,
        subscription_status,
        trial_start_date,
        trial_ends_at,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_price_id,
        current_period_end,
        cancel_at_period_end
      `)
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,

      plan: user.plan || "trial",
      subscriptionStatus: user.subscription_status || "trial",

      trialStartDate: user.trial_start_date,
      trialEndsAt: user.trial_ends_at,

      stripeCustomerId: user.stripe_customer_id || "",
      stripeSubscriptionId: user.stripe_subscription_id || "",
      stripePriceId: user.stripe_price_id || "",
      currentPeriodEnd: user.current_period_end,
      cancelAtPeriodEnd: user.cancel_at_period_end || false,
    };

    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = authMiddleware;