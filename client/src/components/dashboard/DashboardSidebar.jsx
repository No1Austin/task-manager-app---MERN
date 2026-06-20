import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  LogOut,
  X,
  CalendarDays,
  Users,
  BookOpenCheck,
  Brain,
  Settings,
  Crown,
  Link2,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import ButtonSpinner from "./ButtonSpinner";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Tasks", icon: BookOpenCheck, path: "/dashboard" },
  { label: "Bookings", icon: CalendarDays, path: "/bookings" },
  { label: "Booking Link", icon: Link2, path: "/booking-setup", pro: true },
  { label: "Contacts", icon: Users, path: "/contacts", pro: true },
  { label: "WhatsApp", icon: MessageCircle, path: "/whatsapp", pro: true },
  { label: "Memory AI", icon: Brain, path: "/memory", pro: true },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function DashboardSidebar({
  isDesktop,
  setShowSidebar,
  user,
  plan,
  trialEndsAt,
  handleLogout,
  logoutLoading,
  setShowCreateModal,
}) {
  return (
    <motion.aside
      initial={{ x: -28, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -28, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`z-50 flex h-screen w-[240px] flex-col overflow-y-auto overflow-x-hidden border-r border-white/10 bg-[#0b1020] p-4 ${
        isDesktop ? "relative" : "fixed inset-y-0 left-0"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 font-black text-white">
            T
          </div>

          <div>
            <h1 className="text-lg font-black text-white">TaskFlow</h1>
            <p className="text-xs text-slate-400">by AEMA Systems</p>
          </div>
        </div>

        {!isDesktop && (
          <button
            onClick={() => setShowSidebar(false)}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          Signed in
        </p>

        <h2 className="mt-3 truncate font-bold text-white">{user?.name}</h2>
        <p className="truncate text-sm text-slate-400">{user?.email}</p>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/[0.06] px-3 py-2">
          <span className="text-xs text-slate-400">Plan</span>
          <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold capitalize text-cyan-300">
            {plan}
          </span>
        </div>

        {plan === "trial" && (
          <p className="mt-3 text-xs text-slate-400">
            Trial ends{" "}
            <span className="text-slate-200">
              {trialEndsAt ? new Date(trialEndsAt).toLocaleDateString() : "soon"}
            </span>
          </p>
        )}
      </div>

      <button
        onClick={() => setShowCreateModal(true)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3 text-sm font-bold text-white"
      >
        <Plus size={18} />
        Create New Task
      </button>

      <nav className="mt-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => {
                if (!isDesktop) setShowSidebar(false);
              }}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? "bg-cyan-400 text-white"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>

              {item.pro && (
                <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                  PRO
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-violet-500/10 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
          <Crown size={20} />
        </div>

        <h3 className="mt-4 font-black text-white">Upgrade to Pro</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Unlock contacts, bookings, WhatsApp and Memory AI.
        </p>

        <button className="mt-4 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3 text-sm font-black text-white">
          Upgrade
        </button>
      </div>

      <button
        onClick={handleLogout}
        disabled={logoutLoading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
      >
        {logoutLoading ? <ButtonSpinner size={16} /> : <LogOut size={18} />}
        {logoutLoading ? "Logging out..." : "Logout"}
      </button>
    </motion.aside>
  );
}