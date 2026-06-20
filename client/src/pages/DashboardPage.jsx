import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

import API from "../services/api";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";


import StatsGrid from "../components/dashboard/StatsGrid";

import ProgressGauge from "../components/dashboard/ProgressGauge";
import RightPanel from "../components/dashboard/RightPanel";
import TaskTable from "../components/dashboard/TaskTable";
import AiInsightCard from "../components/dashboard/AiInsightCard";
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
          />
        </>
      )}
    </AnimatePresence>
  );

  return (
    <DashboardLayout sidebar={sidebar} rightPanel={<RightPanel stats={stats} />}>
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

      <StatsGrid stats={stats} />

      <AiInsightCard
        overdueCount={stats.overdue}
        urgentCount={urgentTasks.length}
        isLight={isLight}
      />

      <TaskTable tasks={tasks} pageLoading={pageLoading} />

      <CreateTaskModal
        open={showCreateModal}
        form={form}
        setForm={setForm}
        onSubmit={handleCreateTask}
        onClose={() => setShowCreateModal(false)}
        loading={createLoading}
        isLight={isLight}
      />
    </DashboardLayout>
  );
}