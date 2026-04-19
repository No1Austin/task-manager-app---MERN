const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,

  // 🎨 Theme
  theme: {
    type: String,
    default: "light"
  },

  // 💳 Subscription
  subscriptionStatus: {
    type: String,
    enum: ["trial", "active", "expired"],
    default: "trial"
  },

  trialStartDate: {
    type: Date
  },

  trialEndsAt: {
    type: Date
  }
});

module.exports = mongoose.model("User", userSchema);