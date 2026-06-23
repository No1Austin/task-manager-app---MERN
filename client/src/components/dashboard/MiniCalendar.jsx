const days = ["S", "M", "T", "W", "T", "F", "S"];

export default function MiniCalendar({ compact = false }) {
  const today = new Date();

  const month = today.toLocaleString("default", {
    month: "short",
  });

  const year = today.getFullYear();
  const currentDay = today.getDate();

  const dates = Array.from({ length: 28 }, (_, index) => index + 1);

  return (
    <div
      className={`rounded-3xl border border-white/10 bg-[#111827]/80 shadow-lg ${
        compact ? "p-3" : "p-5"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Calendar
          </p>

          <h3
            className={
              compact
                ? "mt-1 text-base font-black text-white"
                : "mt-1 text-2xl font-black text-white"
            }
          >
            {month} {year}
          </h3>
        </div>
      </div>

      <div
        className={`mt-4 grid grid-cols-7 ${
          compact ? "gap-1 text-[10px]" : "gap-2 text-xs"
        } text-center text-slate-500`}
      >
        {days.map((day, index) => (
          <span key={`${day}-${index}`} className="font-bold">
            {day}
          </span>
        ))}

        {dates.map((date) => {
          const active = date === currentDay;

          return (
            <div
              key={date}
              className={`grid place-items-center font-bold transition ${
                compact
                  ? "h-7 w-7 rounded-lg text-[10px]"
                  : "h-10 w-10 rounded-xl text-sm"
              } ${
                active
                  ? "bg-cyan-400 text-slate-950"
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