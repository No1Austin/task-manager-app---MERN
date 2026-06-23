import { CheckCircle2, TrendingUp } from "lucide-react";

export default function ProgressGauge({
  completed = 0,
  total = 0,
  compact = false,
}) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = Math.max(total - completed, 0);

  const barWidth = `${Math.min(percentage, 100)}%`;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[#111827]/80 shadow-lg ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
              Progress Rate
            </p>

            <h3
              className={`mt-2 font-black text-white ${
                compact ? "text-xl" : "text-2xl"
              }`}
            >
              Task Completion
            </h3>
          </div>

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <CheckCircle2 size={21} />
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-black leading-none text-white">
                {percentage}%
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-400">
                {completed} of {total} task(s) completed
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-slate-400">Remaining</p>
              <p className="mt-1 text-2xl font-black text-cyan-300">
                {remaining}
              </p>
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 shadow-[0_0_18px_rgba(34,211,238,0.35)] transition-all duration-500"
              style={{ width: barWidth }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-sm text-slate-300">
          <TrendingUp size={16} className="text-cyan-300" />

          <span>
            {percentage >= 70
              ? "Great progress today. Keep the momentum going."
              : percentage >= 35
              ? "Good start. A few more completed tasks will improve your rate."
              : "You still have room to push today’s progress forward."}
          </span>
        </div>
      </div>
    </div>
  );
}