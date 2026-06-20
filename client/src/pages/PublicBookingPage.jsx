import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import API from "../services/api";

export default function PublicBookingPage() {
  const { slug } = useParams();

  const [business, setBusiness] = useState(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customAnswers, setCustomAnswers] = useState({});

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    service: "",
    booking_date: "",
    notes: "",
  });

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const { data } = await API.get(`/bookings/public/${slug}`);
        setBusiness(data);
      } catch {
        setBusiness(null);
      } finally {
        setLoadingBusiness(false);
      }
    };

    fetchBusiness();
  }, [slug]);

  const brandColor = business?.brand_color || "#22d3ee";
  const bookingQuestions = business?.booking_questions || [];

  const handleCustomAnswerChange = (name, value) => {
    setCustomAnswers((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateCustomQuestions = () => {
    for (const question of bookingQuestions) {
      if (question.required && !customAnswers[question.name]) {
        toast.error(`${question.label} is required`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customer_name || !form.customer_phone || !form.booking_date) {
      toast.error("Name, phone, and booking date are required");
      return;
    }

    if (!validateCustomQuestions()) return;

    setSubmitting(true);

    try {
      await API.post(`/bookings/public/${slug}`, {
        ...form,
        custom_answers: customAnswers,
      });

      toast.success("Booking submitted successfully!");

      setForm({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        service: "",
        booking_date: "",
        notes: "",
      });

      setCustomAnswers({});
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingBusiness) {
    return (
      <PageShell>
        <div className="rounded-3xl border border-white/10 bg-[#111827]/80 p-8 text-center text-white">
          Loading booking page...
        </div>
      </PageShell>
    );
  }

  if (!business) {
    return (
      <PageShell>
        <div className="rounded-3xl border border-white/10 bg-[#111827]/80 p-8 text-center text-white">
          <h1 className="text-3xl font-black">Booking Page Not Found</h1>
          <p className="mt-2 text-slate-400">
            This TaskFlow booking link does not exist.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-6xl">
        <div
          className="mb-6 rounded-[2rem] border border-white/10 p-8 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${brandColor}22, rgba(124,58,237,0.18), rgba(15,23,42,0.95))`,
          }}
        >
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
            TaskFlow Booking
          </p>

          <h1 className="mt-4 text-4xl font-black text-white md:text-5xl">
            {business.business_name}
          </h1>

          <p className="mt-3 max-w-2xl text-lg text-slate-300">
            {business.tagline ||
              "Book a service in less than 60 seconds. The business will review your request and contact you shortly."}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/10 bg-[#111827]/85 p-6 text-white shadow-2xl"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-black">Request a Booking</h2>
              <p className="mt-2 text-sm text-slate-400">
                Fill in your details and preferred service information.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <BookingInput
                placeholder="Full Name"
                value={form.customer_name}
                onChange={(value) =>
                  setForm({ ...form, customer_name: value })
                }
              />

              <BookingInput
                placeholder="Phone Number"
                value={form.customer_phone}
                onChange={(value) =>
                  setForm({ ...form, customer_phone: value })
                }
              />

              <BookingInput
                type="email"
                placeholder="Email Address"
                value={form.customer_email}
                onChange={(value) =>
                  setForm({ ...form, customer_email: value })
                }
              />

              <BookingInput
                placeholder="Service Needed"
                value={form.service}
                onChange={(value) => setForm({ ...form, service: value })}
              />

              <div className="md:col-span-2">
                <BookingInput
                  type="datetime-local"
                  value={form.booking_date}
                  onChange={(value) =>
                    setForm({ ...form, booking_date: value })
                  }
                />
              </div>
            </div>

            {bookingQuestions.length > 0 && (
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-lg font-black">Additional Questions</h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {bookingQuestions.map((question) => (
                    <label key={question.name} className="block">
                      <span className="mb-2 block text-sm text-slate-300">
                        {question.label}
                        {question.required && (
                          <span className="ml-1 text-red-300">*</span>
                        )}
                      </span>

                      <input
                        type={question.type || "text"}
                        className="booking-input"
                        value={customAnswers[question.name] || ""}
                        onChange={(e) =>
                          handleCustomAnswerChange(
                            question.name,
                            e.target.value
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            <textarea
              placeholder="Notes"
              rows="4"
              className="booking-input mt-4 resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-2xl px-5 py-4 font-black text-white shadow-lg disabled:opacity-70"
              style={{
                background: `linear-gradient(135deg, ${brandColor}, #8b5cf6)`,
              }}
            >
              {submitting ? "Submitting..." : "Request Booking →"}
            </button>

            <p className="mt-5 text-center text-xs text-slate-500">
              Powered by TaskFlow • A Product of AEMA Systems
            </p>
          </form>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-[#111827]/85 p-6 text-white shadow-2xl">
              <div
                className="mb-5 h-2 w-24 rounded-full"
                style={{ background: brandColor }}
              />

              <h3 className="text-2xl font-black">
                {business.business_name}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {business.business_description ||
                  "Submit your booking request and the business will respond as soon as possible."}
              </p>

              <div className="mt-6 space-y-4">
                <InfoItem icon={Clock} title="Response Time" value="Within 24 hours" />
                <InfoItem icon={CalendarDays} title="Booking Type" value="Request-based booking" />
                {business.business_phone && (
                  <InfoItem icon={Phone} title="Phone" value={business.business_phone} />
                )}
                {business.business_email && (
                  <InfoItem icon={Mail} title="Email" value={business.business_email} />
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#111827]/85 p-6 text-white shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <Sparkles size={20} />
                </div>

                <div>
                  <h3 className="font-black">Secure Request</h3>
                  <p className="text-sm text-slate-400">
                    Your details are sent directly to the business.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#0e749030,transparent_30%),radial-gradient(circle_at_top_right,#7c3aed30,transparent_30%),linear-gradient(135deg,#020617,#0f172a,#020617)] px-4 py-8">
      {children}
    </div>
  );
}

function BookingInput({ type = "text", placeholder, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="booking-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function InfoItem({ icon: Icon, title, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}