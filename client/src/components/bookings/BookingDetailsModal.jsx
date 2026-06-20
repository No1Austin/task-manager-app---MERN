export default function BookingDetailsModal({ booking, label, group, onClose }) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1020] p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Booking Details</h2>

            <p className="mt-1 text-sm text-slate-400">
              Customer booking information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-3 py-2 text-slate-300 hover:bg-white/[0.06]"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <DetailRow label="Customer" value={booking.customer_name} />
          <DetailRow label="Phone" value={booking.customer_phone} />
          <DetailRow label="Email" value={booking.customer_email} />
          <DetailRow label="Service" value={booking.service} />
          <DetailRow label="Label" value={label} />
          <DetailRow label="Group" value={group?.name} />
          <DetailRow
            label="Booking Date"
            value={
              booking.booking_date
                ? new Date(booking.booking_date).toLocaleString()
                : "Not set"
            }
          />
          <DetailRow label="Status" value={booking.status || "pending"} />
          <DetailRow
            label="Created"
            value={
              booking.created_at
                ? new Date(booking.created_at).toLocaleDateString()
                : "Not set"
            }
          />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-200">{value || "N/A"}</p>
    </div>
  );
}