const now = new Date();

function daysBetween(date) {
  if (!date) return null;
  const diff = new Date(date) - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function normalize(text = "") {
  return String(text).toLowerCase().trim();
}

function getId(item) {
  return item?._id || item?.id;
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
  const status = booking.status || "pending";

  if (status === "pending") score += 40;

  const daysSinceCreated = booking.created_at
    ? Math.floor((now - new Date(booking.created_at)) / (1000 * 60 * 60 * 24))
    : 0;

  if (daysSinceCreated >= 3) score += 25;
  if (daysSinceCreated >= 7) score += 40;

  return score;
}

export function buildMemoryInsights({ tasks = [], bookings = [], contacts = [] }) {
  const openTasks = tasks.filter((task) => task.status !== "Completed");

  const riskyTasks = openTasks
    .map((task) => ({
      ...task,
      riskScore: taskRiskScore(task),
    }))
    .sort((a, b) => b.riskScore - a.riskScore);

  const riskyBookings = bookings
    .filter((booking) => (booking.status || "pending") !== "completed")
    .map((booking) => ({
      ...booking,
      riskScore: bookingRiskScore(booking),
    }))
    .sort((a, b) => b.riskScore - a.riskScore);

  const overdueTasks = riskyTasks.filter(
    (task) => task.deadline && new Date(task.deadline) < now
  );

  const pendingBookings = bookings.filter(
    (booking) => (booking.status || "pending") === "pending"
  );

  const recentContacts = [...contacts]
    .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
    .slice(0, 5);

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
      id: getId(task),
      type: "task",
      title: task.title,
      reason: "This task needs attention based on deadline, priority and status.",
      score: task.riskScore,
      actions: ["view_task", "mark_completed", "edit_task"],
    })),

    followUps: riskyBookings.slice(0, 5).map((booking) => ({
      id: getId(booking),
      type: "booking",
      title: booking.customer_name || "Unnamed customer",
      reason: "This booking is still pending and may need follow-up.",
      action: booking.customer_phone ? "Send WhatsApp follow-up" : "Send email follow-up",
      score: booking.riskScore,
      actions: ["view_booking", "mark_completed", "send_whatsapp", "send_email"],
    })),

    recentContacts: recentContacts.map((contact) => ({
      id: getId(contact),
      type: "contact",
      title: contact.name || "Unnamed contact",
      phone: contact.phone,
      email: contact.email,
      group: contact.group,
      label: contact.label,
      actions: ["view_contact", "send_whatsapp", "send_email", "add_followup", "add_to_group"],
    })),
  };
}

export function searchMemoryData(query, { tasks = [], bookings = [], contacts = [] }) {
  const term = normalize(query);

  const matchedContacts = contacts.filter((contact) =>
    [
      contact.name,
      contact.phone,
      contact.email,
      contact.company,
      contact.label,
      contact.group,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term)
  );

  const matchedBookings = bookings.filter((booking) =>
    [
      booking.customer_name,
      booking.customer_phone,
      booking.customer_email,
      booking.service,
      booking.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term)
  );

  const matchedTasks = tasks.filter((task) =>
    [
      task.title,
      task.description,
      task.status,
      task.priority,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term)
  );

  return {
    contacts: matchedContacts,
    bookings: matchedBookings,
    tasks: matchedTasks,
  };
}

export function understandMemoryCommand(message) {
  const text = normalize(message);

  if (
    text.includes("create contact") ||
    text.includes("add contact") ||
    text.includes("new contact")
  ) {
    return { intent: "create_contact" };
  }

  if (
    text.includes("find contact") ||
    text.includes("search contact") ||
    text.includes("show contact") ||
    text.includes("get contact")
  ) {
    return { intent: "fetch_contact" };
  }

  if (
    text.includes("find booking") ||
    text.includes("search booking") ||
    text.includes("show booking") ||
    text.includes("get booking")
  ) {
    return { intent: "fetch_booking" };
  }

  if (
    text.includes("pending booking") ||
    text.includes("bookings pending") ||
    text.includes("uncompleted booking")
  ) {
    return { intent: "pending_bookings" };
  }

  if (
    text.includes("overdue") ||
    text.includes("late task") ||
    text.includes("tasks behind")
  ) {
    return { intent: "overdue_tasks" };
  }

  if (
    text.includes("follow up") ||
    text.includes("follow-up") ||
    text.includes("who should i contact")
  ) {
    return { intent: "followups" };
  }

  if (
    text.includes("business health") ||
    text.includes("how is my business") ||
    text.includes("business performance")
  ) {
    return { intent: "business_health" };
  }

  return { intent: "general_search" };
}

export function generateMemoryResponse(message, data) {
  const command = understandMemoryCommand(message);
  const insights = buildMemoryInsights(data);
  const results = searchMemoryData(message, data);

  if (command.intent === "create_contact") {
    return {
      type: "action",
      message: "I can help you create a new contact.",
      action: "open_create_contact_modal",
    };
  }

  if (command.intent === "fetch_contact") {
    return {
      type: "contacts",
      message:
        results.contacts.length > 0
          ? `I found ${results.contacts.length} matching contact(s).`
          : "I could not find a matching contact.",
      data: results.contacts,
      actions: ["view_contact", "send_whatsapp", "send_email", "add_followup", "add_to_group"],
    };
  }

  if (command.intent === "fetch_booking") {
    return {
      type: "bookings",
      message:
        results.bookings.length > 0
          ? `I found ${results.bookings.length} matching booking(s).`
          : "I could not find a matching booking.",
      data: results.bookings,
      actions: ["view_booking", "mark_completed", "send_whatsapp", "send_email", "add_to_group"],
    };
  }

  if (command.intent === "pending_bookings") {
    const pending = data.bookings.filter(
      (booking) => (booking.status || "pending") === "pending"
    );

    return {
      type: "bookings",
      message: `You have ${pending.length} pending booking(s).`,
      data: pending,
      actions: ["view_booking", "mark_completed", "send_whatsapp", "send_email"],
    };
  }

  if (command.intent === "overdue_tasks") {
    const overdue = data.tasks.filter(
      (task) =>
        task.status !== "Completed" &&
        task.deadline &&
        new Date(task.deadline) < now
    );

    return {
      type: "tasks",
      message: `You have ${overdue.length} overdue task(s).`,
      data: overdue,
      actions: ["view_task", "mark_completed", "edit_task"],
    };
  }

  if (command.intent === "followups") {
    return {
      type: "followups",
      message: "Here are the customers and bookings that need attention.",
      data: insights.followUps,
    };
  }

  if (command.intent === "business_health") {
    return {
      type: "business_health",
      message: `Your business has ${insights.summary.overdueTasks} overdue task(s), ${insights.summary.pendingBookings} pending booking(s), and ${insights.summary.contacts} contact(s). Top risk: ${insights.summary.topRisk}.`,
      data: insights,
    };
  }

  return {
    type: "search",
    message: "I searched your contacts, bookings and tasks.",
    data: results,
  };
}