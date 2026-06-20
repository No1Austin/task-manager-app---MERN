import { MessageCircle } from "lucide-react";
import UpgradeModal from "../components/UpgradeModal";
import { useAuth } from "../context/useAuth";
import { useState } from "react";

export default function WhatsAppPage() {
  const { isPro } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (!isPro) {
    return (
      <div className="min-h-screen bg-[#050816] px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-300">
            <MessageCircle size={30} />
          </div>

          <h1 className="mt-5 text-3xl font-black">WhatsApp is a Pro Feature</h1>

          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Upgrade to TaskFlow Pro to send WhatsApp messages to contacts,
            follow up with customers, and connect messaging with your CRM.
          </p>

          <button
            onClick={() => setShowUpgrade(true)}
            className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 font-bold text-white"
          >
            Upgrade to Pro
          </button>
        </div>

        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-300">
            <MessageCircle size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-black">WhatsApp Integration</h1>
            <p className="mt-2 text-slate-400">
              Start with quick-send messages. Full WhatsApp Business API can come later.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
          <h2 className="text-xl font-bold">Quick Send</h2>
          <p className="mt-2 text-sm text-slate-400">
            Select a contact later, write a message, and TaskFlow will open WhatsApp with the message ready.
          </p>
        </div>
      </div>
    </div>
  );
}