import { CalendarDays, BellRing, Users, Sparkles } from "lucide-react";
import ProgressGauge from "./ProgressGauge";
import MiniCalendar from "./MiniCalendar";

export default function RightPanel({ stats }) {
  return (
    <>
      <MiniCalendar />

      <div className="rounded-3xl border border-white/10 bg-[#111827]/80 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white">Upcoming</h3>

          <button className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            View all
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <UpcomingItem
            icon={Sparkles}
            title="Follow up clients"
            desc="Memory AI suggestions will show here"
          />

          <UpcomingItem
            icon={BellRing}
            title="Reminders"
            desc="Upcoming reminders will appear here"
          />

          <UpcomingItem
            icon={Users}
            title="Bookings"
            desc="Upcoming bookings will show here"
          />
        </div>
      </div>

      <ProgressGauge
        completed={stats?.completed || 0}
        total={stats?.total || 0}
      />
    </>
  );
}

function UpcomingItem({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
          <Icon size={18} />
        </div>

        <div>
          <p className="font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm text-slate-400">{desc}</p>
        </div>
      </div>
    </div>
  );
}