function normalize(message = "") {
  return String(message).trim();
}

function lowerText(message = "") {
  return normalize(message).toLowerCase();
}

function extractEmail(text) {
  return text.match(/[^\s,]+@[^\s,]+\.[^\s,]+/)?.[0]?.trim() || "";
}

function extractPhone(text) {
  return text.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() || "";
}

function cleanName(text, keywords = []) {
  let cleaned = text;

  keywords.forEach((word) => {
    cleaned = cleaned.replace(new RegExp(word, "gi"), "");
  });

  cleaned = cleaned
    .replace(extractEmail(text), "")
    .replace(extractPhone(text), "")
    .replace(/phone|email|name|is|:|,/gi, "")
    .trim();

  return cleaned;
}

export function parseAiAction(message) {
  const text = normalize(message);
  const lower = lowerText(message);

  if (
    lower.includes("create contact") ||
    lower.includes("add contact") ||
    lower.includes("new contact")
  ) {
    return parseCreateContact(text);
  }

  if (
    lower.includes("create booking") ||
    lower.includes("add booking") ||
    lower.includes("new booking") ||
    lower.includes("book ")
  ) {
    return parseCreateBooking(text);
  }

  if (
    lower.includes("create task") ||
    lower.includes("add task") ||
    lower.includes("new task")
  ) {
    return parseCreateTask(text);
  }

  if (
    lower.includes("find contact") ||
    lower.includes("search contact") ||
    lower.includes("show contact") ||
    lower.includes("get contact")
  ) {
    return {
      type: "find_contact",
      confidence: 0.9,
      query: text,
    };
  }

  if (
    lower.includes("find booking") ||
    lower.includes("search booking") ||
    lower.includes("show booking") ||
    lower.includes("get booking")
  ) {
    return {
      type: "find_booking",
      confidence: 0.9,
      query: text,
    };
  }

  if (
    lower.includes("find task") ||
    lower.includes("search task") ||
    lower.includes("show task") ||
    lower.includes("get task")
  ) {
    return {
      type: "find_task",
      confidence: 0.9,
      query: text,
    };
  }

  if (
    lower.includes("pending booking") ||
    lower.includes("pending bookings") ||
    lower.includes("uncompleted booking") ||
    lower.includes("open booking")
  ) {
    return {
      type: "show_pending_bookings",
      confidence: 0.95,
    };
  }

  if (
    lower.includes("overdue") ||
    lower.includes("late task") ||
    lower.includes("tasks behind") ||
    lower.includes("missed deadline")
  ) {
    return {
      type: "show_overdue_tasks",
      confidence: 0.95,
    };
  }

  if (
    lower.includes("follow up") ||
    lower.includes("follow-up") ||
    lower.includes("who needs follow")
  ) {
    return {
      type: "show_followups",
      confidence: 0.95,
    };
  }

  if (
    lower.includes("business health") ||
    lower.includes("how is my business") ||
    lower.includes("business performance") ||
    lower.includes("business status")
  ) {
    return {
      type: "business_health",
      confidence: 0.95,
    };
  }

  if (
    lower.includes("whatsapp") ||
    lower.includes("message contact") ||
    lower.includes("send message")
  ) {
    return {
      type: "whatsapp_contact",
      confidence: 0.75,
      query: text,
    };
  }

  if (
    lower.includes("email contact") ||
    lower.includes("send email") ||
    lower.includes("mail contact")
  ) {
    return {
      type: "email_contact",
      confidence: 0.75,
      query: text,
    };
  }

  return {
    type: "general_query",
    confidence: 0.35,
    query: text,
    message:
      "I can help with contacts, bookings, tasks, follow-ups and business health.",
  };
}

function parseCreateContact(text) {
  const email = extractEmail(text);
  const phone = extractPhone(text);

  const name = cleanName(text, [
    "create contact",
    "add contact",
    "new contact",
    "contact",
    "for",
  ]);

  return {
    type: "create_contact",
    confidence: 0.9,
    payload: {
      name,
      phone,
      email,
      company: "",
      label: "New",
      group: "",
    },
  };
}

function parseCreateBooking(text) {
  const email = extractEmail(text);
  const phone = extractPhone(text);

  const name = cleanName(text, [
    "create booking",
    "add booking",
    "new booking",
    "booking",
    "book",
    "for",
  ]);

  return {
    type: "create_booking",
    confidence: 0.8,
    payload: {
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      service: "",
      booking_date: "",
      notes: text,
      status: "pending",
    },
  };
}

function parseCreateTask(text) {
  const title = text
    .replace(/create task|add task|new task|task/gi, "")
    .trim();

  return {
    type: "create_task",
    confidence: 0.85,
    payload: {
      title: title || "",
      description: "",
      status: "Pending",
      priority: "Medium",
      deadline: "",
    },
  };
}