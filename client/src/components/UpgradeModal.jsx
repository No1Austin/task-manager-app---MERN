import { useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Crown,
  Lock,
  Sparkles,
  X,
} from "lucide-react";

import API from "../services/api";

export default function UpgradeModal({ open, onClose }) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  if (!open) return null;

  const features = [
    "Contacts",
    "Bookings",
    "WhatsApp",
    "Memory AI",
    "Email Campaigns",
    "Follow-ups",
    "Business Insights",
    "Customer Groups",
  ];

  const handleUpgrade = async () => {
    try {
      setCheckoutLoading(true);

      const { data } = await API.post("/payments/create-checkout-session");

      if (!data?.url) {
        toast.error("Checkout link was not created");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("STRIPE CHECKOUT FRONTEND ERROR:", error);
      toast.error(
        error.response?.data?.message || "Unable to start checkout"
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-xl">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-[#07111f] p-5 text-white shadow-2xl shadow-cyan-500/20 md:p-6">
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                <Crown size={14} />
                TaskFlow Pro
              </span>

              <h2 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
                Unlock your business command center.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Get the full TaskFlow system for contacts, bookings, follow-ups,
                WhatsApp and Memory AI.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={checkoutLoading}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
            >
              <X size={17} />
            </button>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-white/[0.05] to-violet-500/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                  <Sparkles size={14} />
                  Pro Plan
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-black">$24</span>
                  <span className="mb-2 text-base font-bold text-slate-400">
                    / month
                  </span>
                </div>

                <p className="mt-2 text-xs font-semibold text-slate-400">
                  Everything unlocked. Cancel anytime.
                </p>
              </div>

              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <Crown size={26} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-bold text-slate-300"
              >
                <CheckCircle2 size={14} className="shrink-0 text-cyan-300" />
                {feature}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleUpgrade}
            disabled={checkoutLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-4 text-base font-black text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {checkoutLoading ? (
              <>
                <ButtonSpinner />
                Opening checkout...
              </>
            ) : (
              <>
                <Crown size={18} />
                Start Pro Now
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={checkoutLoading}
            className="mt-3 w-full rounded-2xl border border-white/10 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50"
          >
            Maybe later
          </button>

          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-semibold text-slate-500">
            <Lock size={13} />
            Secure checkout powered by Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}

function ButtonSpinner({ size = 16 }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-white/30 border-t-white"
      style={{ width: size, height: size }}
    />
  );
}