import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BellRing,
  Brain,
  Check,
  CheckCircle2,
  Clock3,
  ContactRound,
  ExternalLink,
  Grid2X2,
  PlayCircle,
  Rocket,
  Sparkles,
  TimerReset,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const problemCards = [
  {
    title: "Losing Track of Customers?",
    description:
      "Customers disappear after one booking and you never see them again.",
    icon: ContactRound,
    tone: "rose",
  },
  {
    title: "Missing Follow-Ups?",
    description: "Leads go cold because nobody remembers to call or follow up.",
    icon: Clock3,
    tone: "amber",
  },
  {
    title: "Too Many Tools?",
    description:
      "Tasks, bookings and contacts are scattered across different apps.",
    icon: Grid2X2,
    tone: "violet",
  },
  {
    title: "TaskFlow Fixes All Three",
    description: "One platform. Everything connected. Your business organized.",
    icon: CheckCircle2,
    tone: "cyan",
  },
];

const platformFeatures = [
  "Task Management",
  "Basic Booking Management",
  "Contact Management",
  "Simple Dashboard",
  "Limited Reports",
  "Starter Customer View",
];

const intelligenceCards = [
  {
    title: "One-Time Customers",
    description: "See customers who booked once and never returned.",
    icon: Users,
  },
  {
    title: "Inactive Customers",
    description: "Automatically identify customers inactive for 14+ days.",
    icon: TimerReset,
  },
  {
    title: "Follow-Up Opportunities",
    description: "Know exactly who to contact and when.",
    icon: BellRing,
  },
  {
    title: "At-Risk Customers",
    description: "Spot customers likely to stop coming back.",
    icon: AlertTriangle,
  },
  {
    title: "Revenue Opportunities",
    description: "Find upsell and repeat-booking opportunities.",
    icon: TrendingUp,
  },
  {
    title: "Smart Insights",
    description: "AI-driven suggestions to help your business grow.",
    icon: Brain,
  },
];

const pricingPlans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "30 days",
    description: "Try TaskFlow with limited features before upgrading.",
    features: [
      "Task Management",
      "Contact Management",
      "Basic Booking Management",
      "Simple Dashboard",
      "Limited Reports",
      "Limited Customer Intelligence",
    ],
    popular: false,
    cta: "Start Free Trial",
  },
  {
    name: "Pro",
    price: "$24",
    period: "per month",
    description: "Unlock everything TaskFlow has to offer.",
    features: [
      "Everything in Free Trial",
      "Unlimited Task Management",
      "Advanced Booking Management",
      "Contact CRM",
      "Groups & Labels",
      "Follow-Up Engine",
      "One-Time Customer Detection",
      "Inactive Customer Detection",
      "Booking Intelligence",
      "Archived Bookings & Restore",
      "AEMA AI Business Intelligence",
      "Future Features Included",
    ],
    popular: true,
    cta: "Unlock Everything",
  },
];

export default function HomePage() {
  const [loadingRoute, setLoadingRoute] = useState("");

  const handleNavigate = (route) => {
    setLoadingRoute(route);
  };

  return (
    <div className="min-h-screen overflow-hidden px-6 py-8 text-slate-100 md:px-10 lg:px-16">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-cyan-400 to-amber-300 font-black text-slate-950 shadow-lg">
            T
          </div>

          <div>
            <h1 className="text-lg font-black text-slate-50">TaskFlow</h1>
            <p className="text-sm text-slate-300">
              A product of{" "}
              <a
                href="https://aemasystems.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-cyan-300 hover:text-cyan-200"
              >
                AEMA Systems
              </a>
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a className="text-sm font-semibold text-slate-300 hover:text-white" href="#features">
            Features
          </a>
          <a className="text-sm font-semibold text-slate-300 hover:text-white" href="#intelligence">
            Intelligence
          </a>
          <a className="text-sm font-semibold text-slate-300 hover:text-white" href="#pricing">
            Pricing
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="https://aemasystems.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
          >
            AEMA Systems
            <ExternalLink size={14} />
          </a>

          <Link
            to="/login"
            onClick={() => handleNavigate("/login")}
            className={`inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08] ${
              loadingRoute === "/login" ? "pointer-events-none opacity-70" : ""
            }`}
          >
            {loadingRoute === "/login" && <ButtonSpinner size={14} />}
            {loadingRoute === "/login" ? "Opening..." : "Log In"}
          </Link>

          <Link
            to="/register"
            onClick={() => handleNavigate("/register")}
            className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] ${
              loadingRoute === "/register" ? "pointer-events-none opacity-80" : ""
            }`}
          >
            {loadingRoute === "/register" && <ButtonSpinner size={14} />}
            {loadingRoute === "/register" ? "Opening..." : "Start Free Trial"}
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
            <Sparkles size={16} />
            TaskFlow by AEMA Systems
          </p>

          <h2 className="max-w-3xl text-5xl font-black leading-[1.03] tracking-tight text-slate-50 md:text-7xl">
            Run Your Business From One{" "}
            <span className="gradient-text">Intelligent Workspace</span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Manage tasks, bookings, contacts, follow-ups, customer groups and
            business operations from one powerful platform built for growing
            businesses.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/register"
              onClick={() => handleNavigate("/hero-register")}
              className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3 font-bold text-white shadow-xl transition hover:scale-[1.03] ${
                loadingRoute === "/hero-register"
                  ? "pointer-events-none opacity-80"
                  : ""
              }`}
            >
              {loadingRoute === "/hero-register" && <ButtonSpinner />}
              Start Free Trial
            </Link>

            <Link
              to="/register"
              onClick={() => handleNavigate("/demo")}
              className={`inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 font-semibold text-slate-100 shadow-lg transition hover:bg-white/[0.08] ${
                loadingRoute === "/demo" ? "pointer-events-none opacity-80" : ""
              }`}
            >
              {loadingRoute === "/demo" ? (
                <ButtonSpinner />
              ) : (
                <PlayCircle size={18} />
              )}
              Watch Demo
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2">
              <Check size={15} className="text-cyan-300" />
              30-Day Free Trial
            </span>

            <span className="inline-flex items-center gap-2">
              <Check size={15} className="text-cyan-300" />
              Limited Features Included
            </span>

            <span className="inline-flex items-center gap-2">
              <Check size={15} className="text-cyan-300" />
              Pro Unlocks Everything
            </span>
          </div>
        </motion.div>

        <HeroDashboardPreview />
      </section>

      <section className="mx-auto max-w-7xl pb-8">
        <div className="mb-5 flex items-center justify-center gap-4">
          <div className="h-px w-24 bg-white/10" />
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-300">
            Sound familiar?
          </p>
          <div className="h-px w-24 bg-white/10" />
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {problemCards.map((card, index) => (
            <ProblemCard key={card.title} card={card} index={index} />
          ))}
        </div>
      </section>

      <section
        id="features"
        className="mx-auto grid max-w-7xl gap-5 py-8 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
            Trial access
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-50">
            Start with the essentials. Upgrade when you need full power.
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-400">
            Your 30-day trial gives you enough tools to organize your business,
            while Pro unlocks the full TaskFlow business operating system.
          </p>

          <div className="mt-6 space-y-3">
            {platformFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <CheckCircle2 size={18} />
                </div>
                <p className="font-semibold text-slate-200">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-50">Tasks</p>
              <p className="text-xs text-slate-500">Live business workflow</p>
            </div>

            <button className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-xs font-bold text-white">
              + New Task
            </button>
          </div>

          <div className="space-y-3">
            <FeatureTaskRow
              title="Follow up with new clients"
              priority="High"
              status="Completed"
            />
            <FeatureTaskRow
              title="Prepare monthly report"
              priority="Medium"
              status="In Progress"
            />
            <FeatureTaskRow
              title="Marketing campaign review"
              priority="High"
              status="In Progress"
            />
            <FeatureTaskRow
              title="Update website content"
              priority="Low"
              status="Pending"
            />
            <FeatureTaskRow
              title="Team performance review"
              priority="Medium"
              status="Pending"
            />
          </div>
        </div>
      </section>

      <section id="intelligence" className="mx-auto max-w-7xl py-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-300">
            Pro intelligence
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-50">
            Upgrade to Pro to unlock customer and booking intelligence.
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Pro helps business owners detect customers who need follow-up,
            one-time bookers, inactive customers and growth opportunities.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {intelligenceCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index }}
                className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-black/10 backdrop-blur-xl"
              >
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">
                  <Icon size={22} />
                </div>

                <h3 className="font-bold text-slate-50">{card.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {card.description}
                </p>

                <p className="mt-4 inline-flex rounded-full bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300">
                  Pro Feature
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl py-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
            Simple pricing
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-50">
            Try TaskFlow for 30 days. Upgrade to Pro for full access.
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            The trial gives you limited access to core tools. Pro unlocks all
            current and future TaskFlow features.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-2">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl py-12">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-violet-500/10 via-slate-950/70 to-cyan-400/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl md:flex md:items-center md:justify-between">
          <div>
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">
              <Rocket size={24} />
            </div>

            <h2 className="text-3xl font-black text-slate-50">
              Ready to organize your business?
            </h2>

            <p className="mt-2 max-w-2xl text-slate-400">
              Start with a 30-day limited trial. Upgrade to Pro when you are
              ready to unlock everything.
            </p>
          </div>

          <Link
            to="/register"
            onClick={() => handleNavigate("/final-register")}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-8 py-4 font-black text-white shadow-xl transition hover:scale-[1.03] md:mt-0"
          >
            {loadingRoute === "/final-register"
              ? "Opening..."
              : "Start Free Trial"}
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl border-t border-white/10 py-8 text-center">
        <p className="text-sm text-slate-400">
          TaskFlow is a product of{" "}
          <a
            href="https://aemasystems.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-cyan-300 hover:text-cyan-200"
          >
            AEMA Systems
          </a>
          .
        </p>
      </footer>
    </div>
  );
}

function HeroDashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, delay: 0.1 }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/30 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-black text-slate-50">
              Good morning 👋
            </p>
            <p className="text-sm text-slate-500">
              Here’s what needs attention today.
            </p>
          </div>

          <div className="hidden rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-400 md:block">
            Search anything...
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <MiniStat title="Tasks" value="24" />
          <MiniStat title="Bookings" value="8" />
          <MiniStat title="Contacts" value="36" />
          <MiniStat title="Pro Locked" value="AI" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
            <p className="mb-4 font-bold text-slate-50">Trial Dashboard</p>

            <div className="grid place-items-center py-8">
              <div className="grid h-32 w-32 place-items-center rounded-full border-[14px] border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.16)]">
                <div className="text-center">
                  <p className="text-2xl font-black text-white">Limited</p>
                  <p className="text-xs text-slate-400">Trial Access</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
            <p className="mb-4 font-bold text-slate-50">
              Pro Unlocks
            </p>

            <div className="space-y-3">
              <SmallPreviewLine title="Booking Intelligence" tag="Pro" />
              <SmallPreviewLine title="Groups & Labels" tag="Pro" />
              <SmallPreviewLine title="Customer Recovery" tag="Pro" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProblemCard({ card, index }) {
  const Icon = card.icon;

  const tones = {
    rose: "bg-rose-500/10 text-rose-300",
    amber: "bg-amber-500/10 text-amber-300",
    violet: "bg-violet-500/10 text-violet-300",
    cyan: "bg-cyan-500/10 text-cyan-300",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-black/10 backdrop-blur-xl"
    >
      <div
        className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ${
          tones[card.tone]
        }`}
      >
        <Icon size={22} />
      </div>

      <h3 className="font-bold text-slate-50">{card.title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {card.description}
      </p>
    </motion.div>
  );
}

function FeatureTaskRow({ title, priority, status }) {
  const priorityClass = {
    High: "bg-rose-500/15 text-rose-300",
    Medium: "bg-amber-500/15 text-amber-300",
    Low: "bg-emerald-500/15 text-emerald-300",
  };

  const statusClass = {
    Completed: "bg-emerald-500/15 text-emerald-300",
    "In Progress": "bg-cyan-500/15 text-cyan-300",
    Pending: "bg-amber-500/15 text-amber-300",
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
      <div>
        <p className="font-semibold text-slate-100">{title}</p>
        <p className="text-xs text-slate-500">Business workflow</p>
      </div>

      <div className="flex gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            priorityClass[priority]
          }`}
        >
          {priority}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            statusClass[status]
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

function MiniStat({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-slate-50">{value}</p>
    </div>
  );
}

function SmallPreviewLine({ title, tag }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] px-3 py-3">
      <p className="text-sm font-semibold text-slate-300">{title}</p>

      <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300">
        {tag}
      </span>
    </div>
  );
}

function PricingCard({ plan }) {
  return (
    <div
      className={`relative rounded-[2rem] border p-6 shadow-xl shadow-black/10 backdrop-blur-xl ${
        plan.popular
          ? "border-violet-400/40 bg-violet-950/40"
          : "border-white/10 bg-slate-950/60"
      }`}
    >
      {plan.popular && (
        <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-1 text-xs font-black text-white">
          Unlock Everything
        </span>
      )}

      <h3 className="text-xl font-black text-slate-50">{plan.name}</h3>
      <p className="mt-1 text-sm text-slate-400">{plan.description}</p>

      <div className="mt-6 flex items-end gap-1">
        <span className="text-4xl font-black text-white">{plan.price}</span>
        <span className="mb-1 text-sm text-slate-400">/{plan.period}</span>
      </div>

      <div className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <p
            key={feature}
            className="flex items-center gap-2 text-sm text-slate-300"
          >
            <Check size={15} className="text-cyan-300" />
            {feature}
          </p>
        ))}
      </div>

      <Link
        to="/register"
        className={`mt-7 inline-flex w-full justify-center rounded-2xl px-5 py-3 font-bold transition ${
          plan.popular
            ? "bg-gradient-to-r from-violet-500 to-cyan-400 text-white"
            : "border border-cyan-400/30 text-cyan-200 hover:bg-cyan-400/10"
        }`}
      >
        {plan.cta}
      </Link>
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