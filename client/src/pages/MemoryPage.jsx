import { useState } from "react";
import { Brain } from "lucide-react";
import { useAuth } from "../context/useAuth";
import UpgradeModal from "../components/UpgradeModal";

export default function MemoryPage() {
  const { isPro } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (!isPro) {
    return (
      <div className="min-h-screen bg-[#050816] px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-400/15 text-violet-300">
            <Brain size={30} />
          </div>

          <h1 className="mt-5 text-3xl font-black">Memory AI is a Pro Feature</h1>

          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Upgrade to TaskFlow Pro to ask questions like who has not booked recently,
            who needs follow-up, and which customers are repeat clients.
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
      <h1 className="text-3xl font-black">Memory AI</h1>
    </div>
  );
}