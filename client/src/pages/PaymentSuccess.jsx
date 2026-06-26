import { Link } from "react-router-dom";
import { CheckCircle2, Crown, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../context/useAuth";

export default function PaymentSuccess() {
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (refreshUser) {
      refreshUser();
    }
  }, [refreshUser]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#22d3ee30,transparent_35%),radial-gradient(circle_at_bottom_right,#8b5cf630,transparent_35%),linear-gradient(135deg,#020617,#0f172a,#020617)] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-white/[0.05] p-7 text-center shadow-2xl shadow-cyan-500/20 md:p-10">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-cyan-400/10 text-cyan-300">
              <CheckCircle2 size={42} />
            </div>

            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              <Crown size={15} />
              TaskFlow Pro Active
            </p>

            <h1 className="mt-5 text-4xl font-black md:text-5xl">
              Welcome to TaskFlow Pro
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
              Your payment has been confirmed. You now have access to contacts,
              bookings, WhatsApp, customer groups, follow-ups and Memory AI.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Contacts unlocked",
                "Bookings unlocked",
                "Memory AI unlocked",
                "WhatsApp quick send unlocked",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-slate-300"
                >
                  <Sparkles size={15} className="mr-2 inline text-cyan-300" />
                  {item}
                </div>
              ))}
            </div>

            <Link
              to="/dashboard"
              className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-4 text-base font-black text-white shadow-lg shadow-cyan-500/20 sm:w-auto"
            >
              Continue to Dashboard
            </Link>

            <p className="mt-4 text-xs text-slate-500">
              Your plan may take a few seconds to refresh after Stripe confirms
              the payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}