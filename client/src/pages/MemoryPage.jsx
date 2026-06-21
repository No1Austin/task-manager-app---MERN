import { useEffect, useMemo, useState } from "react";
import { parseAiAction } from "../utils/aiActionParser";
import {
  Brain,
  AlertTriangle,
  CalendarClock,
  Users,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import API from "../services/api";
import { useAuth } from "../context/useAuth";
import UpgradeModal from "../components/UpgradeModal";
import { buildMemoryInsights } from "../utils/memoryIntelligence";

export default function MemoryPage() {
  const { isPro } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState("");
const [pendingAction, setPendingAction] = useState(null);

const handleAiSubmit = (e) => {
  e.preventDefault();

  if (!aiMessage.trim()) return;

  const action = parseAiAction(aiMessage);
  setPendingAction(action);
  setAiMessage("");
};


  useEffect(() => {
    if (!isPro) return;

    const loadMemoryData = async () => {
      try {
        setLoading(true);

        const [tasksRes, bookingsRes] = await Promise.all([
          API.get("/tasks"),
          API.get("/bookings/my-bookings"),
        ]);

        setTasks(tasksRes.data || []);
        setBookings(bookingsRes.data || []);

        try {
          const contactsRes = await API.get("/contacts");
          setContacts(contactsRes.data || []);
        } catch {
          setContacts([]);
        }
      } catch {
        toast.error("Failed to load Memory AI data");
      } finally {
        setLoading(false);
      }
    };

    loadMemoryData();
  }, [isPro]);

  const insights = useMemo(() => {
    return buildMemoryInsights({ tasks, bookings, contacts });
  }, [tasks, bookings, contacts]);

  if (!isPro) {
    return (
      <div className="min-h-screen bg-[#050816] px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-400/15 text-violet-300">
            <Brain size={30} />
          </div>

          <h1 className="mt-5 text-3xl font-black">Memory AI is a Pro Feature</h1>

          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Upgrade to TaskFlow Pro to ask questions like who has not booked
            recently, who needs follow-up, and which customers are repeat clients.
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#0e749030,transparent_30%),radial-gradient(circle_at_top_right,#7c3aed30,transparent_30%),linear-gradient(135deg,#020617,#0f172a,#020617)] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-[#111827]/80 p-8 shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
            TaskFlow Intelligence
          </p>

          <h1 className="mt-3 text-4xl font-black">Memory AI</h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Smart business memory from your tasks, bookings, contacts and
            follow-ups.
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-[#111827]/80 p-6 shadow-xl">
  <h2 className="text-2xl font-black">Ask Memory AI</h2>
  <p className="mt-2 text-sm text-slate-400">
    Try: “Create contact for James, phone 4370000000, email james@email.com”
  </p>

  <form onSubmit={handleAiSubmit} className="mt-5 flex gap-3">
    <input
      value={aiMessage}
      onChange={(e) => setAiMessage(e.target.value)}
      placeholder="Ask Memory AI to create a contact or booking..."
      className="flex-1 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
    />

    <button className="rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 font-bold text-white">
      Ask
    </button>
  </form>

  {pendingAction && (
    <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
        Detected Action
      </p>

      <h3 className="mt-2 text-xl font-black text-white">
        {pendingAction.type.replaceAll("_", " ")}
      </h3>

      <pre className="mt-4 overflow-auto rounded-2xl bg-black/30 p-4 text-sm text-slate-300">
        {JSON.stringify(pendingAction.payload || pendingAction.message, null, 2)}
      </pre>

      <button className="mt-4 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
        Confirm Action
      </button>
    </div>
  )}
</div>

        {loading ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#111827]/80 p-8 text-slate-400">
            Loading Memory AI...
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <InsightStat
                icon={AlertTriangle}
                title="Overdue Tasks"
                value={insights.summary.overdueTasks}
                tone="red"
              />
              <InsightStat
                icon={CalendarClock}
                title="Pending Bookings"
                value={insights.summary.pendingBookings}
                tone="amber"
              />
              <InsightStat
                icon={Users}
                title="Contacts"
                value={insights.summary.contacts}
                tone="cyan"
              />
              <InsightStat
                icon={Sparkles}
                title="Top Risk"
                value={insights.summary.topRisk}
                wide
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <InsightPanel
                title="Today’s Focus"
                description="Tasks Memory AI recommends you handle first."
                emptyText="No urgent task focus for now."
                items={insights.todayFocus}
              />

              <InsightPanel
                title="Follow-up Recommendations"
                description="Customers or bookings that may need attention."
                emptyText="No follow-ups needed right now."
                items={insights.followUps}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InsightStat({ icon: Icon, title, value, tone = "cyan", wide = false }) {
  const toneClass =
    tone === "red"
      ? "bg-red-500/10 text-red-300"
      : tone === "amber"
      ? "bg-amber-500/10 text-amber-300"
      : "bg-cyan-400/10 text-cyan-300";

  return (
    <div className={`rounded-3xl border border-white/10 bg-[#111827]/80 p-5 shadow-xl ${wide ? "md:col-span-2 xl:col-span-1" : ""}`}>
      <div className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl ${toneClass}`}>
        <Icon size={21} />
      </div>

      <p className="text-sm text-slate-400">{title}</p>

      <h3 className="mt-2 line-clamp-2 text-2xl font-black text-white">
        {value}
      </h3>
    </div>
  );
}

function InsightPanel({ title, description, items, emptyText }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827]/80 p-6 shadow-xl">
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{description}</p>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
            {emptyText}
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-black text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.reason}</p>
                  {item.action && (
                    <p className="mt-2 text-sm font-semibold text-cyan-300">
                      Recommended: {item.action}
                    </p>
                  )}
                </div>

                {typeof item.score === "number" && (
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-300">
                    {item.score}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}