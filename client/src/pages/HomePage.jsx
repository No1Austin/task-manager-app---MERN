import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Sparkles,
  TimerReset,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Smart Task Tracking",
    description: "Create, update, and organize tasks with a smooth workflow.",
    icon: CheckCircle2,
  },
  {
    title: "Modern Productivity",
    description: "Deadlines, progress states, and elegant visual feedback.",
    icon: TimerReset,
  },
  {
    title: "Secure Accounts",
    description: "Personalized dashboards with protected authentication.",
    icon: ShieldCheck,
  },
  {
    title: "Powerful Experience",
    description: "Colorful UI with fluid motion and a premium dashboard feel.",
    icon: Sparkles,
  },
];

export default function HomePage() {
  const [loadingRoute, setLoadingRoute] = useState("");

  const handleNavigate = (route) => {
    setLoadingRoute(route);
  };

  return (
    <div className="min-h-screen px-6 py-8 md:px-10 lg:px-16">
      <nav className="glass mx-auto flex max-w-7xl items-center justify-between rounded-3xl px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-cyan-400 to-amber-300 text-slate-950 font-black shadow-lg">
            T
          </div>
          <div>
            <h1 className="text-lg font-bold">TaskFlow</h1>
            <p className="text-sm text-slate-300">Modern MERN task manager</p>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            onClick={() => handleNavigate("/login")}
            className={`inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/90 transition hover:bg-white/10 ${
              loadingRoute === "/login" ? "pointer-events-none opacity-70" : ""
            }`}
          >
            {loadingRoute === "/login" && <ButtonSpinner size={14} />}
            {loadingRoute === "/login" ? "Opening..." : "Log In"}
          </Link>

          <Link
            to="/register"
            onClick={() => handleNavigate("/register")}
            className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] ${
              loadingRoute === "/register" ? "pointer-events-none opacity-80" : ""
            }`}
          >
            {loadingRoute === "/register" && <ButtonSpinner size={14} />}
            {loadingRoute === "/register" ? "Opening..." : "Get Started"}
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
            <Sparkles size={16} />
            Smarter productivity starts here
          </p>

          <h2 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">
            Build your day with a <span className="gradient-text">powerful</span>{" "}
            task workspace
          </h2>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
            TaskFlow helps users organize tasks, manage deadlines, track progress,
            and stay focused through a polished, colorful, modern interface.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/dashboard"
              onClick={() => handleNavigate("/dashboard")}
              className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3 font-semibold text-white shadow-xl transition hover:scale-[1.03] ${
                loadingRoute === "/dashboard"
                  ? "pointer-events-none opacity-80"
                  : ""
              }`}
            >
              {loadingRoute === "/dashboard" && <ButtonSpinner />}
              {loadingRoute === "/dashboard"
                ? "Opening..."
                : "Launch Dashboard"}
            </Link>

            <Link
              to="/register"
              onClick={() => handleNavigate("/register-demo")}
              className={`glass inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-medium text-white transition hover:bg-white/10 ${
                loadingRoute === "/register-demo"
                  ? "pointer-events-none opacity-80"
                  : ""
              }`}
            >
              {loadingRoute === "/register-demo" && <ButtonSpinner />}
              {loadingRoute === "/register-demo" ? "Opening..." : "View Demo"}
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="glass relative overflow-hidden rounded-[2rem] p-5"
        >
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative space-y-4">
            <div className="glass rounded-3xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Today’s Focus</h3>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                  78% done
                </span>
              </div>

              <div className="space-y-3">
                <TaskPreview title="Design dashboard UI" status="In Progress" />
                <TaskPreview title="Connect auth API" status="Pending" />
                <TaskPreview title="Deploy backend" status="Completed" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="glass rounded-3xl p-4">
                <p className="text-sm text-slate-300">Tasks Completed</p>
                <h4 className="mt-2 text-3xl font-black">24</h4>
              </div>
              <div className="glass rounded-3xl p-4">
                <p className="text-sm text-slate-300">Upcoming Deadlines</p>
                <h4 className="mt-2 text-3xl font-black">07</h4>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl pb-16">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * index }}
                className="glass rounded-[1.75rem] p-5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Icon className="text-cyan-300" size={22} />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function TaskPreview({ title, status }) {
  const statusClasses = {
    Pending: "bg-amber-500/20 text-amber-300",
    "In Progress": "bg-cyan-500/20 text-cyan-300",
    Completed: "bg-emerald-500/20 text-emerald-300",
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-slate-400">Productivity workflow</p>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses[status]}`}
      >
        {status}
      </span>
    </div>
  );
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