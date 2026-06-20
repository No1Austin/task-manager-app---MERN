export default function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-500/15 text-amber-300",
    completed: "bg-emerald-500/15 text-emerald-300",
    cancelled: "bg-red-500/15 text-red-300",
  };

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-black capitalize ${
        styles[status] || styles.pending
      }`}
    >
      {status}
    </span>
  );
}