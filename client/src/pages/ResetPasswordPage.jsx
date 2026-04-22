import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../services/api";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      toast.error("Please enter a new password");
      return;
    }

    setLoading(true);

    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md rounded-3xl p-8"
      >
        <h2 className="mb-2 text-3xl font-black">Reset Password</h2>
        <p className="mb-6 text-sm text-slate-300">
          Enter your new password
        </p>

        <input
          type="password"
          placeholder="New password"
          className="mb-6 w-full rounded-xl bg-white/5 p-3 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3 font-bold disabled:opacity-70"
        >
          {loading && <ButtonSpinner />}
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </motion.form>
    </div>
  );
}

function ButtonSpinner({ size = 16 }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-white/30 border-t-white"
      style={{ width: size, height: size }}
    />
  );
}