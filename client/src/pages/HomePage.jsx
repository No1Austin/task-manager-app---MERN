import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BellRing,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ContactRound,
  Grid2X2,
  Menu,
  PlayCircle,
  Rocket,
  Search,
  Sparkles,
  TimerReset,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const problemCards = [
  {
    title: "Customers Slip Away",
    description:
      "One booking happens, then silence. TaskFlow helps you bring them back.",
    icon: ContactRound,
    tone: "rose",
  },
  {
    title: "Follow-Ups Get Missed",
    description: "Stop losing leads because nobody remembered the next move.",
    icon: Clock3,
    tone: "amber",
  },
  {
    title: "Your Business Feels Scattered",
    description:
      "Tasks here, contacts there, bookings somewhere else. TaskFlow connects it.",
    icon: Grid2X2,
    tone: "violet",
  },
  {
    title: "TaskFlow Brings Control",
    description: "One workspace to organize, follow up, manage, and grow.",
    icon: CheckCircle2,
    tone: "cyan",
  },
];

const platformFeatures = [
  "Task Management",
  "Booking Management",
  "Contact Management",
  "Customer Groups",
  "Labels & Follow-Ups",
  "Business Dashboard",
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
    title: "Smart Business Insights",
    description: "AI-driven suggestions to help your business grow.",
    icon: Brain,
  },
];

const pricingPlans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "30 days",
    description: "Test the core system before upgrading.",
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
    description: "Unlock the full business control system.",
    features: [
      "Everything in Free Trial",
      "Unlimited Task Management",
      "Advanced Booking Management",
      "Contact CRM",
      "Groups & Labels",
      "Follow-Up Engine",
      "Inactive Customer Detection",
      "Booking Intelligence",
      "Customer Recovery Tools",
      "AEMA AI Business Intelligence",
      "Future Features Included",
    ],
    popular: true,
    cta: "Unlock Everything",
  },
];

export default function HomePage() {
  const [loadingRoute, setLoadingRoute] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (route) => {
    setLoadingRoute(route);
    setMobileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 pb-5 pt-20 text-slate-100 sm:px-6 md:px-10 md:pt-24 lg:px-16">
      <BackgroundGlow />

      <nav className="fixed left-4 right-4 top-4 z-[9999] mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-4 shadow-2xl shadow-black/40 backdrop-blur-xl md:left-10 md:right-10 md:px-5 lg:left-16 lg:right-16">
        <div className="flex min-w-0 items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-cyan-400 to-amber-300 font-black text-slate-950 shadow-lg shadow-cyan-500/20"
          >
            T
          </motion.div>

          <div className="min-w-0">
            <h1 className="text-lg font-black text-slate-50">TaskFlow</h1>

            <p className="truncate text-xs text-slate-300 sm:text-sm">
              A product of{" "}
              <a
                href="https://aemasystems.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-cyan-300"
              >
                AEMA Systems
              </a>
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-6 lg:flex">
          <a
            href="#features"
            className="text-sm font-semibold text-slate-300 hover:text-white"
          >
            Features
          </a>

          <a
            href="#intelligence"
            className="text-sm font-semibold text-slate-300 hover:text-white"
          >
            Intelligence
          </a>

          <a
            href="#pricing"
            className="text-sm font-semibold text-slate-300 hover:text-white"
          >
            Pricing
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            onClick={() => handleNavigate("/login")}
            className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]"
          >
            {loadingRoute === "/login" ? "Opening..." : "Log In"}
          </Link>

          <Link
            to="/register"
            onClick={() => handleNavigate("/register")}
            className="rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.04]"
          >
            {loadingRoute === "/register" ? "Opening..." : "Start Free Trial"}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-slate-900 text-white md:hidden"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-[78px] z-[10000] rounded-3xl border border-white/10 bg-slate-950 p-4 shadow-2xl shadow-black/50 md:hidden">
            <div className="flex flex-col gap-2">
              {["features", "intelligence", "pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm font-semibold capitalize text-slate-200"
                >
                  {item}
                </a>
              ))}

              <Link
                to="/login"
                onClick={() => handleNavigate("/login")}
                className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200"
              >
                Log In
              </Link>

              <Link
                to="/register"
                onClick={() => handleNavigate("/register")}
                className="rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-4 py-3 text-center text-sm font-black text-white"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </nav>

      <section className="relative mx-auto grid max-w-7xl gap-8 py-6 md:py-8 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-5xl text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200 sm:text-sm"
          >
            <Sparkles size={16} />
            Business control starts here
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="mx-auto max-w-6xl text-4xl font-black leading-[1.02] tracking-tight text-slate-50 sm:text-5xl md:text-7xl"
          >
            The Business Command Center for{" "}
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.25, ease: "easeOut" }}
              className="inline-block bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent"
            >
              Tasks, Bookings & Customers.
            </motion.span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.35, ease: "easeOut" }}
            className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg md:leading-8"
          >
            TaskFlow turns scattered business activity into one intelligent
            workspace where you manage tasks, bookings, contacts, follow-ups and
            customer opportunities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.48, ease: "easeOut" }}
            className="mt-6 flex flex-wrap justify-center gap-3"
          >
            <AnimatedWord text="Organize" delay={0} />
            <AnimatedWord text="Follow Up" delay={0.15} />
            <AnimatedWord text="Recover Customers" delay={0.3} />
            <AnimatedWord text="Grow Faster" delay={0.45} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-4"
          >
            <Link
              to="/register"
              onClick={() => handleNavigate("/hero-register")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3 font-bold text-white shadow-xl shadow-cyan-500/20 transition hover:scale-[1.04]"
            >
              {loadingRoute === "/hero-register" && <ButtonSpinner />}
              Start Free Trial
            </Link>

            <Link
              to="/register"
              onClick={() => handleNavigate("/demo")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 font-semibold text-slate-100 shadow-lg transition hover:bg-white/[0.08]"
            >
              {loadingRoute === "/demo" ? (
                <ButtonSpinner />
              ) : (
                <PlayCircle size={18} />
              )}
              Watch Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.72, ease: "easeOut" }}
            className="mt-6 grid justify-center gap-3 text-sm text-slate-400 sm:flex sm:flex-wrap sm:gap-6"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <Check size={15} className="text-cyan-300" />
              30-Day Free Trial
            </span>

            <span className="inline-flex items-center justify-center gap-2">
              <Check size={15} className="text-cyan-300" />
              Built for Small Businesses
            </span>

            <span className="inline-flex items-center justify-center gap-2">
              <Check size={15} className="text-cyan-300" />
              Pro Unlocks Intelligence
            </span>
          </motion.div>
        </motion.div>

        <HeroDashboardPreview />
      </section>

      <section className="mx-auto max-w-7xl pb-10">
        <div className="mb-5 flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-white/10 sm:w-24" />
          <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-violet-300 sm:tracking-[0.3em]">
            Stop running blind
          </p>
          <div className="h-px w-12 bg-white/10 sm:w-24" />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {problemCards.map((card, index) => (
            <ProblemCard key={card.title} card={card} index={index} />
          ))}
        </div>
      </section>

      <section
        id="features"
        className="mx-auto grid max-w-7xl gap-5 py-8 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <SectionText />

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-50">Live Workflow</p>
              <p className="text-xs text-slate-500">Your business in motion</p>
            </div>

            <motion.button
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-xs font-bold text-white"
            >
              + New Task
            </motion.button>
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
              title="Recover inactive customers"
              priority="High"
              status="In Progress"
            />
            <FeatureTaskRow
              title="Update service offers"
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

      <section id="intelligence" className="mx-auto max-w-7xl py-10">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-300">
            Pro intelligence
          </p>

          <h2 className="mt-3 text-2xl font-black text-slate-50 md:text-4xl">
            TaskFlow does not just store data. It tells you what needs action.
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Detect cold customers, missed opportunities, follow-up gaps, and
            growth signals before they turn into lost revenue.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-3">
          {intelligenceCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ delay: 0.06 * index }}
                className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 shadow-xl shadow-black/10 backdrop-blur-xl md:p-5"
              >
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/10 text-violet-300 md:mb-4 md:h-12 md:w-12">
                  <Icon size={20} />
                </div>

                <h3 className="text-sm font-bold text-slate-50 md:text-base">
                  {card.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-400 md:text-sm md:leading-6">
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

          <h2 className="mt-3 text-2xl font-black text-slate-50 md:text-4xl">
            Start free. Upgrade when you want full business control.
          </h2>
        </div>

        <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-2">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl py-10 md:py-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-r from-violet-500/10 via-slate-950/70 to-cyan-400/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:flex md:items-center md:justify-between md:p-8">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">
              <Rocket size={24} />
            </div>

            <h2 className="text-2xl font-black text-slate-50 md:text-4xl">
              Stop managing chaos. Start commanding your business.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
              TaskFlow gives your business structure, visibility, and momentum.
            </p>
          </div>

          <Link
            to="/register"
            onClick={() => handleNavigate("/final-register")}
            className="relative mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-8 py-4 font-black text-white shadow-xl transition hover:scale-[1.04] md:mt-0 md:w-auto"
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

function BackgroundGlow() {
  return (
    <>
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="pointer-events-none fixed left-[-80px] top-24 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl"
      />

      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 35, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="pointer-events-none fixed bottom-20 right-[-80px] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl"
      />
    </>
  );
}

function AnimatedWord({ text, delay = 0 }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: [0, -4, 0] }}
      transition={{
        opacity: { duration: 0.5, delay },
        y: {
          duration: 2.8,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          delay,
        },
      }}
      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-slate-200 shadow-lg"
    >
      {text}
    </motion.span>
  );
}

function SectionText() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-black/10 backdrop-blur-xl md:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
        Business operating system
      </p>

      <h2 className="mt-3 text-2xl font-black text-slate-50 md:text-4xl">
        One place for tasks, bookings, contacts, and customer action.
      </h2>

      <p className="mt-4 text-sm leading-7 text-slate-400">
        TaskFlow helps small businesses stop guessing and start operating with
        structure. Track what needs to be done, who needs attention, and where
        your next opportunity is hiding.
      </p>

      <div className="mt-6 space-y-3">
        {platformFeatures.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <CheckCircle2 size={18} />
            </div>

            <p className="font-semibold text-slate-200">{feature}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroDashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.2, ease: "easeOut" }}
      className="relative mx-auto w-full"
    >
      <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-r from-violet-500/20 via-cyan-400/20 to-fuchsia-500/20 blur-2xl" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#090e1d] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-6">
        <div className="grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
          <div>
            <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-cyan-300">
                    Welcome back
                  </p>

                  <h3 className="text-4xl font-black text-white md:text-5xl">
                    Dashboard
                  </h3>

                  <p className="mt-1 text-sm text-slate-400 md:text-base">
                    Manage tasks, bookings, contacts and follow-ups.
                  </p>
                </div>

                <div className="hidden min-w-[260px] items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4 text-slate-500 md:flex">
                  <Search size={18} />
                  Search anything...
                </div>
              </div>

              <motion.button
                animate={{
                  boxShadow: [
                    "0 0 0 rgba(34,211,238,0)",
                    "0 0 28px rgba(34,211,238,0.25)",
                    "0 0 0 rgba(34,211,238,0)",
                  ],
                }}
                transition={{ duration: 2.8, repeat: Infinity }}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 px-5 py-4 text-center text-lg font-bold text-white"
              >
                + New Task
              </motion.button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
              <DashboardStat title="Total Tasks" value="6" />
              <DashboardStat title="Completed" value="3" />
              <DashboardStat title="In Progress" value="2" />
              <DashboardStat title="Pending" value="1" />
              <DashboardStat title="Overdue" value="3" />
            </div>

            <div className="mt-5 rounded-[1.7rem] border border-cyan-400/10 bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950/30 p-4 md:p-6">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                Business Intelligence
              </p>

              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-3xl font-black text-white">
                    Today's Opportunities
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400 md:text-base">
                    Smart signals from your tasks, bookings and customer
                    activity.
                  </p>
                </div>

                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <Sparkles size={24} />
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <Opportunity title="⚠️ Overdue Tasks" value="3" tag="Live" />
                <Opportunity title="🔥 Urgent Items" value="3" tag="Live" />
                <Opportunity
                  title="📞 Follow-Ups Needed"
                  value="0"
                  tag="Live"
                />
                <Opportunity
                  title="🔁 One-Time Customers"
                  value="2"
                  tag="Live"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-4 md:p-6">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                Calendar
              </p>

              <h3 className="mt-3 text-2xl font-black text-white">Jun 2026</h3>

              <div className="mt-5 grid grid-cols-7 gap-3 text-center text-sm text-slate-400">
                {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                  <span key={day}>{day}</span>
                ))}

                {[
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                  18, 19, 20, 21, 22, 23, 24,
                ].map((date) => (
                  <span key={date} className="rounded-lg py-1">
                    {date}
                  </span>
                ))}

                <span className="rounded-xl bg-cyan-400 py-1 font-black text-slate-950">
                  25
                </span>

                {[26, 27, 28].map((date) => (
                  <span key={date} className="rounded-lg py-1">
                    {date}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-4 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                    Progress Rate
                  </p>

                  <h3 className="mt-2 text-2xl font-black text-white">
                    Task Completion
                  </h3>
                </div>

                <CheckCircle2 className="text-emerald-300" />
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-5xl font-black text-white">50%</p>

                <p className="mt-2 text-sm text-slate-400">
                  3 of 6 task(s) completed
                </p>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "50%" }}
                    transition={{ duration: 1.2, delay: 0.4 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-cyan-400/10 bg-cyan-950/20 p-4 md:p-6">
              <div className="flex items-center gap-3">
                <CalendarDays className="text-cyan-300" />

                <p className="text-sm font-semibold text-slate-300">
                  Good start. A few more completed tasks will improve your rate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DashboardStat({ title, value }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"
    >
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        <Grid2X2 size={18} />
      </div>

      <p className="text-xs text-slate-400 md:text-sm">{title}</p>

      <p className="mt-2 text-3xl font-black text-white md:text-4xl">
        {value}
      </p>
    </motion.div>
  );
}

function Opportunity({ title, value, tag }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-400">{title}</p>

        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-300">
          {tag}
        </span>
      </div>

      <p className="mt-3 text-3xl font-black text-white md:text-4xl">
        {value}
      </p>
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ delay: 0.08 * index }}
      className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 shadow-xl shadow-black/10 backdrop-blur-xl md:p-5"
    >
      <div
        className={`mb-3 grid h-10 w-10 place-items-center rounded-2xl md:mb-4 md:h-12 md:w-12 ${
          tones[card.tone]
        }`}
      >
        <Icon size={20} />
      </div>

      <h3 className="text-sm font-bold text-slate-50 md:text-base">
        {card.title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-400 md:text-sm md:leading-6">
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
    <motion.div
      whileHover={{ x: 6 }}
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
    >
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
    </motion.div>
  );
}

function PricingCard({ plan }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative rounded-[2rem] border p-6 shadow-xl shadow-black/10 backdrop-blur-xl ${
        plan.popular
          ? "border-violet-400/40 bg-violet-950/40"
          : "border-white/10 bg-slate-950/60"
      }`}
    >
      {plan.popular && (
        <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-1 text-xs font-black text-white">
          Best Value
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
    </motion.div>
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