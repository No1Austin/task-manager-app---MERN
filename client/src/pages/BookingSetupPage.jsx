import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Brush,
  ClipboardList,
  GripVertical,
  Lock,
  Plus,
  Trash2,
  User,
  Phone,
  Briefcase,
  Users,
  MapPin,
  Home,
  Clock,
  Save,
  Link2,
  CheckCircle2,
  Eye,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/useAuth";
import UpgradeModal from "../components/UpgradeModal";

const defaultQuestions = [
  { name: "customer_name", label: "Customer Name", type: "text", required: true, locked: true, icon: User },
  { name: "customer_phone", label: "Customer Phone", type: "text", required: true, locked: true, icon: Phone },
  { name: "service", label: "Service Needed", type: "text", required: true, locked: true, icon: Briefcase },
  { name: "persons", label: "Number of Persons", type: "number", required: true, locked: true, icon: Users },
  { name: "location", label: "Location or Address Needed", type: "text", required: true, locked: true, icon: MapPin },
  { name: "service_location", label: "In-Shop or Home Service?", type: "text", required: true, locked: true, icon: Home },
  { name: "booking_date", label: "Preferred Time / Date", type: "datetime-local", required: true, locked: true, icon: Clock },
];

const emptyForm = {
  business_name: "",
  booking_slug: "",
  business_email: "",
  business_phone: "",
  tagline: "",
  brand_color: "#22d3ee",
  business_description: "",
  business_type: "custom",
  booking_questions: [],
};

export default function BookingSetupPage() {
  const { isPro } = useAuth();

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const bookingLink = profile
    ? `${window.location.origin}/book/${profile.booking_slug}`
    : "";

  useEffect(() => {
    if (!isPro) return;

    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/bookings/profile/me");

        setProfile(data);
        setForm({
          business_name: data.business_name || "",
          booking_slug: data.booking_slug || "",
          business_email: data.business_email || "",
          business_phone: data.business_phone || "",
          tagline: data.tagline || "",
          brand_color: data.brand_color || "#22d3ee",
          business_description: data.business_description || "",
          business_type: data.business_type || "custom",
          booking_questions: data.booking_questions || [],
        });
      } catch {
        setProfile(null);
      }
    };

    fetchProfile();
  }, [isPro]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateQuestion = (index, field, value) => {
    setForm((prev) => {
      const updatedQuestions = [...prev.booking_questions];
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
      return { ...prev, booking_questions: updatedQuestions };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      booking_questions: [
        ...prev.booking_questions,
        {
          name: `question_${prev.booking_questions.length + 1}`,
          label: "",
          type: "text",
          required: false,
        },
      ],
    }));
  };

  const removeQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      booking_questions: prev.booking_questions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.business_name.trim() || !form.booking_slug.trim()) {
      toast.error("Business name and booking slug are required");
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/bookings/profile", form);
      setProfile(data);
      toast.success("Booking setup saved!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save booking setup");
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-[#111827]/80 p-8 text-center shadow-2xl">
          <h1 className="text-3xl font-black">Booking Link is a Pro Feature</h1>

          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Upgrade to TaskFlow Pro to create personalized booking links, capture customers automatically, and manage bookings inside TaskFlow.
          </p>

          <button
            onClick={() => setShowUpgrade(true)}
            className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 font-bold text-white"
          >
            Upgrade to Pro
          </button>
        </div>

        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#0e749020,transparent_30%),radial-gradient(circle_at_top_right,#7c3aed20,transparent_30%),linear-gradient(135deg,#020617,#0f172a,#020617)] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <Hero profile={profile} bookingLink={bookingLink} />

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <StatCard icon={Link2} title="Booking Link" value={profile ? "Active" : "Not Setup"} />
          <StatCard icon={ClipboardList} title="Custom Questions" value={form.booking_questions.length} />
          <StatCard icon={CheckCircle2} title="Business Profile" value={form.business_name ? "Complete" : "Incomplete"} />
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <FormSection>
              <SectionHeader
                icon={<Brush size={22} />}
                title="Branding"
                description="Customize how your booking page looks and represents your business."
                color="from-cyan-400 to-violet-500"
              />

              <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr_0.8fr]">
                <Field label="Business Name">
                  <input
                    type="text"
                    placeholder="e.g. James Catering"
                    className="input-style"
                    value={form.business_name}
                    onChange={(e) => updateForm("business_name", e.target.value)}
                  />
                </Field>

                <Field label="Tagline">
                  <input
                    type="text"
                    placeholder="e.g. Exceptional food for every occasion"
                    className="input-style"
                    value={form.tagline}
                    onChange={(e) => updateForm("tagline", e.target.value)}
                  />
                </Field>

                <Field label="Brand Color">
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-2">
                    <input
                      type="color"
                      className="h-10 w-12 rounded-lg border-0 bg-transparent"
                      value={form.brand_color}
                      onChange={(e) => updateForm("brand_color", e.target.value)}
                    />

                    <span className="text-sm text-slate-300">
                      {form.brand_color}
                    </span>
                  </div>
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Business Description">
                  <textarea
                    placeholder="Describe your business, services and what makes you special..."
                    rows="4"
                    className="input-style resize-none"
                    value={form.business_description}
                    onChange={(e) => updateForm("business_description", e.target.value)}
                  />
                </Field>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Field label="Booking Slug">
                  <input
                    type="text"
                    placeholder="e.g. james-catering"
                    className="input-style"
                    value={form.booking_slug}
                    onChange={(e) =>
                      updateForm(
                        "booking_slug",
                        e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "")
                      )
                    }
                  />
                </Field>

                <Field label="Business Email">
                  <input
                    type="email"
                    placeholder="e.g. hello@business.com"
                    className="input-style"
                    value={form.business_email}
                    onChange={(e) => updateForm("business_email", e.target.value)}
                  />
                </Field>

                <Field label="Business Phone">
                  <input
                    type="text"
                    placeholder="e.g. 437-000-0000"
                    className="input-style"
                    value={form.business_phone}
                    onChange={(e) => updateForm("business_phone", e.target.value)}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection>
              <SectionHeader
                icon={<ClipboardList size={22} />}
                title="Form Needs"
                description="These default fields will appear on your public booking form."
                color="from-emerald-400 to-cyan-400"
              />

              <div className="mt-6 space-y-3">
                {defaultQuestions.map((question) => {
                  const Icon = question.icon;

                  return (
                    <div
                      key={question.name}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical size={18} className="text-slate-500" />

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10">
                          <Icon size={18} className="text-cyan-300" />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{question.label}</p>

                          {question.required && (
                            <span className="rounded-full bg-violet-500/20 px-2 py-1 text-xs font-semibold text-violet-300">
                              Required
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Lock size={14} />
                        Default Field
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold">Custom Questions Optional</h3>
                    <p className="text-sm text-slate-400">
                      Add tailored questions specific to your business.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 text-sm font-bold text-white"
                  >
                    <Plus size={16} />
                    Add Custom Question
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {form.booking_questions.map((question, index) => (
                    <div
                      key={`${question.name}-${index}`}
                      className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 lg:grid-cols-[1fr_1fr_0.8fr_0.7fr_auto]"
                    >
                      <input
                        type="text"
                        placeholder="Question Label"
                        className="input-style"
                        value={question.label}
                        onChange={(e) => updateQuestion(index, "label", e.target.value)}
                      />

                      <input
                        type="text"
                        placeholder="Field Name"
                        className="input-style"
                        value={question.name}
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            "name",
                            e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/[^a-z0-9_]/g, "")
                          )
                        }
                      />

                      <select
                        className="input-style"
                        value={question.type}
                        onChange={(e) => updateQuestion(index, "type", e.target.value)}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>

                      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-3">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(index, "required", e.target.checked)}
                        />
                        <span className="font-semibold">Required</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  {form.booking_questions.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
                      No custom questions yet. Add one if your business needs extra details.
                    </div>
                  )}
                </div>
              </div>
            </FormSection>

            <section className="rounded-3xl border border-white/10 bg-[#111827]/80 p-4 shadow-xl">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-600 px-5 py-4 font-bold text-white disabled:opacity-70"
              >
                <Save size={18} />
                {loading ? "Saving..." : "Save Booking Setup"}
              </button>
            </section>
          </div>

          <LivePreview form={form} bookingLink={bookingLink} />
        </form>
      </div>
    </div>
  );
}

function Hero({ profile, bookingLink }) {
  return (
    <div className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 p-8 shadow-2xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-300">TaskFlow Pro</p>
          <h1 className="mt-2 text-4xl font-black">Booking Link Builder</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Create a professional booking page, collect customer details,
            automate scheduling, and grow your business.
          </p>
        </div>

        {profile && (
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Live Booking Link
            </p>
            <a
              href={bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block break-all font-semibold text-cyan-300"
            >
              {bookingLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827]/80 p-5 shadow-xl">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        <Icon size={22} />
      </div>
      <p className="mt-4 text-sm text-slate-400">{title}</p>
      <h3 className="mt-1 text-2xl font-black text-white">{value}</h3>
    </div>
  );
}

function LivePreview({ form, bookingLink }) {
  return (
    <aside className="h-fit rounded-3xl border border-white/10 bg-[#111827]/80 p-5 shadow-xl xl:sticky xl:top-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-black">Live Preview</h3>
        <Eye className="text-cyan-300" size={20} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#020617] p-5">
        <div
          className="mb-5 h-2 w-24 rounded-full"
          style={{ background: form.brand_color || "#22d3ee" }}
        />

        <h4 className="text-2xl font-black">
          {form.business_name || "Your Business"}
        </h4>

        <p className="mt-2 text-sm text-slate-400">
          {form.tagline || "Your business tagline will appear here."}
        </p>

        <div className="mt-5 space-y-3">
          {["Customer Name", "Customer Phone", "Service Needed", "Preferred Time / Date"].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400"
            >
              {item}
            </div>
          ))}
        </div>

        <button
          type="button"
          className="mt-5 w-full rounded-2xl px-4 py-3 font-bold text-white"
          style={{ background: form.brand_color || "#22d3ee" }}
        >
          Request Booking
        </button>
      </div>

      {bookingLink && (
        <p className="mt-4 break-all text-xs text-slate-500">
          {bookingLink}
        </p>
      )}
    </aside>
  );
}

function FormSection({ children }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827]/80 p-6 shadow-xl">
      {children}
    </section>
  );
}

function SectionHeader({ icon, title, description, color }) {
  return (
    <div className="flex items-start gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white`}>
        {icon}
      </div>

      <div>
        <h2 className="text-xl font-black">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>
      {children}
    </label>
  );
}