import { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock3,
  LogOut,
  Plus,
  Trash2,
  CalendarDays,
  Flag,
  Menu,
  Search,
  Filter,
  X,
  Pencil,
  AlertTriangle,
  UserCircle2,
  ChevronDown,
  ArrowUpDown,
  Sparkles,
  ListTodo,
  Moon,
  Sun,
  Waves,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const emptyForm = {
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
  deadline: "",
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [tasks, setTasks] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  const [isDesktop, setIsDesktop] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [createLoading, setCreateLoading] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

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
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowCreateModal(false);
        setEditingTask(null);
        setShowProfileDropdown(false);
        if (!deleteLoading) setDeleteTarget(null);
        if (!isDesktop) setShowSidebar(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDesktop, deleteLoading]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTasks = async () => {
    try {
      setPageLoading(true);
      const { data } = await API.get("/tasks");
      setTasks(data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === "Completed").length;
    const inProgress = tasks.filter((task) => task.status === "In Progress").length;
    const pending = tasks.filter((task) => task.status === "Pending").length;
    const overdue = tasks.filter((task) => isTaskOverdue(task)).length;

    return {
      total: tasks.length,
      completed,
      inProgress,
      pending,
      overdue,
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
      .slice(0, 6);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ? true : task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortBy === "deadline") {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      }

      if (sortBy === "priority") {
        const rank = { High: 0, Medium: 1, Low: 2 };
        return rank[a.priority] - rank[b.priority];
      }

      return 0;
    });

    return result;
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const payload = {
        ...form,
        deadline: form.deadline || null,
      };

      const { data } = await API.post("/tasks", payload);
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

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "Pending",
      priority: task.priority || "Medium",
      deadline: task.deadline ? formatDateForInput(task.deadline) : "",
    });
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!editingTask) return;

    setEditLoading(true);

    try {
      const payload = {
        ...editForm,
        deadline: editForm.deadline || null,
      };

      const { data } = await API.put(`/tasks/${editingTask._id}`, payload);

      setTasks((prev) =>
        prev.map((task) => (task._id === editingTask._id ? data : task))
      );

      setEditingTask(null);
      setEditForm(emptyForm);
      toast.success("Changes saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task");
    } finally {
      setEditLoading(false);
    }
  };

  const confirmDeleteTask = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await API.delete(`/tasks/${deleteTarget._id}`);
      setTasks((prev) => prev.filter((task) => task._id !== deleteTarget._id));
      toast.success("Task removed");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setStatusLoadingId(id);
      const { data } = await API.put(`/tasks/${id}`, { status: newStatus });
      setTasks((prev) => prev.map((task) => (task._id === id ? data : task)));
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update task");
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleQuickCreate = (status) => {
    setForm((prev) => ({ ...prev, status }));
    setShowCreateModal(true);
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

  return (
    <div className="min-h-screen p-4 md:p-6">
      <AnimatePresence>
        {pageLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
          >
            <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
              <ButtonSpinner size={18} />
              <span className="text-main font-medium">Loading dashboard...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <AnimatePresence>
          {showSidebar && (
            <>
              <motion.aside
                initial={{ x: -28, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -28, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`glass ${
                  isDesktop
                    ? "sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto"
                    : "fixed inset-y-4 left-4 z-40 overflow-y-auto"
                } w-[280px] rounded-[2rem] p-5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-cyan-400 to-amber-300 text-slate-950 font-black">
                      T
                    </div>
                    <div>
                      <h1 className="text-main text-xl font-bold">TaskFlow</h1>
                      <p className="text-soft text-sm">Productivity dashboard</p>
                    </div>
                  </div>

                  {!isDesktop && (
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="rounded-xl border border-white/10 p-2"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-muted-custom text-sm">Signed in as</p>
                  <h2 className="text-main mt-2 text-lg font-semibold">{user?.name}</h2>
                  <p className="text-soft text-sm">{user?.email}</p>
                </div>

                <nav className="mt-8 space-y-3">
                  <button className="flex w-full items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-left">
                    <LayoutDashboard size={18} />
                    Dashboard
                  </button>

                  <button
                    onClick={() => {
                      setShowCreateModal(true);
                      if (!isDesktop) setShowSidebar(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-white/10"
                  >
                    <Plus size={18} />
                    Add Task
                  </button>

                  <button
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {logoutLoading ? <ButtonSpinner size={16} /> : <LogOut size={18} />}
                    {logoutLoading ? "Logging out..." : "Logout"}
                  </button>
                </nav>

                <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-main text-lg font-bold">Overview</h3>
                      <p className="text-soft text-xs">Progress snapshot</p>
                    </div>
                    <Sparkles className="text-cyan-300" size={18} />
                  </div>

                  <div className="h-48">
                    {stats.total === 0 ? (
                      <div className="text-soft flex h-full items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 text-sm">
                        No chart data
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={4}
                          >
                            {chartData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="mt-3 grid gap-2">
                    {chartData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                      >
                        <span className="text-soft">{item.name}</span>
                        <span className="text-main font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-3xl bg-gradient-to-br from-violet-500/20 via-cyan-400/10 to-amber-300/20 p-4">
                  <p className="text-soft text-sm">Stay organized</p>
                  <h3 className="text-main mt-2 text-2xl font-black">Focus on what matters</h3>
                  <p className="text-soft mt-2 text-sm">
                    Keep your workflow clear and your progress visible.
                  </p>
                </div>
              </motion.aside>

              {!isDesktop && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSidebar(false)}
                  className="fixed inset-0 z-30 bg-black/40"
                />
              )}
            </>
          )}
        </AnimatePresence>

        <main className="space-y-6 lg:col-start-2">
          <div className="glass flex flex-col gap-4 rounded-[2rem] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              {!isDesktop && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="rounded-2xl border border-white/10 p-3"
                >
                  <Menu size={20} />
                </button>
              )}

              <div>
                <p className="text-sm text-cyan-300">Welcome back</p>
                <h2 className="text-main text-3xl font-black">Your task dashboard</h2>
                <p className="text-soft mt-1 text-sm">
                  Track work, manage deadlines, and stay in control.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleQuickCreate("Pending")}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/10"
              >
                Quick Pending
              </button>

              <button
                onClick={() => handleQuickCreate("In Progress")}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/10"
              >
                Quick In Progress
              </button>

              <div className="glass flex items-center gap-1 rounded-2xl p-2">
                <button
                  onClick={() => setTheme("dark")}
                  className={`rounded-xl p-2 transition ${theme === "dark" ? "bg-white/10" : ""}`}
                  title="Dark"
                >
                  <Moon size={18} />
                </button>
                <button
                  onClick={() => setTheme("ocean")}
                  className={`rounded-xl p-2 transition ${theme === "ocean" ? "bg-white/10" : ""}`}
                  title="Ocean"
                >
                  <Waves size={18} />
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className={`rounded-xl p-2 transition ${theme === "light" ? "bg-white/10" : ""}`}
                  title="Light"
                >
                  <Sun size={18} />
                </button>
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileDropdown((prev) => !prev)}
                  className="glass flex items-center gap-3 rounded-2xl px-4 py-3"
                >
                  <UserCircle2 size={20} />
                  <span className="hidden sm:inline">{user?.name}</span>
                  <ChevronDown size={16} />
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="glass absolute right-0 top-14 z-30 w-56 rounded-2xl p-2"
                    >
                      <div className="rounded-2xl px-3 py-3">
                        <p className="text-main font-semibold">{user?.name}</p>
                        <p className="text-soft text-sm">{user?.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          handleLogout();
                        }}
                        disabled={logoutLoading}
                        className="flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-left transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {logoutLoading ? <ButtonSpinner size={16} /> : <LogOut size={16} />}
                        {logoutLoading ? "Logging out..." : "Logout"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-5 py-3 font-semibold text-white shadow-lg"
              >
                <Plus size={18} />
                New Task
              </button>
            </div>
          </div>

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Total Tasks" value={stats.total} icon={LayoutDashboard} />
            <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} />
            <StatCard title="In Progress" value={stats.inProgress} icon={Clock3} />
            <StatCard title="Pending" value={stats.pending} icon={Flag} />
            <StatCard title="Overdue" value={stats.overdue} icon={AlertTriangle} />
          </section>

          <section className="glass rounded-[2rem] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-main text-2xl font-bold">Upcoming Focus</h3>
                <p className="text-soft text-sm">Tasks needing attention</p>
              </div>
              <ListTodo className="text-cyan-300" size={20} />
            </div>

            {urgentTasks.length === 0 ? (
              <div className="text-soft rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-center">
                No urgent tasks right now
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {urgentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-main font-semibold">{task.title}</p>
                      <DueBadge task={task} />
                    </div>
                    <p className="text-soft mt-2 text-sm">
                      {task.deadline ? formatFriendlyDate(task.deadline) : "No deadline"}
                    </p>
                    <p className="text-soft mt-2 text-sm">
                      {task.description || "No description provided."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="glass rounded-[2rem] p-5">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-main text-2xl font-bold">My Tasks</h3>
                <p className="text-soft text-sm">Search, filter, sort, and manage</p>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="relative">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-modern w-full rounded-2xl py-3 pl-10 pr-4 outline-none"
                  />
                </div>

                <div className="relative">
                  <Filter
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-modern w-full rounded-2xl py-3 pl-10 pr-4 outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="input-modern w-full rounded-2xl px-4 py-3 outline-none"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>

                <div className="relative">
                  <ArrowUpDown
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-modern w-full rounded-2xl py-3 pl-10 pr-4 outline-none"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="deadline">Deadline</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>
              </div>
            </div>

            {pageLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <TaskSkeleton key={index} />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <BetterEmptyState
                hasAnyTasks={tasks.length > 0}
                onCreate={() => setShowCreateModal(true)}
              />
            ) : (
              <div className="grid gap-4">
                {filteredTasks.map((task, index) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-main text-xl font-bold">{task.title}</h4>
                          <StatusBadge status={task.status} />
                          <PriorityBadge priority={task.priority} />
                          <DueBadge task={task} />
                        </div>

                        <p className="text-soft mt-3">
                          {task.description || "No description provided."}
                        </p>

                        <div className="text-soft mt-4 flex flex-wrap items-center gap-4 text-sm">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={16} />
                            {task.deadline
                              ? formatFriendlyDate(task.deadline)
                              : "No deadline"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                          <select
                            value={task.status}
                            disabled={statusLoadingId === task._id}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className="input-modern rounded-2xl px-4 py-2 pr-10 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>

                          {statusLoadingId === task._id && (
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                              <ButtonSpinner size={14} />
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => openEditModal(task)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500/15 px-4 py-2 text-cyan-300 transition hover:bg-cyan-500/25"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <button
                          onClick={() => setDeleteTarget(task)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-red-500/15 px-4 py-2 text-red-300 transition hover:bg-red-500/25"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <TaskModal
        open={showCreateModal}
        title="Create Task"
        form={form}
        setForm={setForm}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
        loading={createLoading}
        submitText="Create Task"
      />

      <TaskModal
        open={!!editingTask}
        title="Edit Task"
        form={editForm}
        setForm={setEditForm}
        onClose={() => {
          setEditingTask(null);
          setEditForm(emptyForm);
        }}
        onSubmit={handleEditTask}
        loading={editLoading}
        submitText="Save Changes"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete task?"
        description={`This will permanently remove "${deleteTarget?.title || ""}".`}
        confirmText="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteTask}
        loading={deleteLoading}
      />
    </div>
  );
}

function TaskModal({
  open,
  title,
  form,
  setForm,
  onClose,
  onSubmit,
  loading,
  submitText,
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.98 }}
            className="glass w-full max-w-xl rounded-[2rem] p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-main text-2xl font-bold">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-xl border border-white/10 px-3 py-2"
              >
                Close
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-modern w-full rounded-2xl px-4 py-3 outline-none"
                required
              />

              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-modern min-h-[120px] w-full rounded-2xl px-4 py-3 outline-none"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="input-modern rounded-2xl px-4 py-3 outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="input-modern rounded-2xl px-4 py-3 outline-none"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>

              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="input-modern w-full rounded-2xl px-4 py-3 outline-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <ButtonSpinner />}
                {loading ? "Please wait..." : submitText}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  onClose,
  onConfirm,
  loading = false,
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.98 }}
            className="glass w-full max-w-md rounded-[2rem] p-6"
          >
            <h3 className="text-main text-2xl font-bold">{title}</h3>
            <p className="text-soft mt-3">{description}</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-2xl border border-white/10 px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500/20 px-4 py-3 font-semibold text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <ButtonSpinner size={14} />}
                {loading ? "Deleting..." : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="glass rounded-[1.75rem] p-5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
        <Icon className="text-cyan-300" size={22} />
      </div>
      <p className="text-soft text-sm">{title}</p>
      <h3 className="text-main mt-2 text-4xl font-black">{value}</h3>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-amber-500/20 text-amber-300",
    "In Progress": "bg-cyan-500/20 text-cyan-300",
    Completed: "bg-emerald-500/20 text-emerald-300",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    Low: "bg-sky-500/20 text-sky-300 border border-sky-400/20",
    Medium: "bg-violet-500/20 text-violet-300 border border-violet-400/20",
    High: "bg-rose-500/20 text-rose-300 border border-rose-400/20",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[priority]}`}>
      {priority} Priority
    </span>
  );
}

function DueBadge({ task }) {
  if (!task.deadline || task.status === "Completed") return null;

  if (isTaskOverdue(task)) {
    return (
      <span className="rounded-full border border-red-400/20 bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300">
        Overdue
      </span>
    );
  }

  if (isTaskDueSoon(task)) {
    return (
      <span className="rounded-full border border-amber-400/20 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
        Due Soon
      </span>
    );
  }

  return null;
}

function ButtonSpinner({ size = 16 }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-white/30 border-t-white"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

function TaskSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 h-5 w-40 rounded bg-white/10" />
      <div className="mb-3 h-4 w-full rounded bg-white/10" />
      <div className="mb-3 h-4 w-3/4 rounded bg-white/10" />
      <div className="h-10 w-48 rounded bg-white/10" />
    </div>
  );
}

function BetterEmptyState({ hasAnyTasks, onCreate }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/10">
        <LayoutDashboard size={34} className="text-cyan-300" />
      </div>

      {hasAnyTasks ? (
        <>
          <p className="text-main mt-5 text-xl font-semibold">No matching tasks found</p>
          <p className="text-soft mt-2">
            Try changing your search or filter options.
          </p>
        </>
      ) : (
        <>
          <p className="text-main mt-5 text-xl font-semibold">No tasks yet</p>
          <p className="text-soft mt-2">
            Create your first task and start building momentum.
          </p>
          <button
            onClick={onCreate}
            className="mt-5 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 font-semibold text-white"
          >
            Add First Task
          </button>
        </>
      )}
    </div>
  );
}

function isTaskOverdue(task) {
  if (!task.deadline || task.status === "Completed") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(task.deadline);
  deadline.setHours(0, 0, 0, 0);

  return deadline < today;
}

function isTaskDueSoon(task) {
  if (!task.deadline || task.status === "Completed") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(task.deadline);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays >= 0 && diffDays <= 2;
}

function formatDateForInput(dateValue) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatFriendlyDate(dateValue) {
  const date = new Date(dateValue);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}