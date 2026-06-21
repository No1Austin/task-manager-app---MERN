import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  MoreVertical,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  RotateCcw,
} from "lucide-react";

import API from "../../services/api";
import { formatFriendlyDate } from "./TaskUtils";

export default function TaskTable({ tasks, setTasks, pageLoading }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [menuState, setMenuState] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const openSmartMenu = (event, task) => {
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    const menuHeight = 260;
    const menuWidth = 240;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight;

    setMenuState({
      task,
      top: openUp ? rect.top - menuHeight - 8 : rect.bottom + 8,
      left: Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12),
    });
  };

  const closeMenu = () => setMenuState(null);

  const updateTaskStatus = async (task, status) => {
    const id = task._id || task.id;

    const updatedTask = { ...task, status };

    try {
      let response;

      try {
        response = await API.patch(`/tasks/${id}`, updatedTask);
      } catch {
        response = await API.put(`/tasks/${id}`, updatedTask);
      }

      const savedTask = response?.data || updatedTask;

      setTasks((prev) =>
        prev.map((item) =>
          (item._id || item.id) === id
            ? { ...item, ...savedTask, status }
            : item
        )
      );

      toast.success(`Task moved to ${status}`);
      closeMenu();
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (task) => {
    const id = task._id || task.id;

    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await API.delete(`/tasks/${id}`);

      setTasks((prev) => prev.filter((item) => (item._id || item.id) !== id));

      toast.success("Task deleted");
      closeMenu();
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  const visibleTasks = useMemo(() => {
    let result = [...tasks];

    if (statusFilter !== "All") {
      result = result.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== "All") {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt || b.created_at || 0) -
          new Date(a.createdAt || a.created_at || 0)
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.createdAt || a.created_at || 0) -
          new Date(b.createdAt || b.created_at || 0)
        );
      }

      if (sortBy === "deadline") {
        return (
          new Date(a.deadline || "9999-12-31") -
          new Date(b.deadline || "9999-12-31")
        );
      }

      if (sortBy === "priority") {
        const order = { High: 1, Medium: 2, Low: 3 };
        return (order[a.priority] || 4) - (order[b.priority] || 4);
      }

      return 0;
    });

    return result.slice(0, 8);
  }, [tasks, statusFilter, priorityFilter, sortBy]);

  return (
    <>
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {menuState && (
        <button
          type="button"
          onClick={closeMenu}
          className="fixed inset-0 z-[9998] cursor-default bg-transparent"
        />
      )}

      {menuState && (
        <ActionMenu
          task={menuState.task}
          top={menuState.top}
          left={menuState.left}
          updateTaskStatus={updateTaskStatus}
          deleteTask={deleteTask}
          setSelectedTask={setSelectedTask}
          closeMenu={closeMenu}
        />
      )}

      <section className="relative rounded-3xl border border-white/10 bg-[#111827]/80 p-4 shadow-lg md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-black text-white">Your Tasks</h3>
            <p className="mt-1 text-sm text-slate-400">
              Manage your recent work and deadlines.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 md:flex">
  <Link
    to="/tasks"
    className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300"
  >
    Expand
  </Link>

  <button
    type="button"
    onClick={() => {
      setShowFilters((prev) => !prev);
      setShowSort(false);
      closeMenu();
    }}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/[0.08]"
  >
    <Filter size={16} />
    Filter
  </button>

  <button
    type="button"
    onClick={() => {
      setShowSort((prev) => !prev);
      setShowFilters(false);
      closeMenu();
    }}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/[0.08]"
  >
    <ArrowUpDown size={16} />
    Sort
  </button>
</div>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:grid-cols-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none"
            >
              <option>All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none"
            >
              <option>All</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        )}

        {showSort && (
          <div className="mt-4 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["newest", "Newest"],
              ["oldest", "Oldest"],
              ["deadline", "Due Date"],
              ["priority", "Priority"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => setSortBy(value)}
                className={`rounded-xl px-4 py-3 text-sm font-bold ${
                  sortBy === value
                    ? "bg-cyan-400 text-slate-950"
                    : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 hidden overflow-x-auto md:block">
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
              ) : visibleTasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                visibleTasks.map((task) => (
                  <TaskRow
                    key={task._id || task.id}
                    task={task}
                    openSmartMenu={openSmartMenu}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 space-y-3 md:hidden">
          {pageLoading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center text-slate-400">
              Loading tasks...
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center text-slate-400">
              No tasks found.
            </div>
          ) : (
            visibleTasks.map((task) => (
              <MobileTaskCard
                key={task._id || task.id}
                task={task}
                openSmartMenu={openSmartMenu}
              />
            ))
          )}
        </div>
      </section>
    </>
  );
}

function TaskRow({ task, openSmartMenu }) {
  return (
    <tr className="border-b border-white/5 transition hover:bg-white/[0.03]">
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
          {task.deadline ? formatFriendlyDate(task.deadline) : "No deadline"}
        </span>
      </td>

      <td className="py-4 pr-4">
        <PriorityPill priority={task.priority} />
      </td>

      <td className="py-4 text-right">
        <button
          type="button"
          onClick={(event) => openSmartMenu(event, task)}
          className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <MoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
}

function MobileTaskCard({ task, openSmartMenu }) {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#081120] p-4">
      <div
        className={`absolute bottom-4 left-0 top-4 w-1 rounded-full ${
          task.priority === "High"
            ? "bg-red-400"
            : task.priority === "Medium"
            ? "bg-amber-400"
            : "bg-cyan-400"
        }`}
      />

      <div className="flex items-start justify-between gap-3 pl-3">
        <div className="min-w-0">
          <h4 className="text-base font-black text-white">{task.title}</h4>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
            {task.description || "No description"}
          </p>
        </div>

        <button
          type="button"
          onClick={(event) => openSmartMenu(event, task)}
          className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 pl-3 text-sm text-slate-300">
        <CalendarDays size={15} />
        {task.deadline ? formatFriendlyDate(task.deadline) : "No deadline"}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 pl-3">
        <StatusPill status={task.status} />
        <PriorityPill priority={task.priority} />
      </div>
    </div>
  );
}

function ActionMenu({
  task,
  top,
  left,
  updateTaskStatus,
  deleteTask,
  setSelectedTask,
  closeMenu,
}) {
  return (
    <div
      className="fixed z-[9999] w-60 rounded-3xl border border-white/10 bg-[#020617] p-2 shadow-2xl shadow-black/60"
      style={{ top, left }}
    >
      <button
        type="button"
        onClick={() => updateTaskStatus(task, "Completed")}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/[0.06]"
      >
        <CheckCircle2 size={18} />
        Mark Complete
      </button>

      <button
        type="button"
        onClick={() => updateTaskStatus(task, "In Progress")}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/[0.06]"
      >
        <Clock size={18} />
        Move Progress
      </button>

      <button
        type="button"
        onClick={() => updateTaskStatus(task, "Pending")}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/[0.06]"
      >
        <RotateCcw size={18} />
        Move Pending
      </button>

      <button
        type="button"
        onClick={() => {
          setSelectedTask(task);
          closeMenu();
        }}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-white/[0.06]"
      >
        <Eye size={18} />
        View Details
      </button>

      <button
        type="button"
        onClick={() => deleteTask(task)}
        className="mt-1 flex w-full items-center gap-3 rounded-2xl bg-red-500/10 px-4 py-3 text-left text-sm font-semibold text-red-300 hover:bg-red-500/15"
      >
        <Trash2 size={18} />
        Delete Task
      </button>
    </div>
  );
}

function TaskDetailsModal({ task, onClose }) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#020617] p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              Task Details
            </p>

            <h2 className="mt-3 text-2xl font-black">
              {task.title || "Untitled Task"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.08]"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <DetailItem
            label="Description"
            value={task.description || "No description"}
          />

          <DetailItem label="Status" value={task.status || "Pending"} />

          <DetailItem label="Priority" value={task.priority || "Medium"} />

          <DetailItem
            label="Deadline"
            value={
              task.deadline ? formatFriendlyDate(task.deadline) : "No deadline"
            }
          />

          <DetailItem
            label="Created"
            value={
              task.createdAt || task.created_at
                ? formatFriendlyDate(task.createdAt || task.created_at)
                : "Not available"
            }
          />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const styles = {
    Pending: "bg-blue-500/15 text-blue-300",
    "In Progress": "bg-amber-500/15 text-amber-300",
    Completed: "bg-emerald-500/15 text-emerald-300",
  };

  return (
    <span
      className={`rounded-lg px-3 py-1 text-xs font-bold ${
        styles[status] || "bg-slate-500/15 text-slate-300"
      }`}
    >
      {status || "Pending"}
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
    <span
      className={`rounded-lg px-3 py-1 text-xs font-bold ${
        styles[priority] || "bg-slate-500/15 text-slate-300"
      }`}
    >
      {priority || "Medium"}
    </span>
  );
}