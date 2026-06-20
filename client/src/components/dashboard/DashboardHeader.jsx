import {
  Menu,
  Plus,
  LogOut,
  UserCircle2,
  ChevronDown,
  Moon,
  Sun,
  Search,
  Bell,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ButtonSpinner from "./ButtonSpinner";

export default function DashboardHeader({
  isDesktop,
  setShowSidebar,
  theme,
  setTheme,
  profileRef,
  showProfileDropdown,
  setShowProfileDropdown,
  user,
  handleLogout,
  logoutLoading,
  setShowCreateModal,
}) {
  return (
    <header className="rounded-3xl border border-white/10 bg-[#111827]/90 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
        <div className="flex items-start gap-4">
          {!isDesktop && (
            <button
              onClick={() => setShowSidebar(true)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-slate-200 hover:bg-white/[0.08]"
            >
              <Menu size={20} />
            </button>
          )}

          <div>
            <p className="text-sm font-semibold text-cyan-300">Welcome back</p>

            <h2 className="mt-1 text-3xl font-black text-white">Dashboard</h2>

            <p className="mt-1 text-sm text-slate-400">
              Manage tasks, bookings, contacts and follow-ups.
            </p>
          </div>
        </div>

        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_48px_92px_minmax(150px,190px)] xl:items-center 2xl:grid-cols-[minmax(220px,320px)_48px_92px_minmax(150px,190px)_150px]">
          <div className="relative min-w-0">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder="Search anything..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
            />
          </div>

          <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]">
            <Bell size={18} />
          </button>

          <div className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] p-1">
            <button
              onClick={() => setTheme("dark")}
              className={`rounded-xl p-2 transition ${
                theme !== "light"
                  ? "bg-cyan-400 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Dark mode"
            >
              <Moon size={17} />
            </button>

            <button
              onClick={() => setTheme("light")}
              className={`rounded-xl p-2 transition ${
                theme === "light"
                  ? "bg-cyan-400 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Light mode"
            >
              <Sun size={17} />
            </button>
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileDropdown((prev) => !prev)}
              className="flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-slate-200 hover:bg-white/[0.08]"
            >
              <span className="flex min-w-0 items-center gap-2">
                <UserCircle2 size={20} />

                <span className="truncate text-sm font-semibold">
                  {user?.name || "User"}
                </span>
              </span>

              <ChevronDown size={16} />
            </button>

            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute right-0 top-14 z-30 w-64 rounded-3xl border border-white/10 bg-[#0b1020] p-3 shadow-2xl"
                >
                  <div className="rounded-2xl bg-white/[0.05] px-4 py-4">
                    <p className="font-bold text-white">{user?.name}</p>

                    <p className="mt-1 truncate text-sm text-slate-400">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    disabled={logoutLoading}
                    className="mt-2 flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-300 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
                  >
                    {logoutLoading ? (
                      <ButtonSpinner size={16} />
                    ) : (
                      <LogOut size={16} />
                    )}

                    {logoutLoading ? "Logging out..." : "Logout"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 text-sm font-black text-white shadow-lg shadow-cyan-500/10 xl:col-span-4 2xl:col-span-1"
          >
            <Plus size={18} />
            New Task
          </button>
        </div>
      </div>
    </header>
  );
}