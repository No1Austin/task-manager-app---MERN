function BookingStatCard({ icon: Icon, title, value, tone = "cyan" }) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-400/10 text-emerald-300"
      : tone === "amber"
      ? "bg-amber-400/10 text-amber-300"
      : "bg-cyan-400/10 text-cyan-300";

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-2 md:rounded-3xl md:p-5">
      <div className="flex items-center gap-2 md:block">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl md:mb-4 md:h-11 md:w-11 md:rounded-2xl ${toneClass}`}
        >
          <Icon size={22} strokeWidth={2.5} className="md:hidden" />
          <Icon size={21} className="hidden md:block" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-bold leading-none text-slate-400 md:text-sm md:font-normal">
            {title}
          </p>

          <h3 className="mt-1 text-2xl font-black leading-none text-white md:text-3xl">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}