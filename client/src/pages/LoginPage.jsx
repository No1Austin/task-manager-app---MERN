import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch {
      toast.error("Invalid credentials");
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
        <h2 className="mb-6 text-3xl font-black">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded-xl bg-white/5 p-3 outline-none"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-6 w-full rounded-xl bg-white/5 p-3 outline-none"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3 font-bold">
          Login
        </button>
      </motion.form>
    </div>);

    <p className="mt-4 text-center text-sm text-slate-300">
  Don’t have an account?{" "}
  <Link to="/register" className="text-cyan-300 hover:underline">
    Sign up
  </Link>
</p>

}

