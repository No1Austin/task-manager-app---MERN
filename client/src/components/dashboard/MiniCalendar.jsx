const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const monthName = today.toLocaleString("default", { month: "long" });
  const shortMonth = today.toLocaleString("default", { month: "short" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array.from({ length: firstDay });
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827]/80 p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white">{monthName}</h3>
          <p className="text-xs text-slate-500">{year}</p>
        </div>

        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[11px] font-bold text-cyan-300">
          {shortMonth} {today.getDate()}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500">
        {days.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
        {blanks.map((_, index) => (
          <div key={`blank-${index}`} />
        ))}

        {dates.map((date) => {
          const isToday = date === today.getDate();

          return (
            <div
              key={date}
              className={`grid h-7 w-7 place-items-center rounded-lg transition ${
                isToday
                  ? "bg-cyan-400 font-black text-white"
                  : "text-slate-300 hover:bg-white/[0.06]"
              }`}
            >
              {date}
            </div>
          );
        })}
      </div>
    </div>
  );
}