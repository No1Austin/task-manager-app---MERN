const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { supabase } = require("../config/supabase");

const router = express.Router();

const TRIAL_DAYS = Number(process.env.TRIAL_DAYS || 30);

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const userSelect = `
  id,
  name,
  email,
  theme,
  plan,
  subscription_status,
  trial_start_date,
  trial_ends_at,
  stripe_customer_id,
  stripe_subscription_id,
  stripe_price_id,
  current_period_end,
  cancel_at_period_end
`;

const formatUser = (user) => ({
  _id: user.id,
  id: user.id,
  name: user.name,
  email: user.email,
  theme: user.theme || "light",
  plan: user.plan || "trial",
  subscriptionStatus: user.subscription_status || "trial",
  trialStartDate: user.trial_start_date,
  trialEndsAt: user.trial_ends_at,
  stripeCustomerId: user.stripe_customer_id || "",
  stripeSubscriptionId: user.stripe_subscription_id || "",
  stripePriceId: user.stripe_price_id || "",
  currentPeriodEnd: user.current_period_end || null,
  cancelAtPeriodEnd: user.cancel_at_period_end || false,
});

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    token = token.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from("users")
      .select(userSelect)
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = formatUser(user);

    next();
  } catch (error) {
    console.error("AUTH PROTECT ERROR:", error);
    return res.status(401).json({ message: "Not authorized" });
  }
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const trialStart = new Date();
    const trialEnd = new Date(
      trialStart.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000
    );

    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          theme: "light",
          plan: "trial",
          subscription_status: "trial",
          trial_start_date: trialStart.toISOString(),
          trial_ends_at: trialEnd.toISOString(),
          stripe_customer_id: "",
          stripe_subscription_id: "",
          stripe_price_id: "",
          current_period_end: null,
          cancel_at_period_end: false,
        },
      ])
      .select(userSelect)
      .single();

    if (error) {
      console.error("REGISTER SUPABASE ERROR:", error);
      return res.status(400).json({ message: error.message });
    }

    const token = createToken(user.id);

    return res.status(201).json({
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error || !user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = createToken(user.id);

    return res.status(200).json({
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Login failed" });
  }
});

router.get("/me", protect, async (req, res) => {
  return res.status(200).json(req.user);
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const normalizedEmail = email?.toLowerCase().trim();

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (!user) {
      return res.status(200).json({
        message: "If that email exists, a reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetExpire = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabase
      .from("users")
      .update({
        reset_password_token: hashedToken,
        reset_password_expire: resetExpire,
      })
      .eq("id", user.id);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const message = `
You requested a password reset.

Click this link to reset your password:
${resetUrl}

This link will expire in 15 minutes.
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      text: message,
    });

    return res.status(200).json({
      message: "If that email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Failed to send reset email" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "New password is required" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const now = new Date().toISOString();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("reset_password_token", hashedToken)
      .gt("reset_password_expire", now)
      .maybeSingle();

    if (error || !user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await supabase
      .from("users")
      .update({
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expire: null,
      })
      .eq("id", user.id);

    return res.status(200).json({
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Failed to reset password" });
  }
});

module.exports = router;