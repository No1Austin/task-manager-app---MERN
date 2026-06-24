export default function StatCard({
  icon: Icon,
  title,
  value,
  tone = "cyan",
}) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-400/10 text-emerald-300"
      : tone === "amber"
      ? "bg-amber-400/10 text-amber-300"
      : tone === "red"
      ? "bg-red-400/10 text-red-300"
      : "bg-cyan-400/10 text-cyan-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:rounded-3xl md:p-5">
      {Icon && (
        <div
          className={`mb-2 grid h-8 w-8 place-items-center rounded-xl md:mb-4 md:h-11 md:w-11 md:rounded-2xl ${toneClass}`}
        >
          <Icon size={16} className="md:hidden" />
          <Icon size={21} className="hidden md:block" />
        </div>
      )}

      <p className="truncate text-[11px] text-slate-400 md:text-sm">
        {title}
      </p>

      <h3 className="mt-1 truncate text-xl font-black text-white md:text-3xl">
        {value}
      </h3>
    </div>
  );
}