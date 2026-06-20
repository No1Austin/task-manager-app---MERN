export function isTaskOverdue(task) {
  if (!task.deadline || task.status === "Completed") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(task.deadline);
  deadline.setHours(0, 0, 0, 0);

  return deadline < today;
}

export function isTaskDueSoon(task) {
  if (!task.deadline || task.status === "Completed") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(task.deadline);
  deadline.setHours(0, 0, 0, 0);

  const diffDays =
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays >= 0 && diffDays <= 2;
}

export function formatDateForInput(dateValue) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatFriendlyDate(dateValue) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}