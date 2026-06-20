export default function StatCard({ icon: Icon, title, value, tone = "cyan" }) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-400/10 text-emerald-300"
      : tone === "amber"
      ? "bg-amber-400/10 text-amber-300"
      : "bg-cyan-400/10 text-cyan-300";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div
        className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl ${toneClass}`}
      >
        <Icon size={21} />
      </div>

      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-1 text-3xl font-black text-white">{value}</h3>
    </div>
  );
}