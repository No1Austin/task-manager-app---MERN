import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import API from "../services/api";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loginLoading, setLoginLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      toast.error("Please enter your email");
      return;
    }

    setResetLoading(true);

    try {
      await API.post("/auth/forgot-password", { email: resetEmail });
      toast.success("Password reset link sent to your email");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send reset link"
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md rounded-3xl p-8"
      >
        <h2 className="mb-2 text-3xl font-black">Login</h2>
        <p className="mb-6 text-sm text-slate-300">
          Welcome back. Sign in to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            className="mb-4 w-full rounded-xl bg-white/5 p-3 outline-none"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            className="mb-3 w-full rounded-xl bg-white/5 p-3 outline-none"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          <div className="mb-6 text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword((prev) => !prev)}
              className="text-sm text-cyan-300 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loginLoading && <ButtonSpinner />}
            {loginLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <AnimatePresence>
          {showForgotPassword && (
            <motion.form
              onSubmit={handleForgotPassword}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <h3 className="mb-2 text-lg font-semibold">Reset Password</h3>
              <p className="mb-4 text-sm text-slate-300">
                Enter your email and we’ll send you a reset link.
              </p>

              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mb-4 w-full rounded-xl bg-white/5 p-3 outline-none"
                required
              />

              <button
                type="submit"
                disabled={resetLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 py-3 font-semibold text-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {resetLoading && <ButtonSpinner />}
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="mt-6 text-center text-sm text-slate-300">
          Don’t have an account?{" "}
          <Link to="/register" className="text-cyan-300 hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
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