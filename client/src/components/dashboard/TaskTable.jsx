import { CalendarDays, MoreVertical, Filter, ArrowUpDown } from "lucide-react";
import { formatFriendlyDate } from "./TaskUtils";

export default function TaskTable({ tasks, pageLoading }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827]/80 p-5 shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-black text-white">Your Tasks</h3>
          <p className="mt-1 text-sm text-slate-400">
            Manage your recent work and deadlines.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.08]">
            <Filter size={16} />
            Filter
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.08]">
            <ArrowUpDown size={16} />
            Sort
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-white/10 text-slate-400">
            <tr>
              <th className="py-3 font-medium">Task</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Due Date</th>
              <th className="py-3 font-medium">Priority</th>
              <th className="py-3 font-medium"></th>
            </tr>
          </thead>

          <tbody>
            {pageLoading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400">
                  Loading tasks...
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400">
                  No tasks yet.
                </td>
              </tr>
            ) : (
              tasks.slice(0, 8).map((task) => (
                <tr
                  key={task._id}
                  className="border-b border-white/5 transition hover:bg-white/[0.03]"
                >
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-white">{task.title}</p>
                    <p className="mt-1 max-w-md truncate text-xs text-slate-400">
                      {task.description || "No description"}
                    </p>
                  </td>

                  <td className="py-4 pr-4">
                    <StatusPill status={task.status} />
                  </td>

                  <td className="py-4 pr-4 text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={15} />
                      {task.deadline
                        ? formatFriendlyDate(task.deadline)
                        : "No deadline"}
                    </span>
                  </td>

                  <td className="py-4 pr-4">
                    <PriorityPill priority={task.priority} />
                  </td>

                  <td className="py-4 text-right">
                    <button className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusPill({ status }) {
  const styles = {
    Pending: "bg-blue-500/15 text-blue-300",
    "In Progress": "bg-amber-500/15 text-amber-300",
    Completed: "bg-emerald-500/15 text-emerald-300",
  };

  return (
    <span className={`rounded-lg px-3 py-1 text-xs font-bold ${styles[status] || ""}`}>
      {status}
    </span>
  );
}

function PriorityPill({ priority }) {
  const styles = {
    Low: "bg-sky-500/15 text-sky-300",
    Medium: "bg-amber-500/15 text-amber-300",
    High: "bg-red-500/15 text-red-300",
  };

  return (
    <span className={`rounded-lg px-3 py-1 text-xs font-bold ${styles[priority] || ""}`}>
      {priority}
    </span>
  );
}