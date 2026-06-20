export default function PlanCard({ plan, trialEndsAt, theme }) {
  const isGreenTheme = theme === "light";

  return (
    <div
      className={
        isGreenTheme
          ? "rounded-3xl border border-emerald-500/20 bg-emerald-950 p-5 text-emerald-50"
          : "glass rounded-3xl p-5"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className={`text-xs uppercase tracking-[0.25em] ${
              isGreenTheme ? "text-emerald-300" : "text-cyan-300"
            }`}
          >
            Subscription
          </p>

          <h3 className="mt-2 text-2xl font-black">Current Plan</h3>
        </div>

        <span
          className={`rounded-full px-4 py-1 text-sm font-bold capitalize ${
            isGreenTheme
              ? "bg-emerald-400/15 text-emerald-200"
              : "bg-cyan-400/20 text-cyan-300"
          }`}
        >
          {plan}
        </span>
      </div>

      {plan === "trial" && (
        <div
          className={`mt-5 rounded-2xl p-4 ${
            isGreenTheme
              ? "border border-emerald-400/20 bg-emerald-400/10"
              : "border border-cyan-400/20 bg-cyan-400/10"
          }`}
        >
          <p
            className={
              isGreenTheme
                ? "text-sm text-emerald-200/80"
                : "text-sm text-slate-300"
            }
          >
            Free trial active
          </p>

          <p className="mt-1 text-xl font-black">
            Ends{" "}
            {trialEndsAt
              ? new Date(trialEndsAt).toLocaleDateString()
              : "soon"}
          </p>
        </div>
      )}

      <div className="mt-5 space-y-3">
        <button
          className={`w-full rounded-2xl p-4 text-left transition ${
            isGreenTheme
              ? "border border-emerald-400/20 bg-emerald-500/10 hover:bg-emerald-500/15"
              : "border border-violet-300/20 bg-violet-500/20 hover:bg-violet-500/30"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-black">Starter</p>

              <p
                className={
                  isGreenTheme
                    ? "text-sm text-emerald-200/75"
                    : "text-sm text-slate-300"
                }
              >
                Task manager
              </p>
            </div>

            <p className="text-3xl font-black">$10</p>
          </div>
        </button>

        <button
          className={`w-full rounded-2xl p-4 text-left transition ${
            isGreenTheme
              ? "border border-lime-400/20 bg-lime-500/10 hover:bg-lime-500/15"
              : "border border-cyan-300/20 bg-cyan-500/20 hover:bg-cyan-500/30"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-black">Pro</p>

              <p
                className={
                  isGreenTheme
                    ? "text-sm text-emerald-200/75"
                    : "text-sm text-slate-300"
                }
              >
                Contacts, bookings & memory
              </p>
            </div>

            <p className="text-3xl font-black">$24</p>
          </div>
        </button>
      </div>
    </div>
  );
}