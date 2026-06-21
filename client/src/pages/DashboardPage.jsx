import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  Flag,
  Grid2X2,
  ListTodo,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsGrid from "../components/dashboard/StatsGrid";
import RightPanel from "../components/dashboard/RightPanel";
import TaskTable from "../components/dashboard/TaskTable";
import AiInsightCard from "../components/dashboard/AiInsightCard";
import CreateTaskModal from "../components/dashboard/CreateTaskModal";
import MemoryAIPopup from "../components/dashboard/MemoryAIPopup";

import {
  isTaskOverdue,
  isTaskDueSoon,
} from "../components/dashboard/TaskUtils";

const emptyForm = {
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
  deadline: "",
};

const statItems = [
  { key: "total", label: "Total Tasks", icon: Grid2X2 },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
  { key: "inProgress", label: "In Progress", icon: Clock },
  { key: "pending", label: "Pending", icon: Flag },
  { key: "overdue", label: "Overdue", icon: Bell },
];

export default function DashboardPage() {
  const { user, logout, plan, trialEndsAt } = useAuth();
  const { theme, setTheme } = useTheme();

  const isLight = theme === "light";

  const [tasks, setTasks] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [createLoading, setCreateLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setShowSidebar(desktop);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setPageLoading(true);
        const { data } = await API.get("/tasks");
        setTasks(data || []);
      } catch {
        toast.error("Failed to load tasks");
      } finally {
        setPageLoading(false);
      }
    };

    loadTasks();
  }, []);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter((task) => task.status === "Completed").length,
      inProgress: tasks.filter((task) => task.status === "In Progress").length,
      pending: tasks.filter((task) => task.status === "Pending").length,
      overdue: tasks.filter((task) => isTaskOverdue(task)).length,
    };
  }, [tasks]);

  const chartData = useMemo(
    () => [
      { name: "Completed", value: stats.completed, color: "#22c55e" },
      { name: "In Progress", value: stats.inProgress, color: "#06b6d4" },
      { name: "Pending", value: stats.pending, color: "#f59e0b" },
    ],
    [stats]
  );

  const urgentTasks = useMemo(() => {
    return tasks
      .filter((task) => isTaskOverdue(task) || isTaskDueSoon(task))
      .slice(0, 5);
  }, [tasks]);

  const recentTasks = useMemo(() => tasks.slice(0, 5), [tasks]);

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

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await Promise.resolve(logout());
      toast.success("Logged out");
    } finally {
      setLogoutLoading(false);
    }
  };

  const sidebar = (
    <AnimatePresence>
      {showSidebar && (
        <>
          {!isDesktop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
          )}

          <DashboardSidebar
            isDesktop={isDesktop}
            setShowSidebar={setShowSidebar}
            user={user}
            plan={plan}
            trialEndsAt={trialEndsAt}
            handleLogout={handleLogout}
            logoutLoading={logoutLoading}
            setShowCreateModal={setShowCreateModal}
            stats={stats}
            chartData={chartData}
            theme={theme}
            isLight={isLight}
          />
        </>
      )}
    </AnimatePresence>
  );

  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        {sidebar}

        <main className="mx-auto min-h-screen max-w-md overflow-hidden px-5 pb-28 pt-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowSidebar(true)}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"
            >
              <Menu size={22} />
            </button>

            <div className="text-center">
              <h1 className="text-lg font-black">Dashboard</h1>
              <p className="text-xs text-slate-400">TaskFlow</p>
            </div>

            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"
            >
              <Bell size={20} />
            </button>
          </div>

          <section className="mt-7">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-xl font-black">
                T
              </div>

              <div>
                <h2 className="text-2xl font-black">TaskFlow</h2>
                <p className="text-sm text-slate-400">by AEMA Systems</p>
              </div>
            </div>

            <p className="mt-7 text-sm font-bold text-cyan-300">
              Welcome back
            </p>

            <div className="mt-2 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-4xl font-black tracking-tight">
                  Dashboard
                </h3>
                <p className="mt-2 max-w-[260px] text-base leading-6 text-slate-400">
                  Manage tasks, bookings, contacts and follow-ups.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-cyan-300"
              >
                ✦
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-4 text-base font-black text-white shadow-lg shadow-cyan-500/20"
            >
              <Plus size={20} />
              New Task
            </button>
          </section>

          <TaskTable tasks={tasks} setTasks={setTasks} pageLoading={pageLoading} />

          <div className="relative mt-6">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              placeholder="Search anything..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-4 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <section className="mt-6 grid grid-cols-2 gap-4">
            {statItems.slice(0, 4).map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <Icon size={22} />
                  </div>

                  <p className="mt-5 text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-4xl font-black">
                    {stats[item.key]}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <Sparkles size={22} />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-black">AI Insight</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  You have {stats.overdue} overdue task(s) and{" "}
                  {urgentTasks.length} item(s) needing attention.
                </p>
              </div>

              <span className="text-2xl text-slate-500">›</span>
            </div>
          </section>

          <section className="mt-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black">Your Tasks</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Manage your recent work and deadlines.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05]"
                  >
                    <SlidersHorizontal size={18} />
                  </button>

                  <button
                    type="button"
                    className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05]"
                  >
                    ⇅
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {pageLoading ? (
                  <p className="py-8 text-center text-slate-400">
                    Loading tasks...
                  </p>
                ) : recentTasks.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">
                    No tasks yet.
                  </p>
                ) : (
                  recentTasks.map((task) => (
                    <div
                      key={task._id || task.id}
                      className="relative rounded-3xl border border-white/10 bg-[#081120] p-5"
                    >
                      <div
                        className={`absolute bottom-5 left-0 top-5 w-1 rounded-full ${
                          task.priority === "High"
                            ? "bg-rose-400"
                            : task.priority === "Low"
                            ? "bg-cyan-400"
                            : "bg-yellow-400"
                        }`}
                      />

                      <div className="flex items-start justify-between gap-3 pl-3">
                        <div>
                          <h4 className="font-black leading-6">
                            {task.title}
                          </h4>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                            {task.description || "No description"}
                          </p>
                        </div>

                        <MoreHorizontal
                          size={20}
                          className="shrink-0 text-slate-500"
                        />
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3 pl-3">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <CalendarDays size={15} />
                          {task.deadline
                            ? new Date(task.deadline).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "No date"}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              task.status === "Completed"
                                ? "bg-emerald-400/15 text-emerald-300"
                                : task.status === "In Progress"
                                ? "bg-amber-400/15 text-amber-300"
                                : "bg-slate-400/15 text-slate-300"
                            }`}
                          >
                            {task.status}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              task.priority === "High"
                                ? "bg-rose-400/15 text-rose-300"
                                : task.priority === "Low"
                                ? "bg-cyan-400/15 text-cyan-300"
                                : "bg-amber-400/15 text-amber-300"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#07101f]/95 px-5 pb-5 pt-3 backdrop-blur-xl">
          <div className="mx-auto grid max-w-md grid-cols-5 text-xs font-bold text-slate-400">
            <Link
              to="/dashboard"
              className="flex flex-col items-center gap-1 text-cyan-300"
            >
              <Grid2X2 size={22} />
              Dashboard
            </Link>

            <Link to="/tasks" className="flex flex-col items-center gap-1">
              <ListTodo size={22} />
              Tasks
            </Link>

            <Link to="/bookings" className="flex flex-col items-center gap-1">
              <CalendarDays size={22} />
              Bookings
            </Link>

            <Link to="/contacts" className="flex flex-col items-center gap-1">
              <Users size={22} />
              Contacts
            </Link>

            <button
              type="button"
              onClick={() => setShowSidebar(true)}
              className="flex flex-col items-center gap-1"
            >
              <MoreHorizontal size={22} />
              More
            </button>
          </div>
        </nav>

        <CreateTaskModal
          open={showCreateModal}
          form={form}
          setForm={setForm}
          onSubmit={handleCreateTask}
          onClose={() => setShowCreateModal(false)}
          loading={createLoading}
          isLight={isLight}
          theme={theme}
        />

        <MemoryAIPopup />
      </div>
    );
  }

  return (
    <DashboardLayout
      sidebar={sidebar}
      rightPanel={<RightPanel stats={stats} theme={theme} isLight={isLight} />}
    >
      <DashboardHeader
        isDesktop={isDesktop}
        setShowSidebar={setShowSidebar}
        theme={theme}
        setTheme={setTheme}
        profileRef={profileRef}
        showProfileDropdown={showProfileDropdown}
        setShowProfileDropdown={setShowProfileDropdown}
        user={user}
        handleLogout={handleLogout}
        logoutLoading={logoutLoading}
        setShowCreateModal={setShowCreateModal}
      />

      <StatsGrid stats={stats} theme={theme} isLight={isLight} />

      <AiInsightCard
        overdueCount={stats.overdue}
        urgentCount={urgentTasks.length}
        isLight={isLight}
        theme={theme}
      />

      <TaskTable
        tasks={tasks}
        setTasks={setTasks}
        pageLoading={pageLoading}
        theme={theme}
        isLight={isLight}
      />

      <CreateTaskModal
        open={showCreateModal}
        form={form}
        setForm={setForm}
        onSubmit={handleCreateTask}
        onClose={() => setShowCreateModal(false)}
        loading={createLoading}
        isLight={isLight}
        theme={theme}
      />

      <MemoryAIPopup />
    </DashboardLayout>
  );
}