export function parseAiAction(message) {
  const text = message.trim();

  const lower = text.toLowerCase();

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

  return {
    type: "unknown",
    confidence: 0,
    message:
      "I can help create contacts and bookings. Try: Create contact for James, phone 437..., email james@email.com",
  };
}

function parseCreateContact(text) {
  const emailMatch = text.match(/[^\s,]+@[^\s,]+\.[^\s,]+/);
  const phoneMatch = text.match(/(\+?\d[\d\s().-]{7,}\d)/);

  const cleaned = text
    .replace(/create contact|add contact|new contact|for/gi, "")
    .replace(emailMatch?.[0] || "", "")
    .replace(phoneMatch?.[0] || "", "")
    .replace(/phone|email|name|is|:/gi, "")
    .trim()
    .replace(/,+$/, "");

  return {
    type: "create_contact",
    confidence: 0.75,
    payload: {
      name: cleaned || "",
      phone: phoneMatch?.[0]?.trim() || "",
      email: emailMatch?.[0]?.trim() || "",
      label: "New",
    },
  };
}

function parseCreateBooking(text) {
  const emailMatch = text.match(/[^\s,]+@[^\s,]+\.[^\s,]+/);
  const phoneMatch = text.match(/(\+?\d[\d\s().-]{7,}\d)/);

  return {
    type: "create_booking",
    confidence: 0.55,
    payload: {
      customer_name: "",
      customer_phone: phoneMatch?.[0]?.trim() || "",
      customer_email: emailMatch?.[0]?.trim() || "",
      service: "",
      booking_date: "",
      notes: text,
    },
  };
}