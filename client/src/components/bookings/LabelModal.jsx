export default function LabelModal({
  value,
  setValue,
  onClose,
  onSave,
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1020] p-6 text-white shadow-2xl">
        <h2 className="text-2xl font-black">Label Customer</h2>

        <p className="mt-2 text-sm text-slate-400">
          Add a label like VIP, Returning Client, Wedding, Urgent, or Lead.
        </p>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. VIP Client"
          className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
          autoFocus
        />

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-slate-300 hover:bg-white/[0.06]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="flex-1 rounded-2xl bg-cyan-400 px-4 py-3 font-black text-slate-950 hover:bg-cyan-300"
          >
            Save Label
          </button>
        </div>
      </div>
    </div>
  );
}