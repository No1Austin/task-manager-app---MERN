import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await register(form.name, form.email, form.password);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="glass w-full max-w-md rounded-3xl p-8"
      >
        <h2 className="mb-6 text-3xl font-black">Sign Up</h2>

        <input
          type="text"
          placeholder="Name"
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

        <input
          type="password"
          placeholder="Password"
          className="mb-6 w-full rounded-xl bg-white/5 p-3 outline-none"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3 font-bold"
        >
          Create Account
        </button>

        <p className="mt-4 text-center text-sm text-slate-300">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-300 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}