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
  X,
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
import CreateTaskModal from "../components/dashboard/CreateTaskModal";

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
  { key: "total", label: "Total", icon: Grid2X2 },
  { key: "completed", label: "Done", icon: CheckCircle2 },
  { key: "inProgress", label: "Active", icon: Clock },
  { key: "pending", label: "Pending", icon: Flag },
  { key: "overdue", label: "Overdue", icon: Bell },
];

const emptyIntelligence = {
  followUps: 0,
  inactiveCustomers: 0,
  oneTimeCustomers: 0,
  vipCustomers: 0,
  bookingsToday: 0,
};

export default function DashboardPage() {
  const { user, logout, plan, trialEndsAt } = useAuth();
  const { theme, setTheme } = useTheme();

  const isLight = theme === "light";

  const [tasks, setTasks] = useState([]);
  const [intelligence, setIntelligence] = useState(emptyIntelligence);

  const [pageLoading, setPageLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
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

      if (desktop) {
        setShowMobileNav(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      const { data } = await API.get("/tasks");
      setTasks(data || []);
    };

    const loadBookingsIntelligence = async () => {
      try {
        const { data } = await API.get("/bookings/my-bookings");
        const bookings = data || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookingMap = {};

        bookings
          .filter((booking) => booking.status !== "cancelled")
          .forEach((booking) => {
            const key =
              booking.customer_email ||
              booking.customer_phone ||
              booking.customer_name ||
              booking.contact_id ||
              booking.id;

            if (!bookingMap[key]) {
              bookingMap[key] = [];
            }

            bookingMap[key].push(booking);
          });

        const customerGroups = Object.values(bookingMap);

        const oneTimeCustomers = customerGroups.filter(
          (customerBookings) => customerBookings.length === 1
        ).length;

        const vipCustomers = customerGroups.filter(
          (customerBookings) => customerBookings.length >= 3
        ).length;

        const inactiveCustomers = customerGroups.filter((customerBookings) => {
          const latestBooking = customerBookings
            .map((booking) => new Date(booking.booking_date || booking.created_at))
            .filter((date) => !Number.isNaN(date.getTime()))
            .sort((a, b) => b.getTime() - a.getTime())[0];

          if (!latestBooking) return false;

          latestBooking.setHours(0, 0, 0, 0);

          const diffDays =
            (today.getTime() - latestBooking.getTime()) /
            (1000 * 60 * 60 * 24);

          return diffDays >= 14;
        }).length;

        const bookingsToday = bookings.filter((booking) => {
          const bookingDate = new Date(booking.booking_date || booking.created_at);

          if (Number.isNaN(bookingDate.getTime())) return false;

          bookingDate.setHours(0, 0, 0, 0);

          return bookingDate.getTime() === today.getTime();
        }).length;

        setIntelligence({
          followUps: inactiveCustomers,
          inactiveCustomers,
          oneTimeCustomers,
          vipCustomers,
          bookingsToday,
        });
      } catch (error) {
        console.error("Failed to load booking intelligence:", error);
        setIntelligence(emptyIntelligence);
      }
    };

    const loadDashboardData = async () => {
      try {
        setPageLoading(true);

        await Promise.all([loadTasks(), loadBookingsIntelligence()]);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setPageLoading(false);
      }
    };

    loadDashboardData();
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

  const scrollToMobileTasks = () => {
    document.getElementById("mobile-tasks")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

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

        <main className="mx-auto min-h-screen max-w-md overflow-hidden px-4 pb-28 pt-4">
          <div className="sticky top-0 z-30 -mx-4 border-b border-white/10 bg-[#030712]/95 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowMobileNav((prev) => !prev)}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"
              >
                {showMobileNav ? <X size={22} /> : <Menu size={22} />}
              </button>

              <div className="text-center">
                <h1 className="text-base font-black">TaskFlow</h1>
                <p className="text-xs text-slate-400">Dashboard</p>
              </div>

              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"
              >
                <Bell size={20} />
              </button>
            </div>

            <AnimatePresence>
              {showMobileNav && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 rounded-3xl border border-white/10 bg-[#081120] p-3 shadow-2xl"
                >
                  <div className="grid grid-cols-2 gap-2 text-sm font-bold">
                    <Link
                      to="/dashboard"
                      onClick={() => setShowMobileNav(false)}
                      className="rounded-2xl bg-cyan-400/10 px-4 py-3 text-cyan-300"
                    >
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileNav(false);
                        scrollToMobileTasks();
                      }}
                      className="rounded-2xl bg-white/[0.05] px-4 py-3 text-left text-slate-300"
                    >
                      Tasks
                    </button>

                    <Link
                      to="/bookings"
                      onClick={() => setShowMobileNav(false)}
                      className="rounded-2xl bg-white/[0.05] px-4 py-3 text-slate-300"
                    >
                      Bookings
                    </Link>

                    <Link
                      to="/contacts"
                      onClick={() => setShowMobileNav(false)}
                      className="rounded-2xl bg-white/[0.05] px-4 py-3 text-slate-300"
                    >
                      Contacts
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileNav(false);
                      setShowSidebar(true);
                    }}
                    className="mt-2 w-full rounded-2xl bg-white/[0.05] px-4 py-3 text-left text-sm font-bold text-slate-300"
                  >
                    More Settings
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <section className="mt-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-lg font-black">
                T
              </div>

              <div>
                <h2 className="text-2xl font-black">TaskFlow</h2>
                <p className="text-sm text-slate-400">by AEMA Systems</p>
              </div>
            </div>

            <p className="mt-5 text-sm font-bold text-cyan-300">
              Welcome back
            </p>

            <div className="mt-2 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-3xl font-black tracking-tight">
                  Dashboard
                </h3>
                <p className="mt-2 max-w-[260px] text-sm leading-6 text-slate-400">
                  Manage tasks, bookings, contacts and follow-ups.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-cyan-300"
              >
                ✦
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-cyan-500/20"
            >
              <Plus size={19} />
              New Task
            </button>
          </section>

          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">
                  Here is what needs attention
                </h3>
                <p className="text-xs text-slate-400">
                  Quick view of your work.
                </p>
              </div>

              <Sparkles size={20} className="text-cyan-300" />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {statItems.slice(0, 4).map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.key}
                    className="aspect-square rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 shadow-lg shadow-black/20"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
                      <Icon size={16} />
                    </div>

                    <p className="mt-2 truncate text-[10px] font-bold text-slate-400">
                      {item.label}
                    </p>

                    <p className="mt-1 text-2xl font-black leading-none">
                      {stats[item.key]}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-rose-400/10 bg-rose-400/10 p-3">
                <p className="text-xs font-bold text-rose-200">Overdue</p>
                <p className="mt-1 text-2xl font-black text-white">
                  {stats.overdue}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/10 p-3">
                <p className="text-xs font-bold text-cyan-200">Urgent</p>
                <p className="mt-1 text-2xl font-black text-white">
                  {urgentTasks.length}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-cyan-500/10 via-white/[0.03] to-violet-500/10 p-4 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
                  Business Intelligence
                </p>

                <h3 className="mt-2 text-xl font-black">
                  Today's Opportunities
                </h3>
              </div>

              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <Sparkles size={22} />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <InsightRow
                icon="⚠️"
                label="Overdue Tasks"
                value={stats.overdue}
              />

              <InsightRow
                icon="📞"
                label="Follow-Ups Needed"
                value={intelligence.followUps}
              />

              <InsightRow
                icon="🔄"
                label="One-Time Customers"
                value={intelligence.oneTimeCustomers}
              />

              <InsightRow
                icon="💤"
                label="Inactive Customers"
                value={intelligence.inactiveCustomers}
              />

              <InsightRow
                icon="⭐"
                label="VIP Customers"
                value={intelligence.vipCustomers}
              />

              <InsightRow
                icon="📅"
                label="Bookings Today"
                value={intelligence.bookingsToday}
              />
            </div>

            <Link
              to="/bookings"
              className="mt-4 flex w-full items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-200"
            >
              View Booking Intelligence
            </Link>
          </section>

          <div className="relative mt-5">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              placeholder="Search anything..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <section id="mobile-tasks" className="mt-5 scroll-mt-24">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black">Your Tasks</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Recent work and deadlines.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.05]"
                  >
                    <SlidersHorizontal size={17} />
                  </button>

                  <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.05]"
                  >
                    ⇅
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
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
                      className="relative rounded-2xl border border-white/10 bg-[#081120] p-4"
                    >
                      <div
                        className={`absolute bottom-4 left-0 top-4 w-1 rounded-full ${
                          task.priority === "High"
                            ? "bg-rose-400"
                            : task.priority === "Low"
                            ? "bg-cyan-400"
                            : "bg-yellow-400"
                        }`}
                      />

                      <div className="flex items-start justify-between gap-3 pl-3">
                        <div className="min-w-0">
                          <h4 className="truncate font-black leading-6">
                            {task.title}
                          </h4>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                            {task.description || "No description"}
                          </p>
                        </div>

                        <MoreHorizontal
                          size={19}
                          className="shrink-0 text-slate-500"
                        />
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 pl-3">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <CalendarDays size={14} />
                          {task.deadline
                            ? new Date(task.deadline).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "No date"}
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
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
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
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

        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#07101f]/95 px-4 pb-4 pt-3 backdrop-blur-xl">
          <div className="mx-auto grid max-w-md grid-cols-5 text-[10px] font-bold text-slate-400">
            <Link
              to="/dashboard"
              className="flex flex-col items-center gap-1 text-cyan-300"
            >
              <Grid2X2 size={21} />
              Home
            </Link>

            <button
              type="button"
              onClick={scrollToMobileTasks}
              className="flex flex-col items-center gap-1"
            >
              <ListTodo size={21} />
              Tasks
            </button>

            <Link to="/bookings" className="flex flex-col items-center gap-1">
              <CalendarDays size={21} />
              Bookings
            </Link>

            <Link to="/contacts" className="flex flex-col items-center gap-1">
              <Users size={21} />
              Contacts
            </Link>

            <button
              type="button"
              onClick={() => setShowSidebar(true)}
              className="flex flex-col items-center gap-1"
            >
              <MoreHorizontal size={21} />
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

        
      </div>
    );
  }

  return (
    <DashboardLayout
      sidebar={sidebar}
      rightPanel={
        <RightPanel
          stats={stats}
          intelligence={intelligence}
          theme={theme}
          isLight={isLight}
        />
      }
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

     <BusinessIntelligenceCard
  stats={stats}
  urgentCount={urgentTasks.length}
  intelligence={intelligence}
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

      
    </DashboardLayout>
  );
}

function InsightRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-black/20 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-base">{icon}</span>

        <span className="truncate text-sm font-semibold text-slate-200">
          {label}
        </span>
      </div>

      <span className="ml-3 rounded-full bg-cyan-400/10 px-3 py-1 text-sm font-black text-cyan-300">
        {value}
      </span>
    </div>

    
  );
}
function BusinessIntelligenceCard({ stats, urgentCount, intelligence }) {
  const items = [
    {
      label: "Overdue Tasks",
      value: stats.overdue,
      icon: "⚠️",
    },
    {
      label: "Urgent Items",
      value: urgentCount,
      icon: "🔥",
    },
    {
      label: "Follow-Ups Needed",
      value: intelligence.followUps || 0,
      icon: "📞",
    },
    {
      label: "One-Time Customers",
      value: intelligence.oneTimeCustomers || 0,
      icon: "🔄",
    },
    {
      label: "Inactive Customers",
      value: intelligence.inactiveCustomers || 0,
      icon: "💤",
    },
    {
      label: "Bookings Today",
      value: intelligence.bookingsToday || 0,
      icon: "📅",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-[#111827]/80 p-5 shadow-2xl shadow-black/20">
      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              Business Intelligence
            </p>

            <h3 className="mt-2 text-2xl font-black text-white">
              Today&apos;s Opportunities
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Smart signals from your tasks, bookings and customer activity.
            </p>
          </div>

          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <Sparkles size={22} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-400">
                    {item.icon} {item.label}
                  </p>

                  <h4 className="mt-2 text-3xl font-black text-white">
                    {item.value}
                  </h4>
                </div>

                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-300">
                  Live
                </span>
              </div>
            </div>
          ))}
        </div>

        <Link
          to="/bookings"
          className="mt-5 inline-flex items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-200 hover:bg-cyan-400/15"
        >
          View Booking Intelligence
        </Link>
      </div>
    </section>
  );
}