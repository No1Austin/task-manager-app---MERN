import {
  Building2,
  CreditCard,
  Palette,
  Mail,
  Brain,
  MessageCircle,
} from "lucide-react";

const sections = [
  {
    title: "Subscription",
    desc: "Manage trial, Starter and Pro plans.",
    icon: CreditCard,
  },
  {
    title: "Business Profile",
    desc: "Business name, industry, phone, email and website.",
    icon: Building2,
  },
  {
    title: "Booking Preferences",
    desc: "Customize booking page, services and questions.",
    icon: Palette,
  },
  {
    title: "WhatsApp",
    desc: "Connect WhatsApp and prepare customer messaging.",
    icon: MessageCircle,
  },
  {
    title: "Email Settings",
    desc: "Sender name, reply email and email signature.",
    icon: Mail,
  },
  {
    title: "Memory AI",
    desc: "Control follow-up intelligence and customer memory.",
    icon: Brain,
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#050816] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-black">Settings</h1>

        <p className="mt-2 text-slate-400">
          Manage your TaskFlow account, business profile, booking tools and Pro
          features.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <div
                key={section.title}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.07]"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                  <Icon size={24} />
                </div>

                <h2 className="mt-5 text-xl font-bold">
                  {section.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {section.desc}
                </p>

                <button
                  type="button"
                  className="mt-5 rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                >
                  Open
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}