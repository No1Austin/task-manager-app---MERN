import {
  CalendarDays,
  Check,
  Mail,
  MessageCircle,
  Phone,
  User,
} from "lucide-react";

import StatusBadge from "./StatusBadge";
import BookingActionsDropdown from "./BookingActionsDropdown";

export default function BookingRow({
  booking,
  label,
  group,
  groups,
  openMenu,
  setOpenMenu,
  expandedGroupMenu,
  setExpandedGroupMenu,
  onMarkCompleted,
  onAction,
  onAddToGroup,
}) {
  const status = booking.status || "pending";
  const completed = status === "completed";

  const whatsappNumber = booking.customer_phone
    ? booking.customer_phone.replace(/\D/g, "")
    : "";

  return (
    <div className="relative border-b border-white/10 bg-[#0f172a]/70 px-4 py-4 last:border-b-0 lg:grid lg:grid-cols-[1.4fr_1fr_1fr_0.7fr_0.8fr_1fr] lg:items-center lg:gap-4">
      {/* Mobile dropdown top-right */}
      <div className="absolute right-3 top-3 z-50 lg:hidden">
        <BookingActionsDropdown
          booking={booking}
          groups={groups}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          expandedGroupMenu={expandedGroupMenu}
          setExpandedGroupMenu={setExpandedGroupMenu}
          onAction={onAction}
          onAddToGroup={onAddToGroup}
        />
      </div>

      {/* Customer */}
      <div className="flex items-start gap-3 pr-12 lg:pr-0">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <User size={20} />
        </div>

        <div className="min-w-0">
          <p className="break-words pr-1 font-black text-white">
            {booking.customer_name || "Unnamed customer"}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {group && (
              <span className="rounded-full bg-violet-500/15 px-2 py-1 text-xs font-bold text-violet-300">
                Group: {group.name}
              </span>
            )}

            {label && (
              <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-xs font-bold text-cyan-300">
                Label: {label}
              </span>
            )}
          </div>

          <div className="mt-2 space-y-1 text-sm text-slate-400">
            <p className="flex items-center gap-2 break-all">
              <Phone size={14} className="shrink-0" />
              {booking.customer_phone || "No phone"}
            </p>

            <p className="flex items-center gap-2 break-all">
              <Mail size={14} className="shrink-0" />
              {booking.customer_email || "No email"}
            </p>
          </div>
        </div>
      </div>

      {/* Service */}
      <div className="mt-4 break-words text-sm font-semibold text-slate-200 lg:mt-0">
        {booking.service || "No service"}
      </div>

      {/* Booking Date */}
      <div className="mt-3 flex items-start gap-2 text-sm text-slate-300 lg:mt-0">
        <CalendarDays size={15} className="mt-0.5 shrink-0" />
        <span className="break-words">
          {booking.booking_date
            ? new Date(booking.booking_date).toLocaleString()
            : "Not set"}
        </span>
      </div>

      <div className="mt-3 lg:mt-0">
        <StatusBadge status={status} />
      </div>

      <div className="mt-3 text-sm text-slate-300 lg:mt-0">
        {booking.created_at
          ? new Date(booking.created_at).toLocaleDateString()
          : "Not set"}
      </div>

      {/* Mobile stacked action buttons */}
      <div className="absolute right-3 top-14 z-40 flex flex-col items-end gap-2 lg:hidden">
        {booking.customer_phone && (
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-green-500/10 px-2 text-[11px] font-bold text-green-300 hover:bg-green-500/20"
          >
            <MessageCircle size={13} />
            WA
          </a>
        )}

        {booking.customer_email && (
          <a
            href={`mailto:${booking.customer_email}`}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-cyan-500/10 px-2 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20"
          >
            <Mail size={13} />
            Email
          </a>
        )}

        <button
          type="button"
          onClick={() => onMarkCompleted(booking.id)}
          disabled={completed}
          className={`inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-black transition ${
            completed
              ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
              : "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 hover:opacity-90"
          }`}
        >
          <Check size={13} />
          {completed ? "Done" : "Done?"}
        </button>
      </div>

      {/* Desktop action buttons */}
      <div className="relative z-50 hidden items-center justify-end gap-2 lg:flex">
        {booking.customer_phone && (
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-green-500/10 px-3 text-sm font-bold text-green-300 hover:bg-green-500/20"
          >
            <MessageCircle size={15} />
            WhatsApp
          </a>
        )}

        {booking.customer_email && (
          <a
            href={`mailto:${booking.customer_email}`}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-cyan-500/10 px-3 text-sm font-bold text-cyan-300 hover:bg-cyan-500/20"
          >
            <Mail size={15} />
            Email
          </a>
        )}

        <button
          type="button"
          onClick={() => onMarkCompleted(booking.id)}
          disabled={completed}
          className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-black transition ${
            completed
              ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
              : "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 hover:opacity-90"
          }`}
        >
          <Check size={15} />
          {completed ? "Done" : "Complete"}
        </button>

        <BookingActionsDropdown
          booking={booking}
          groups={groups}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          expandedGroupMenu={expandedGroupMenu}
          setExpandedGroupMenu={setExpandedGroupMenu}
          onAction={onAction}
          onAddToGroup={onAddToGroup}
        />
      </div>
    </div>
  );
}