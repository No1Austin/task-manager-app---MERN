import {
  LayoutDashboard,
  CheckCircle2,
  Clock3,
  Flag,
  AlertTriangle,
} from "lucide-react";

export default function StatsGrid({ stats }) {
  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        title="Total Tasks"
        value={stats.total}
        icon={LayoutDashboard}
      />

      <StatCard
        title="Completed"
        value={stats.completed}
        icon={CheckCircle2}
      />

      <StatCard
        title="In Progress"
        value={stats.inProgress}
        icon={Clock3}
      />

      <StatCard
        title="Pending"
        value={stats.pending}
        icon={Flag}
      />

      <StatCard
        title="Overdue"
        value={stats.overdue}
        icon={AlertTriangle}
      />
    </section>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827]/80 p-5 shadow-lg">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10">
        <Icon className="text-cyan-300" size={22} />
      </div>

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h3 className="mt-2 text-4xl font-black text-white">
        {value}
      </h3>
    </div>
  );
}