const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },

    plan: {
      type: String,
      enum: ["trial", "pro"],
      default: "trial",
    },

    subscriptionStatus: {
      type: String,
      enum: [
        "trial",
        "active",
        "past_due",
        "canceled",
        "expired",
        "incomplete",
      ],
      default: "trial",
    },

    trialStartDate: {
      type: Date,
      default: Date.now,
    },

    trialEndsAt: {
      type: Date,
    },

    stripeCustomerId: {
      type: String,
      default: "",
    },

    stripeSubscriptionId: {
      type: String,
      default: "",
    },

    stripePriceId: {
      type: String,
      default: "",
    },

    currentPeriodEnd: {
      type: Date,
    },

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);