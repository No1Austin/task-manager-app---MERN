import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

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

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#22d3ee30,transparent_35%),radial-gradient(circle_at_bottom_right,#8b5cf630,transparent_35%),linear-gradient(135deg,#020617,#0f172a,#020617)] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40 lg:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-cyan-400/10 via-violet-500/10 to-transparent p-10 lg:block">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 font-black text-slate-950">
                T
              </div>

              <div>
                <h1 className="text-xl font-black">TaskFlow</h1>
                <p className="text-sm text-slate-400">by AEMA Systems</p>
              </div>
            </div>

            <div className="mt-16">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                Business Workspace
              </p>

              <h2 className="mt-4 max-w-md text-5xl font-black leading-tight">
                Start managing your business smarter.
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
                Create tasks, manage bookings, save contacts, follow up with
                customers and unlock Memory AI for smarter business decisions.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <FeatureItem text="Manage tasks and business priorities" />
              <FeatureItem text="Track bookings and customer follow-ups" />
              <FeatureItem text="Organize contacts, labels and groups" />
              <FeatureItem text="Unlock Memory AI business intelligence" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 font-black text-slate-950">
                  T
                </div>

                <div>
                  <h1 className="text-lg font-black">TaskFlow</h1>
                  <p className="text-xs text-slate-400">by AEMA Systems</p>
                </div>
              </div>
            </div>

            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              Create Account
            </p>

            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              Join TaskFlow
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Start your free trial and manage your tasks, bookings, contacts
              and follow-ups in one place.
            </p>

            <div className="mt-8 space-y-4">
              <InputField
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(value) => updateForm("name", value)}
              />

              <InputField
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(value) => updateForm("email", value)}
              />

              <PasswordField
                label="Password"
                placeholder="Create a password"
                value={form.password}
                show={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
                onChange={(value) => updateForm("password", value)}
              />

              <PasswordField
                label="Confirm Password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((prev) => !prev)}
                onChange={(value) => updateForm("confirmPassword", value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-4 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && <ButtonSpinner />}
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-cyan-300 hover:underline"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, type, placeholder, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/[0.09]"
      />
    </label>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  show,
  onToggle,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 pr-14 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/[0.09]"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-cyan-300"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </label>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <CheckCircle2 size={18} className="shrink-0 text-cyan-300" />
      <span className="text-sm font-semibold text-slate-300">{text}</span>
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