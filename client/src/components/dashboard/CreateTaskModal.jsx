export default function CreateTaskModal({
  open,
  form,
  setForm,
  onSubmit,
  onClose,
  loading,
  isLight,
}) {
  if (!open) return null;

  const inputClass = isLight
    ? "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400"
    : "w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className={
          isLight
            ? "w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl"
            : "w-full max-w-xl rounded-3xl border border-white/10 bg-[#111827] p-6 text-white shadow-2xl"
        }
      >
        <div className="mb-6">
          <h3 className="text-2xl font-black">Create Task</h3>
          <p className={isLight ? "mt-1 text-sm text-slate-500" : "mt-1 text-sm text-slate-400"}>
            Add a new task, deadline and priority.
          </p>
        </div>

        <input
          type="text"
          placeholder="Task title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputClass}
          required
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`${inputClass} mt-4 min-h-[120px]`}
        />

        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className={`${inputClass} mt-4`}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
          className={`${inputClass} mt-4`}
        >
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>

        <input
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          className={`${inputClass} mt-4`}
        />

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className={
              isLight
                ? "flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-50"
                : "flex-1 rounded-2xl border border-white/10 px-4 py-3 text-slate-300 hover:bg-white/[0.06]"
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}