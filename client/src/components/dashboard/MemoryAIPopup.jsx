import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock,
  MessageCircle,
  RefreshCcw,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import API from "../../services/api";

export default function MemoryAIPopup() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi, I’m AEMA AI. Ask me questions relating to your bookings, contacts, tasks, or follow-ups.",
    },
  ]);

  const [tasks, setTasks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [memoryLoading, setMemoryLoading] = useState(false);

  const chatEndRef = useRef(null);

  const fetchMemoryData = async () => {
    try {
      setMemoryLoading(true);

      const [tasksRes, bookingsRes, contactsRes] = await Promise.allSettled([
        API.get("/tasks"),
        API.get("/bookings/my-bookings"),
        API.get("/contacts"),
      ]);

      if (tasksRes.status === "fulfilled") {
        setTasks(tasksRes.value.data || []);
      }

      if (bookingsRes.status === "fulfilled") {
        setBookings(bookingsRes.value.data || []);
      }

      if (contactsRes.status === "fulfilled") {
        setContacts(contactsRes.value.data || []);
      }
    } catch (error) {
      console.error("Failed to load Memory AI data:", error);
    } finally {
      setMemoryLoading(false);
    }
  };

  useEffect(() => {
    fetchMemoryData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const taskStats = useMemo(() => {
    const active = tasks.filter(
      (task) => (task.status || "Pending") !== "Completed"
    );

    const overdue = active.filter((task) => {
      if (!task.deadline) return false;
      return new Date(task.deadline) < new Date();
    });

    const highPriority = active.filter((task) => task.priority === "High");

    return {
      total: tasks.length,
      active: active.length,
      overdue,
      highPriority,
    };
  }, [tasks]);

  const bookingStats = useMemo(() => {
    const pending = bookings.filter(
      (booking) => (booking.status || "pending") === "pending"
    );

    const cancelled = bookings.filter((booking) => booking.status === "cancelled");

    const noEmail = bookings.filter((booking) => !booking.customer_email);

    return {
      total: bookings.length,
      pending,
      cancelled,
      noEmail,
    };
  }, [bookings]);

  const contactStats = useMemo(() => {
    const noPhone = contacts.filter((contact) => !contact.phone);
    const noEmail = contacts.filter((contact) => !contact.email);

    return {
      total: contacts.length,
      noPhone,
      noEmail,
    };
  }, [contacts]);

  const suggestions = useMemo(() => {
    const firstPendingBooking = bookingStats.pending[0];
    const firstOverdueTask = taskStats.overdue[0];
    const firstContact = contacts[0];

    return [
      firstPendingBooking
        ? `Follow up with ${firstPendingBooking.customer_name || "this customer"}.`
        : "Who needs follow-up?",
      firstOverdueTask
        ? `Did you complete "${firstOverdueTask.title || "your overdue task"}"?`
        : "What should I work on today?",
      firstContact
        ? `Does ${firstContact.name || "this contact"} need attention?`
        : "Which customers need attention?",
      "Show my business health.",
    ];
  }, [bookingStats.pending, taskStats.overdue, contacts]);

  const getAIReply = (question) => {
    const q = question.toLowerCase();

    if (memoryLoading) {
      return "I am still loading your business memory. Please try again in a moment.";
    }

    if (q.includes("overdue")) {
      if (taskStats.overdue.length === 0) {
        return "You do not have any overdue tasks right now.";
      }

      return `You have ${taskStats.overdue.length} overdue task(s). Your highest-risk task is "${
        taskStats.overdue[0].title || "Untitled task"
      }" because it is overdue and not completed.`;
    }

    if (q.includes("follow")) {
      if (bookingStats.pending.length > 0) {
        const booking = bookingStats.pending[0];

        return `You should follow up with ${
          booking.customer_name || "a pending customer"
        }. Their booking for ${
          booking.service || "a service"
        } is still pending.`;
      }

      if (tasks.some((task) => String(task.title || "").toLowerCase().includes("follow"))) {
        return "You already have follow-up related tasks. Check your task list and complete the oldest one first.";
      }

      return "I do not see a pending booking that clearly needs follow-up right now.";
    }

    if (q.includes("today") || q.includes("focus") || q.includes("work")) {
      if (taskStats.overdue.length > 0) {
        return `Focus on "${
          taskStats.overdue[0].title || "your overdue task"
        }" first because it is overdue.`;
      }

      if (taskStats.highPriority.length > 0) {
        return `Focus on "${
          taskStats.highPriority[0].title || "your high-priority task"
        }" because it is marked high priority.`;
      }

      if (taskStats.active.length > 0) {
        const firstActive = tasks.find(
          (task) => (task.status || "Pending") !== "Completed"
        );

        return `Focus on "${
          firstActive?.title || "your next active task"
        }" today.`;
      }

      return "You are clear for now. No urgent task is standing out.";
    }

    if (q.includes("booking")) {
      return `You have ${bookingStats.total} booking(s). ${bookingStats.pending.length} are pending, ${bookingStats.cancelled.length} are cancelled, and ${bookingStats.noEmail.length} have no email address.`;
    }

    if (q.includes("contact") || q.includes("customer")) {
      return `You have ${contactStats.total} contact(s). ${contactStats.noEmail.length} have no email, and ${contactStats.noPhone.length} have no phone number.`;
    }

    if (q.includes("health") || q.includes("business")) {
      return `Business health summary: ${taskStats.active} active task(s), ${taskStats.overdue.length} overdue task(s), ${bookingStats.pending.length} pending booking(s), and ${contactStats.total} contact(s). Main risk: ${
        taskStats.overdue.length > 0
          ? "overdue tasks need attention."
          : bookingStats.pending.length > 0
          ? "pending bookings need follow-up."
          : "no major risk found right now."
      }`;
    }

    if (q.includes("email")) {
      return `${bookingStats.noEmail.length} booking(s) and ${contactStats.noEmail.length} contact(s) do not have an email address.`;
    }

    if (q.includes("phone") || q.includes("whatsapp")) {
      return `${contactStats.noPhone.length} contact(s) do not have a phone number. You can follow up faster with customers who have phone numbers saved.`;
    }

    return "I can help you check overdue tasks, pending bookings, contacts, customer follow-ups, missing emails, and what to focus on today.";
  };

  const sendMessage = (text = message) => {
    const cleanText = text.trim();

    if (!cleanText) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: cleanText,
      },
      {
        role: "ai",
        text: getAIReply(cleanText),
      },
    ]);

    setMessage("");
  };

  const quickStats = [
    {
      label: "Tasks",
      value: taskStats.active,
      icon: CheckCircle2,
    },
    {
      label: "Bookings",
      value: bookingStats.pending.length,
      icon: CalendarDays,
    },
    {
      label: "Contacts",
      value: contactStats.total,
      icon: Users,
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[9999] sm:bottom-5 sm:right-5">
      {open && (
        <div className="mb-4 flex h-[min(620px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#020617] text-white shadow-2xl shadow-black/70 sm:rounded-[2rem]">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <Bot size={22} />
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-black">AEMA AI</h3>
                <p className="truncate text-xs text-slate-400">
                  Business Memory Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchMemoryData}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:bg-white/[0.08]"
              >
                <RefreshCcw
                  size={16}
                  className={memoryLoading ? "animate-spin" : ""}
                />
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:bg-white/[0.08]"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-b border-white/10 p-3">
            {quickStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"
              >
                <div className="flex items-center gap-2 text-cyan-300">
                  <item.icon size={15} />
                  <span className="text-[11px] font-bold">{item.label}</span>
                </div>
                <p className="mt-1 text-xl font-black">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  item.role === "user"
                    ? "ml-auto bg-cyan-400 text-slate-950"
                    : "bg-white/[0.06] text-slate-200"
                }`}
              >
                {item.text}
              </div>
            ))}

            <div className="space-y-2 pt-2">
              {suggestions.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  type="button"
                  onClick={() => sendMessage(item)}
                  className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left text-xs leading-5 text-slate-300 hover:bg-white/[0.08]"
                >
                  <Sparkles
                    size={15}
                    className="mt-0.5 shrink-0 text-cyan-300"
                  />
                  <span>{item}</span>
                </button>
              ))}
            </div>

            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="Ask Memory AI..."
                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-500"
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300"
              >
                <Send size={17} />
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-slate-500">
              Reads your tasks, bookings and contacts.
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative grid h-15 w-15 place-items-center rounded-3xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white shadow-2xl shadow-cyan-500/30 sm:h-16 sm:w-16"
      >
        <MessageCircle size={28} />

        <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-red-500 px-1 text-xs font-black">
          AI
        </span>

        {!open && (
          <span className="absolute -left-44 top-2 hidden w-40 rounded-2xl border border-white/10 bg-[#020617] px-3 py-2 text-left text-xs font-bold text-slate-200 shadow-xl md:block">
            Ask AEMA AI
          </span>
        )}
      </button>
    </div>
  );
}