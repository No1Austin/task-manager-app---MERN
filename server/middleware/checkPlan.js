const checkPlan = (allowedPlans = []) => {
  return async (req, res, next) => {
    try {
      const userPlan = req.user?.plan || "trial";

      if (req.user?.role === "admin") {
        return next();
      }

      if (
        userPlan === "trial" &&
        req.user?.trialEndsAt &&
        new Date(req.user.trialEndsAt) < new Date()
      ) {
        return res.status(403).json({
          message: "Your free trial has expired. Please upgrade your subscription.",
          code: "TRIAL_EXPIRED",
        });
      }

      if (allowedPlans.length > 0 && !allowedPlans.includes(userPlan)) {
        return res.status(403).json({
          message: "This feature requires an upgraded plan.",
          code: "PLAN_REQUIRED",
        });
      }

      next();
    } catch (error) {
      console.error("PLAN CHECK ERROR:", error);
      res.status(500).json({ message: "Subscription validation failed" });
    }
  };
};

module.exports = checkPlan;