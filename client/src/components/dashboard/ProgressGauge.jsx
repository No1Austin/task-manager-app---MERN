import { CheckCircle2 } from "lucide-react";

export default function ProgressGauge({ completed = 0, total = 0 }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const radius = 70;
  const stroke = 14;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * Math.PI;
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827]/80 p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white">Progress Rate</h3>
          <p className="mt-1 text-sm text-slate-400">Task completion</p>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <CheckCircle2 size={20} />
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <div className="relative h-[150px] w-[170px]">
          <svg height="150" width="170" viewBox="0 0 170 150">
            <path
              d="M 20 120 A 65 65 0 0 1 150 120"
              fill="none"
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth="14"
              strokeLinecap="round"
            />

            <path
              d="M 20 120 A 65 65 0 0 1 150 120"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700"
            />

            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-x-0 top-[72px] text-center">
            <p className="text-4xl font-black text-white">{percentage}%</p>
            <p className="mt-1 text-xs text-slate-400">Completed</p>
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
        <p className="text-sm text-slate-400">
          {completed} of {total} tasks completed
        </p>
      </div>
    </div>
  );
}