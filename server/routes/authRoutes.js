const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { supabase } = require("../config/supabase");

const router = express.Router();

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

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
      .select("id, name, email, theme, subscription_status, trial_start_date, trial_ends_at")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      _id: user.id,
      name: user.name,
      email: user.email,
      theme: user.theme,
      subscriptionStatus: user.subscription_status,
      trialStartDate: user.trial_start_date,
      trialEndsAt: user.trial_ends_at,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const trialStart = new Date();
    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          theme: "light",
          subscription_status: "trial",
          trial_start_date: trialStart.toISOString(),
          trial_ends_at: trialEnd.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const token = createToken(user.id);

    res.status(201).json({
      token,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        theme: user.theme,
        subscriptionStatus: user.subscription_status,
        trialStartDate: user.trial_start_date,
        trialEndsAt: user.trial_ends_at,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = createToken(user.id);

    res.status(200).json({
      token,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        theme: user.theme,
        subscriptionStatus: user.subscription_status,
        trialStartDate: user.trial_start_date,
        trialEndsAt: user.trial_ends_at,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

router.get("/me", protect, async (req, res) => {
  res.status(200).json(req.user);
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
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

    res.status(200).json({
      message: "If that email exists, a reset link has been sent",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to send reset email" });
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
      return res.status(400).json({ message: "Invalid or expired reset token" });
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

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password" });
  }
});

module.exports = router;