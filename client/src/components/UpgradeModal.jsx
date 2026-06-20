export default function UpgradeModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1020] p-6 text-white shadow-2xl">
        <h2 className="text-2xl font-black">Upgrade to TaskFlow Pro</h2>

        <p className="mt-2 text-slate-300">
          Unlock the full business operating system for contacts, bookings,
          follow-ups, and customer memory.
        </p>

        <div className="mt-5 space-y-3 text-sm text-slate-200">
          <p>✓ Contact Manager</p>
          <p>✓ Customer Groups & Labels</p>
          <p>✓ Personalized Booking Pages</p>
          <p>✓ WhatsApp Quick Send</p>
          <p>✓ Email Campaigns</p>
          <p>✓ Memory Scanner</p>
          <p>✓ Follow-up Intelligence</p>
        </div>

        <div className="mt-6 rounded-2xl bg-white text-[#070b1a]/5 p-4">
          <p className="text-sm text-slate-400">Pro Plan</p>
          <p className="mt-1 text-3xl font-black">$24/month</p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            className="flex-1 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3 font-bold"
            onClick={() => alert("Stripe checkout coming next")}
          >
            Upgrade Now
          </button>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-3 text-slate-300 hover:bg-white text-[#070b1a]/10"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}