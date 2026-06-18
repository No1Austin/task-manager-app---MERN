import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register(form.name, form.email, form.password);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="glass w-full max-w-md rounded-3xl p-8"
      >
        <h2 className="mb-2 text-3xl font-black">Create Account</h2>

        <p className="mb-6 text-sm text-slate-300">
          Join TaskFlow and start managing your tasks.
        </p>

        <input
          type="text"
          placeholder="Full Name"
          className="mb-4 w-full rounded-xl bg-white/5 p-3 outline-none"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded-xl bg-white/5 p-3 outline-none"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full rounded-xl bg-white/5 p-3 pr-12 outline-none"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="relative mb-6">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full rounded-xl bg-white/5 p-3 pr-12 outline-none"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <ButtonSpinner />}
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="mt-5 text-center text-sm text-slate-300">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-300 hover:underline">
            Log in
          </Link>
        </p>
      </form>
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