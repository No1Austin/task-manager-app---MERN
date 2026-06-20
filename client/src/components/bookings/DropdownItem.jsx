export default function DropdownItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
  rightContent = null,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
        danger
          ? "text-red-300 hover:bg-red-500/10"
          : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <span className="flex items-center gap-3">
        <Icon size={16} />
        {label}
      </span>

      {rightContent}
    </button>
  );
}