import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flag,
  Grid2X2,
  ListTodo,
  Plus,
  Search,
} from "lucide-react";

import API from "../services/api";
import TaskTable from "../components/dashboard/TaskTable";
import CreateTaskModal from "../components/dashboard/CreateTaskModal";
import { isTaskOverdue } from "../components/dashboard/TaskUtils";

const emptyForm = {
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
  deadline: "",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setPageLoading(true);
        const { data } = await API.get("/tasks");
        setTasks(data || []);
      } catch (error) {
        console.error("Failed to load tasks:", error);
        toast.error("Failed to load tasks");
      } finally {
        setPageLoading(false);
      }
    };

    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return tasks;

    return tasks.filter((task) =>
      [
        task.title,
        task.description,
        task.status,
        task.priority,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [tasks, search]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter((task) => task.status === "Completed").length,
      inProgress: tasks.filter((task) => task.status === "In Progress").length,
      pending: tasks.filter((task) => task.status === "Pending").length,
      overdue: tasks.filter((task) => isTaskOverdue(task)).length,
    };
  }, [tasks]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const { data } = await API.post("/tasks", {
        ...form,
        deadline: form.deadline || null,
      });

      setTasks((prev) => [data, ...prev]);
      setForm(emptyForm);
      setShowCreateModal(false);
      toast.success("Task created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#0e749030,transparent_30%),radial-gradient(circle_at_top_right,#7c3aed30,transparent_30%),linear-gradient(135deg,#020617,#0f172a,#020617)] px-4 py-5 text-white md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-[#111827]/80 p-4 shadow-2xl md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/[0.08]"
              >
                <ArrowLeft size={17} />
                Back to Dashboard
              </Link>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
                TaskFlow Tasks
              </p>

              <h1 className="mt-3 text-4xl font-black">Tasks</h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
                Expanded task workspace for managing all tasks, follow-ups,
                deadlines, priorities and progress.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-cyan-500/20"
            >
              <Plus size={18} />
              New Task
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
            <TaskStat icon={Grid2X2} label="Total" value={stats.total} />
            <TaskStat
              icon={CheckCircle2}
              label="Completed"
              value={stats.completed}
              tone="green"
            />
            <TaskStat
              icon={Clock}
              label="In Progress"
              value={stats.inProgress}
              tone="cyan"
            />
            <TaskStat
              icon={Flag}
              label="Pending"
              value={stats.pending}
              tone="amber"
            />
            <TaskStat
              icon={ListTodo}
              label="Overdue"
              value={stats.overdue}
              tone="rose"
            />
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-3 md:p-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full rounded-2xl border border-white/10 bg-[#020617] py-4 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
              />
            </div>
          </div>

          <div className="mt-6">
            <TaskTable
              tasks={filteredTasks}
              setTasks={setTasks}
              pageLoading={pageLoading}
            />
          </div>
        </div>
      </div>

      <CreateTaskModal
        open={showCreateModal}
        form={form}
        setForm={setForm}
        onSubmit={handleCreateTask}
        onClose={() => setShowCreateModal(false)}
        loading={createLoading}
        isLight={false}
        theme="dark"
      />
    </div>
  );
}

function TaskStat({ icon: Icon, label, value, tone = "cyan" }) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-400/10 text-emerald-300"
      : tone === "amber"
      ? "bg-amber-400/10 text-amber-300"
      : tone === "rose"
      ? "bg-rose-400/10 text-rose-300"
      : "bg-cyan-400/10 text-cyan-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 md:rounded-3xl md:p-5">
      <div className="flex items-center gap-3 md:block">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl md:mb-4 md:h-11 md:w-11 md:rounded-2xl ${toneClass}`}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-400 md:text-sm">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black text-white md:text-3xl">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}