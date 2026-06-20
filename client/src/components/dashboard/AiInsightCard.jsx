import { Sparkles } from "lucide-react";

export default function AiInsightCard({ overdueCount, urgentCount, isLight }) {
  return (
    <section
      className={
        isLight
          ? "rounded-3xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm"
          : "rounded-3xl border border-white/10 bg-[#111827]/80 p-5 text-white shadow-lg"
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={
            isLight
              ? "grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600"
              : "grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300"
          }
        >
          <Sparkles size={22} />
        </div>

        <div>
          <h3 className="text-2xl font-black">AI Insight</h3>
          <p className={isLight ? "mt-2 text-slate-600" : "mt-2 text-slate-400"}>
            You have {overdueCount} overdue task(s) and {urgentCount} item(s)
            needing attention.
          </p>
        </div>
      </div>
    </section>
  );
}