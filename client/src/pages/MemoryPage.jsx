import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Brain,
  CalendarClock,
  Check,
  Eye,
  Mail,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/useAuth";
import UpgradeModal from "../components/UpgradeModal";

const now = new Date();

function getId(item) {
  return item?._id || item?.id;
}

function cleanText(value = "") {
  return String(value).trim();
}

function lower(value = "") {
  return cleanText(value).toLowerCase();
}

function extractEmail(text = "") {
  return text.match(/[^\s,]+@[^\s,]+\.[^\s,]+/)?.[0]?.trim() || "";
}

function extractPhone(text = "") {
  return text.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() || "";
}

function stripKnownWords(text = "", words = []) {
  let cleaned = text;

  words.forEach((word) => {
    cleaned = cleaned.replace(new RegExp(word, "gi"), "");
  });

  return cleaned
    .replace(extractEmail(text), "")
    .replace(extractPhone(text), "")
    .replace(/phone|email|name|is|for|:|,/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function daysBetween(date) {
  if (!date) return null;
  const diff = new Date(date) - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function taskRiskScore(task) {
  let score = 0;
  const daysLeft = daysBetween(task.deadline);

  if (task.status === "Completed") return 0;

  if (task.priority === "High") score += 30;
  if (task.priority === "Medium") score += 15;

  if (task.status === "Pending") score += 15;
  if (task.status === "In Progress") score += 10;

  if (daysLeft !== null) {
    if (daysLeft < 0) score += 50;
    else if (daysLeft === 0) score += 35;
    else if (daysLeft <= 2) score += 25;
    else if (daysLeft <= 5) score += 10;
  }

  return score;
}

function bookingRiskScore(booking) {
  let score = 0;

  if ((booking.status || "pending") === "pending") score += 40;

  const daysSinceCreated = booking.created_at
    ? Math.floor((now - new Date(booking.created_at)) / (1000 * 60 * 60 * 24))
    : 0;

  if (daysSinceCreated >= 3) score += 25;
  if (daysSinceCreated >= 7) score += 40;

  return score;
}

function buildMemoryInsights({ tasks = [], bookings = [], contacts = [] }) {
  const openTasks = tasks.filter((task) => task.status !== "Completed");

  const riskyTasks = openTasks
    .map((task) => ({ ...task, riskScore: taskRiskScore(task) }))
    .sort((a, b) => b.riskScore - a.riskScore);

  const riskyBookings = bookings
    .filter((booking) => (booking.status || "pending") !== "completed")
    .map((booking) => ({ ...booking, riskScore: bookingRiskScore(booking) }))
    .sort((a, b) => b.riskScore - a.riskScore);

  const overdueTasks = riskyTasks.filter(
    (task) => task.deadline && new Date(task.deadline) < now
  );

  const pendingBookings = bookings.filter(
    (booking) => (booking.status || "pending") === "pending"
  );

  return {
    summary: {
      overdueTasks: overdueTasks.length,
      pendingBookings: pendingBookings.length,
      contacts: contacts.length,
      topRisk:
        riskyTasks[0]?.title ||
        riskyBookings[0]?.customer_name ||
        "No major risk",
    },
    todayFocus: riskyTasks.slice(0, 5).map((task) => ({
      ...task,
      title: task.title,
      reason: "This task needs attention based on deadline, priority and status.",
      score: task.riskScore,
    })),
    followUps: riskyBookings.slice(0, 5).map((booking) => ({
      ...booking,
      title: booking.customer_name || "Unnamed customer",
      reason: "This booking is still pending and may need follow-up.",
      action: booking.customer_phone ? "Send WhatsApp follow-up" : "Send email follow-up",
      score: booking.riskScore,
    })),
  };
}

function searchItems(query, items, fields) {
  const term = lower(query);

  return items.filter((item) =>
    fields
      .map((field) => item[field])
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term)
  );
}

function parseCommand(message) {
  const text = cleanText(message);
  const l = lower(text);
  const email = extractEmail(text);
  const phone = extractPhone(text);

  if (l.includes("create contact") || l.includes("add contact") || l.includes("new contact")) {
    return {
      type: "create_contact",
      payload: {
        name: stripKnownWords(text, ["create contact", "add contact", "new contact"]),
        phone,
        email,
        company: "",
        label: "AI Created",
        group: "",
      },
    };
  }

  if (l.includes("create booking") || l.includes("add booking") || l.includes("new booking") || l.startsWith("book ")) {
    return {
      type: "create_booking",
      payload: {
        customer_name: stripKnownWords(text, ["create booking", "add booking", "new booking", "book"]),
        customer_phone: phone,
        customer_email: email,
        service: "General Booking",
        booking_date: "",
        notes: text,
        status: "pending",
      },
    };
  }

  if (l.includes("create task") || l.includes("add task") || l.includes("new task")) {
    return {
      type: "create_task",
      payload: {
        title: stripKnownWords(text, ["create task", "add task", "new task"]),
        description: "",
        status: "Pending",
        priority: "Medium",
        deadline: "",
      },
    };
  }

  if (l.includes("pending booking")) return { type: "pending_bookings" };
  if (l.includes("overdue") || l.includes("late task")) return { type: "overdue_tasks" };
  if (l.includes("follow up") || l.includes("follow-up") || l.includes("who needs follow")) return { type: "followups" };
  if (l.includes("business health") || l.includes("how is my business")) return { type: "business_health" };

  if (l.includes("contact")) {
    return {
      type: "find_contact",
      query: stripKnownWords(text, ["find contact", "show contact", "search contact", "get contact", "contact"]),
    };
  }

  if (l.includes("booking")) {
    return {
      type: "find_booking",
      query: stripKnownWords(text, ["find booking", "show booking", "search booking", "get booking", "booking"]),
    };
  }

  if (l.includes("task")) {
    return {
      type: "find_task",
      query: stripKnownWords(text, ["find task", "show task", "search task", "get task", "task"]),
    };
  }

  return {
    type: "general_search",
    query: text,
  };
}

export default function MemoryPage() {
  const { isPro } = useAuth();

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [aiMessage, setAiMessage] = useState("");
  const [result, setResult] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [contactModal, setContactModal] = useState(null);
  const [bookingModal, setBookingModal] = useState(null);
  const [taskModal, setTaskModal] = useState(null);

  const loadMemoryData = async () => {
    try {
      setLoading(true);

      const [tasksRes, bookingsRes, contactsRes] = await Promise.allSettled([
        API.get("/tasks"),
        API.get("/bookings/my-bookings"),
        API.get("/contacts"),
      ]);

      if (tasksRes.status === "fulfilled") setTasks(tasksRes.value.data || []);
      if (bookingsRes.status === "fulfilled") setBookings(bookingsRes.value.data || []);
      if (contactsRes.status === "fulfilled") setContacts(contactsRes.value.data || []);
    } catch (error) {
      console.error("Memory AI load failed:", error);
      toast.error("Failed to load Memory AI data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPro) loadMemoryData();
  }, [isPro]);

  const insights = useMemo(() => {
    return buildMemoryInsights({ tasks, bookings, contacts });
  }, [tasks, bookings, contacts]);

  const createContact = async (payload) => {
    if (!payload.name) {
      setContactModal(payload);
      toast.error("Contact name is required");
      return;
    }

    try {
      const { data } = await API.post("/contacts", payload);
      const created = data || { ...payload, id: crypto.randomUUID() };

      setContacts((prev) => [created, ...prev]);

      setResult({
        type: "contact_created",
        message: `${payload.name} has been added to your contacts.`,
        contacts: [created],
      });

      toast.success("Contact created");
    } catch (error) {
      console.error("Create contact failed:", error);
      toast.error("Failed to create contact");
    }
  };

  const createBooking = async (payload) => {
    if (!payload.customer_name) {
      setBookingModal(payload);
      toast.error("Customer name is required");
      return;
    }

    try {
      let response;

      try {
        response = await API.post("/bookings", payload);
      } catch {
        response = await API.post("/bookings/my-bookings", payload);
      }

      const created = response.data || { ...payload, id: crypto.randomUUID() };

      setBookings((prev) => [created, ...prev]);

      setResult({
        type: "booking_created",
        message: `Booking for ${payload.customer_name} has been created.`,
        bookings: [created],
      });

      toast.success("Booking created");
    } catch (error) {
      console.error("Create booking failed:", error);
      toast.error("Failed to create booking");
    }
  };

  const createTask = async (payload) => {
    if (!payload.title) {
      setTaskModal(payload);
      toast.error("Task title is required");
      return;
    }

    try {
      const { data } = await API.post("/tasks", payload);
      const created = data || { ...payload, id: crypto.randomUUID() };

      setTasks((prev) => [created, ...prev]);

      setResult({
        type: "task_created",
        message: `${payload.title} has been added to your tasks.`,
        tasks: [created],
      });

      toast.success("Task created");
    } catch (error) {
      console.error("Create task failed:", error);
      toast.error("Failed to create task");
    }
  };

  const markBookingCompleted = async (booking) => {
    const id = getId(booking);
    if (!id) return toast.error("Booking ID not found");

    try {
      try {
        await API.patch(`/bookings/${id}`, { status: "completed" });
      } catch {
        await API.put(`/bookings/${id}`, { ...booking, status: "completed" });
      }

      setBookings((prev) =>
        prev.map((item) =>
          getId(item) === id ? { ...item, status: "completed" } : item
        )
      );

      toast.success("Booking completed");
    } catch (error) {
      console.error("Complete booking failed:", error);
      toast.error("Failed to complete booking");
    }
  };

  const markTaskCompleted = async (task) => {
    const id = getId(task);
    if (!id) return toast.error("Task ID not found");

    try {
      try {
        await API.patch(`/tasks/${id}`, { status: "Completed" });
      } catch {
        await API.put(`/tasks/${id}`, { ...task, status: "Completed" });
      }

      setTasks((prev) =>
        prev.map((item) =>
          getId(item) === id ? { ...item, status: "Completed" } : item
        )
      );

      toast.success("Task completed");
    } catch (error) {
      console.error("Complete task failed:", error);
      toast.error("Failed to complete task");
    }
  };

  const deleteContact = async (contact) => {
    const id = getId(contact);
    if (!id) return toast.error("Contact ID not found");
    if (!window.confirm(`Delete ${contact.name || "this contact"}?`)) return;

    try {
      await API.delete(`/contacts/${id}`);
      setContacts((prev) => prev.filter((item) => getId(item) !== id));
      toast.success("Contact deleted");
    } catch (error) {
      console.error("Delete contact failed:", error);
      toast.error("Failed to delete contact");
    }
  };

  const deleteBooking = async (booking) => {
    const id = getId(booking);
    if (!id) return toast.error("Booking ID not found");
    if (!window.confirm(`Delete booking for ${booking.customer_name || "customer"}?`)) return;

    try {
      try {
        await API.delete(`/bookings/${id}`);
      } catch {
        await API.delete(`/bookings/my-bookings/${id}`);
      }

      setBookings((prev) => prev.filter((item) => getId(item) !== id));
      toast.success("Booking deleted");
    } catch (error) {
      console.error("Delete booking failed:", error);
      toast.error("Failed to delete booking");
    }
  };

  const deleteTask = async (task) => {
    const id = getId(task);
    if (!id) return toast.error("Task ID not found");
    if (!window.confirm(`Delete ${task.title || "this task"}?`)) return;

    try {
      await API.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((item) => getId(item) !== id));
      toast.success("Task deleted");
    } catch (error) {
      console.error("Delete task failed:", error);
      toast.error("Failed to delete task");
    }
  };

  const addFollowUpTask = async (item) => {
    const title = window.prompt(
      "Follow-up task title:",
      `Follow up with ${item.name || item.customer_name || "customer"}`
    );

    if (!title) return;

    await createTask({
      title,
      description: `Follow-up created from Memory AI for ${
        item.name || item.customer_name || "customer"
      }.`,
      status: "Pending",
      priority: "Medium",
      deadline: "",
    });
  };

  const runMemoryAI = async (message) => {
    const command = parseCommand(message);

    if (command.type === "create_contact") return createContact(command.payload);
    if (command.type === "create_booking") return createBooking(command.payload);
    if (command.type === "create_task") return createTask(command.payload);

    if (command.type === "pending_bookings") {
      const found = bookings.filter((booking) => (booking.status || "pending") === "pending");

      return setResult({
        type: "pending_bookings",
        message: `I found ${found.length} pending booking(s).`,
        bookings: found,
      });
    }

    if (command.type === "overdue_tasks") {
      const found = tasks.filter(
        (task) =>
          task.status !== "Completed" &&
          task.deadline &&
          new Date(task.deadline) < new Date()
      );

      return setResult({
        type: "overdue_tasks",
        message: `I found ${found.length} overdue task(s).`,
        tasks: found,
      });
    }

    if (command.type === "followups") {
      return setResult({
        type: "followups",
        message: "These customers or bookings need attention.",
        bookings: insights.followUps,
      });
    }

    if (command.type === "business_health") {
      return setResult({
        type: "business_health",
        message: `Business health summary: ${insights.summary.overdueTasks} overdue task(s), ${insights.summary.pendingBookings} pending booking(s), and ${insights.summary.contacts} contact(s). Top risk: ${insights.summary.topRisk}.`,
      });
    }

    if (command.type === "find_contact") {
      const found = searchItems(command.query || message, contacts, [
        "name",
        "phone",
        "email",
        "company",
        "label",
        "group",
      ]);

      return setResult({
        type: "contacts",
        message: `I found ${found.length} matching contact(s).`,
        contacts: found,
      });
    }

    if (command.type === "find_booking") {
      const found = searchItems(command.query || message, bookings, [
        "customer_name",
        "customer_phone",
        "customer_email",
        "service",
        "status",
      ]);

      return setResult({
        type: "bookings",
        message: `I found ${found.length} matching booking(s).`,
        bookings: found,
      });
    }

    if (command.type === "find_task") {
      const found = searchItems(command.query || message, tasks, [
        "title",
        "description",
        "status",
        "priority",
      ]);

      return setResult({
        type: "tasks",
        message: `I found ${found.length} matching task(s).`,
        tasks: found,
      });
    }

    const foundContacts = searchItems(message, contacts, [
      "name",
      "phone",
      "email",
      "company",
      "label",
      "group",
    ]);

    const foundBookings = searchItems(message, bookings, [
      "customer_name",
      "customer_phone",
      "customer_email",
      "service",
      "status",
    ]);

    const foundTasks = searchItems(message, tasks, [
      "title",
      "description",
      "status",
      "priority",
    ]);

    setResult({
      type: "search",
      message: `I searched contacts, bookings and tasks. Found ${foundContacts.length} contact(s), ${foundBookings.length} booking(s), and ${foundTasks.length} task(s).`,
      contacts: foundContacts,
      bookings: foundBookings,
      tasks: foundTasks,
    });
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const message = aiMessage;
    setAiMessage("");
    await runMemoryAI(message);
  };

  const quickPrompts = [
    "Who needs follow-up?",
    "Show pending bookings",
    "Show overdue tasks",
    "Show business health",
    "Find contact John",
    "Create contact for James phone 4371234567",
  ];

  if (!isPro) {
    return (
      <div className="min-h-screen bg-[#050816] px-5 py-8 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-400/15 text-violet-300">
            <Brain size={30} />
          </div>

          <h1 className="mt-5 text-3xl font-black">Memory AI is a Pro Feature</h1>

          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Upgrade to TaskFlow Pro to ask questions about tasks, bookings,
            contacts and follow-ups.
          </p>

          <button
            type="button"
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#0e749030,transparent_30%),radial-gradient(circle_at_top_right,#7c3aed30,transparent_30%),linear-gradient(135deg,#020617,#0f172a,#020617)] px-4 py-6 text-white md:px-6 md:py-8">
      {contactModal && (
        <ContactModal
          initial={contactModal}
          onClose={() => setContactModal(null)}
          onSave={async (payload) => {
            setContactModal(null);
            await createContact(payload);
          }}
        />
      )}

      {bookingModal && (
        <BookingModal
          initial={bookingModal}
          onClose={() => setBookingModal(null)}
          onSave={async (payload) => {
            setBookingModal(null);
            await createBooking(payload);
          }}
        />
      )}

      {taskModal && (
        <TaskModal
          initial={taskModal}
          onClose={() => setTaskModal(null)}
          onSave={async (payload) => {
            setTaskModal(null);
            await createTask(payload);
          }}
        />
      )}

      {selectedItem && (
        <DetailsModal item={selectedItem.item} type={selectedItem.type} onClose={() => setSelectedItem(null)} />
      )}

      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-[#111827]/80 p-5 shadow-2xl md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300 md:text-sm">
            TaskFlow Intelligence
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-4xl">Memory AI</h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
            Create contacts, create bookings, search customers, complete tasks,
            follow up with leads and check business health.
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-[#111827]/80 p-4 shadow-xl md:p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <Brain size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black md:text-2xl">Ask Memory AI</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Try: “Create contact for James phone 437...”, “Show pending
                bookings”, or “Find contact Sarah”.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => runMemoryAI(prompt)}
                className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/[0.08]"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleAiSubmit} className="mt-5 flex gap-2">
            <input
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              placeholder="Ask Memory AI..."
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
            />

            <button
              type="submit"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white"
            >
              <Send size={18} />
            </button>
          </form>

          {result && (
            <ResultBox
              result={result}
              onClose={() => setResult(null)}
              onView={(type, item) => setSelectedItem({ type, item })}
              onDeleteContact={deleteContact}
              onDeleteBooking={deleteBooking}
              onDeleteTask={deleteTask}
              onCompleteBooking={markBookingCompleted}
              onCompleteTask={markTaskCompleted}
              onAddFollowUp={addFollowUpTask}
            />
          )}
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#111827]/80 p-8 text-slate-400">
            Loading Memory AI...
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 xl:grid-cols-4">
              <InsightStat icon={AlertTriangle} title="Overdue" value={insights.summary.overdueTasks} tone="red" />
              <InsightStat icon={CalendarClock} title="Pending" value={insights.summary.pendingBookings} tone="amber" />
              <InsightStat icon={Users} title="Contacts" value={insights.summary.contacts} tone="cyan" />
              <InsightStat icon={Sparkles} title="Top Risk" value={insights.summary.topRisk} wide />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <InsightPanel title="Today’s Focus" description="Tasks Memory AI recommends first." emptyText="No urgent task focus for now." items={insights.todayFocus} />
              <InsightPanel title="Follow-up Recommendations" description="Customers or bookings needing attention." emptyText="No follow-ups needed right now." items={insights.followUps} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResultBox({
  result,
  onClose,
  onView,
  onDeleteContact,
  onDeleteBooking,
  onDeleteTask,
  onCompleteBooking,
  onCompleteTask,
  onAddFollowUp,
}) {
  return (
    <div className="mt-5 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
            Memory AI Response
          </p>

          <h3 className="mt-2 text-lg font-black capitalize text-white">
            {result.type?.replaceAll("_", " ") || "Result"}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:bg-white/[0.08]"
        >
          <X size={16} />
        </button>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-300">{result.message}</p>

      <div className="mt-5 space-y-3">
        {(result.contacts || []).map((contact) => (
          <ContactResultCard
            key={getId(contact)}
            contact={contact}
            onView={() => onView("contact", contact)}
            onDelete={() => onDeleteContact(contact)}
            onAddFollowUp={() => onAddFollowUp(contact)}
          />
        ))}

        {(result.bookings || []).map((booking) => (
          <BookingResultCard
            key={getId(booking)}
            booking={booking}
            onView={() => onView("booking", booking)}
            onDelete={() => onDeleteBooking(booking)}
            onComplete={() => onCompleteBooking(booking)}
            onAddFollowUp={() => onAddFollowUp(booking)}
          />
        ))}

        {(result.tasks || []).map((task) => (
          <TaskResultCard
            key={getId(task)}
            task={task}
            onView={() => onView("task", task)}
            onDelete={() => onDeleteTask(task)}
            onComplete={() => onCompleteTask(task)}
          />
        ))}
      </div>
    </div>
  );
}

function ContactResultCard({ contact, onView, onDelete, onAddFollowUp }) {
  const phone = contact.phone;
  const email = contact.email;
  const whatsappNumber = phone ? String(phone).replace(/\D/g, "") : "";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <h4 className="font-black text-white">{contact.name || "Unnamed contact"}</h4>
      <p className="mt-1 text-sm text-slate-400">{contact.company || contact.label || contact.group || "Customer"}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {phone && (
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300">
            <MessageCircle size={14} />
            WhatsApp
          </a>
        )}

        {email && (
          <a href={`mailto:${email}`} className="inline-flex items-center gap-1 rounded-xl bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-300">
            <Mail size={14} />
            Email
          </a>
        )}

        <ActionButton icon={Eye} label="View" onClick={onView} />
        <ActionButton icon={Plus} label="Follow-up" onClick={onAddFollowUp} />
        <ActionButton icon={Trash2} label="Delete" onClick={onDelete} danger />
      </div>
    </div>
  );
}

function BookingResultCard({ booking, onView, onDelete, onComplete, onAddFollowUp }) {
  const phone = booking.customer_phone;
  const email = booking.customer_email;
  const whatsappNumber = phone ? String(phone).replace(/\D/g, "") : "";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <h4 className="font-black text-white">{booking.customer_name || "Unnamed booking"}</h4>
      <p className="mt-1 text-sm text-slate-400">
        {booking.service || "No service"} • {booking.status || "pending"}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {phone && (
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300">
            <MessageCircle size={14} />
            WhatsApp
          </a>
        )}

        {email && (
          <a href={`mailto:${email}`} className="inline-flex items-center gap-1 rounded-xl bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-300">
            <Mail size={14} />
            Email
          </a>
        )}

        <ActionButton icon={Eye} label="View" onClick={onView} />
        <ActionButton icon={Check} label="Complete" onClick={onComplete} />
        <ActionButton icon={Plus} label="Follow-up" onClick={onAddFollowUp} />
        <ActionButton icon={Trash2} label="Delete" onClick={onDelete} danger />
      </div>
    </div>
  );
}

function TaskResultCard({ task, onView, onDelete, onComplete }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <h4 className="font-black text-white">{task.title || "Untitled task"}</h4>
      <p className="mt-1 text-sm text-slate-400">
        {task.priority || "No priority"} • {task.status || "Pending"}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton icon={Eye} label="View" onClick={onView} />
        <ActionButton icon={Check} label="Complete" onClick={onComplete} />
        <ActionButton icon={Trash2} label="Delete" onClick={onDelete} danger />
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold ${
        danger
          ? "bg-red-500/10 text-red-300 hover:bg-red-500/20"
          : "border border-white/10 text-slate-300 hover:bg-white/10"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function ContactModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    phone: initial.phone || "",
    email: initial.email || "",
    company: initial.company || "",
    label: initial.label || "AI Created",
    group: initial.group || "",
  });

  return (
    <ModalShell title="Create Contact" onClose={onClose}>
      <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
      <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
      <Input label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
      <Input label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} />

      <SaveCancel onClose={onClose} onSave={() => onSave(form)} />
    </ModalShell>
  );
}

function BookingModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    customer_name: initial.customer_name || "",
    customer_phone: initial.customer_phone || "",
    customer_email: initial.customer_email || "",
    service: initial.service || "General Booking",
    booking_date: initial.booking_date || "",
    notes: initial.notes || "",
    status: initial.status || "pending",
  });

  return (
    <ModalShell title="Create Booking" onClose={onClose}>
      <Input label="Customer Name" value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} />
      <Input label="Phone" value={form.customer_phone} onChange={(v) => setForm({ ...form, customer_phone: v })} />
      <Input label="Email" value={form.customer_email} onChange={(v) => setForm({ ...form, customer_email: v })} />
      <Input label="Service" value={form.service} onChange={(v) => setForm({ ...form, service: v })} />
      <Input label="Booking Date" type="datetime-local" value={form.booking_date} onChange={(v) => setForm({ ...form, booking_date: v })} />
      <Input label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />

      <SaveCancel onClose={onClose} onSave={() => onSave(form)} />
    </ModalShell>
  );
}

function TaskModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    status: initial.status || "Pending",
    priority: initial.priority || "Medium",
    deadline: initial.deadline || "",
  });

  return (
    <ModalShell title="Create Task" onClose={onClose}>
      <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <Input label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
      <Input label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} />
      <Input label="Deadline" type="datetime-local" value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })} />

      <SaveCancel onClose={onClose} onSave={() => onSave(form)} />
    </ModalShell>
  );
}

function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#020617] p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-black">{title}</h2>

          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 p-2 text-slate-300">
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
      />
    </label>
  );
}

function SaveCancel({ onClose, onSave }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 py-3 text-sm font-bold text-slate-300">
        Cancel
      </button>

      <button type="button" onClick={onSave} className="rounded-2xl bg-cyan-400 py-3 text-sm font-black text-slate-950">
        Save
      </button>
    </div>
  );
}

function DetailsModal({ item, type, onClose }) {
  return (
    <ModalShell title={`${type} Details`} onClose={onClose}>
      <pre className="max-h-[420px] overflow-auto rounded-2xl bg-black/30 p-4 text-xs text-slate-300">
        {JSON.stringify(item, null, 2)}
      </pre>
    </ModalShell>
  );
}

function InsightStat({ icon: Icon, title, value, tone = "cyan", wide = false }) {
  const toneClass =
    tone === "red"
      ? "bg-red-500/10 text-red-300"
      : tone === "amber"
      ? "bg-amber-500/10 text-amber-300"
      : "bg-cyan-400/10 text-cyan-300";

  return (
    <div className={`rounded-2xl border border-white/10 bg-[#111827]/80 p-4 shadow-xl md:rounded-3xl md:p-5 ${wide ? "col-span-2 xl:col-span-1" : ""}`}>
      <div className={`mb-3 grid h-10 w-10 place-items-center rounded-2xl md:mb-4 md:h-11 md:w-11 ${toneClass}`}>
        <Icon size={20} />
      </div>

      <p className="text-xs text-slate-400 md:text-sm">{title}</p>
      <h3 className="mt-2 line-clamp-2 text-xl font-black text-white md:text-2xl">{value}</h3>
    </div>
  );
}

function InsightPanel({ title, description, items, emptyText }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827]/80 p-5 shadow-xl md:p-6">
      <h2 className="text-xl font-black md:text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{description}</p>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
            {emptyText}
          </div>
        ) : (
          items.map((item, index) => (
            <div key={`${item.title}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-black text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.reason}</p>

                  {item.action && (
                    <p className="mt-2 text-sm font-semibold text-cyan-300">
                      Recommended: {item.action}
                    </p>
                  )}
                </div>

                {typeof item.score === "number" && (
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-300">
                    {item.score}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}