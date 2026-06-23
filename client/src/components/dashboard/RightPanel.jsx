import {
  BellRing,
  CalendarDays,
  Repeat2,
  Sparkles,
  Star,
  TimerReset,
} from "lucide-react";

import ProgressGauge from "./ProgressGauge";
import MiniCalendar from "./MiniCalendar";

export default function RightPanel({ stats, intelligence = {} }) {
  const insights = [
    {
      icon: BellRing,
      title: "Follow-Ups Needed",
      desc: `${intelligence.followUps || 0} customer(s) may need follow-up.`,
      value: intelligence.followUps || 0,
      tone: "cyan",
    },
    {
      icon: Repeat2,
      title: "One-Time Customers",
      desc: `${intelligence.oneTimeCustomers || 0} customer(s) booked once and never returned.`,
      value: intelligence.oneTimeCustomers || 0,
      tone: "violet",
    },
    {
      icon: TimerReset,
      title: "Inactive Customers",
      desc: `${intelligence.inactiveCustomers || 0} customer(s) inactive for 14+ days.`,
      value: intelligence.inactiveCustomers || 0,
      tone: "amber",
    },
    {
      icon: Star,
      title: "VIP Customers",
      desc: `${intelligence.vipCustomers || 0} customer(s) have booked 3+ times.`,
      value: intelligence.vipCustomers || 0,
      tone: "emerald",
    },
    {
      icon: CalendarDays,
      title: "Bookings Today",
      desc: `${intelligence.bookingsToday || 0} booking(s) scheduled today.`,
      value: intelligence.bookingsToday || 0,
      tone: "cyan",
    },
  ];

  return (
    <>
      <div className="grid gap-4 2xl:grid-cols-2">
        <MiniCalendar compact />

        <ProgressGauge
          compact
          completed={stats?.completed || 0}
          total={stats?.total || 0}
        />
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-[#0b1220]/90 p-5 shadow-2xl shadow-black/30">
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">
                Business Intelligence
              </p>

              <h3 className="mt-2 text-xl font-black text-white">
                Today's Opportunities
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Smart signals from your tasks, bookings and customer activity.
              </p>
            </div>

            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300 shadow-lg shadow-cyan-500/10">
              <Sparkles size={20} />
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {insights.map((item) => (
              <InsightItem key={item.title} item={item} />
            ))}
          </div>

          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/15"
          >
            View Full Intelligence
          </button>
        </div>
      </section>
    </>
  );
}

function InsightItem({ item }) {
  const Icon = item.icon;

  const tones = {
    cyan: {
      icon: "bg-cyan-400/10 text-cyan-300",
      badge: "bg-cyan-400/10 text-cyan-300",
      border: "hover:border-cyan-400/30",
    },
    violet: {
      icon: "bg-violet-400/10 text-violet-300",
      badge: "bg-violet-400/10 text-violet-300",
      border: "hover:border-violet-400/30",
    },
    amber: {
      icon: "bg-amber-400/10 text-amber-300",
      badge: "bg-amber-400/10 text-amber-300",
      border: "hover:border-amber-400/30",
    },
    emerald: {
      icon: "bg-emerald-400/10 text-emerald-300",
      badge: "bg-emerald-400/10 text-emerald-300",
      border: "hover:border-emerald-400/30",
    },
  };

  const tone = tones[item.tone] || tones.cyan;

  return (
    <div
      className={`group rounded-2xl border border-white/10 bg-white/[0.035] p-3 transition ${tone.border} hover:bg-white/[0.055]`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone.icon}`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-black text-white">
              {item.title}
            </p>

            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${tone.badge}`}
            >
              {item.value}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
            {item.desc}
          </p>
        </div>
      </div>
    </div>
  );
}