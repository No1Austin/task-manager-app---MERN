import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../context/useAuth";
import API from "../services/api";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const inputClass =
    "w-full rounded-2xl border border-cyan-400/20 bg-slate-950/70 p-4 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10";

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

    if (!resetEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setResetLoading(true);

    try {
      await API.post("/auth/forgot-password", {
        email: resetEmail,
      });

      toast.success("Password reset link sent to your email");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-slate-100 shadow-2xl shadow-black/30 backdrop-blur-xl"
      >
        <h2 className="mb-2 text-4xl font-black text-slate-50">Login</h2>

        <p className="mb-6 text-base text-slate-300">
          Welcome back. Sign in to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            className={`${inputClass} mb-4`}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              className={`${inputClass} pr-12`}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="mb-6 text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword((prev) => !prev)}
              className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 py-4 font-black text-white shadow-lg shadow-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-70"
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
              className="mt-6 overflow-hidden rounded-2xl border border-cyan-400/15 bg-slate-950/50 p-4"
            >
              <h3 className="mb-2 text-lg font-bold text-slate-50">
                Reset Password
              </h3>

              <p className="mb-4 text-sm text-slate-400">
                Enter your email and we’ll send you a reset link.
              </p>

              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className={`${inputClass} mb-4`}
                required
              />

              <button
                type="submit"
                disabled={resetLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 py-3 font-semibold text-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {resetLoading && <ButtonSpinner />}
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="mt-6 text-center text-sm text-slate-300">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-cyan-300 hover:text-cyan-200 hover:underline"
          >
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
      style={{
        width: size,
        height: size,
      }}
      aria-hidden="true"
    />
  );
}