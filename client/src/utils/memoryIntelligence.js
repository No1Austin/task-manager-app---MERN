const now = new Date();

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
    ? Math.floor(
        (now - new Date(booking.created_at)) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  if (daysSinceCreated >= 3) score += 25;
  if (daysSinceCreated >= 7) score += 40;

  return score;
}

export function buildMemoryInsights({
  tasks = [],
  bookings = [],
  contacts = [],
}) {
  const openTasks = tasks.filter(
    (task) => task.status !== "Completed"
  );

  const riskyTasks = openTasks
    .map((task) => ({
      ...task,
      riskScore: taskRiskScore(task),
    }))
    .sort((a, b) => b.riskScore - a.riskScore);

  const riskyBookings = bookings
    .map((booking) => ({
      ...booking,
      riskScore: bookingRiskScore(booking),
    }))
    .sort((a, b) => b.riskScore - a.riskScore);

  const overdueTasks = riskyTasks.filter(
    (task) =>
      task.deadline &&
      new Date(task.deadline) < now
  );

  return {
    summary: {
      overdueTasks: overdueTasks.length,
      pendingBookings: riskyBookings.length,
      contacts: contacts.length,
      topRisk:
        riskyTasks[0]?.title ||
        riskyBookings[0]?.customer_name ||
        "No major risk",
    },

    todayFocus: riskyTasks.slice(0, 5).map((task) => ({
      title: task.title,
      reason:
        "This task requires attention based on deadline, priority and status.",
      score: task.riskScore,
    })),

    followUps: riskyBookings.slice(0, 5).map((booking) => ({
      title: booking.customer_name,
      reason:
        "Customer booking is still pending.",
      action: booking.customer_phone
        ? "Send WhatsApp follow-up"
        : "Send email follow-up",
      score: booking.riskScore,
    })),
  };
}