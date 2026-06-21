import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Archive,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  Search,
  X,
} from "lucide-react";

import API from "../services/api";

import BookingRow from "../components/bookings/BookingRow";
import BookingDetailsModal from "../components/bookings/BookingDetailsModal";
import CreateGroupModal from "../components/bookings/CreateGroupModal";
import LabelModal from "../components/bookings/LabelModal";

const PAGE_SIZE = 10;

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [openMenu, setOpenMenu] = useState(null);
  const [expandedGroupMenu, setExpandedGroupMenu] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [showAttentionPanel, setShowAttentionPanel] = useState(false);

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelBooking, setLabelBooking] = useState(null);
  const [labelValue, setLabelValue] = useState("");

  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpBooking, setFollowUpBooking] = useState(null);

  const [groups, setGroups] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("booking_groups")) || [];
    } catch {
      return [];
    }
  });

  const [bookingGroups, setBookingGroups] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("booking_group_assignments")) || {};
    } catch {
      return {};
    }
  });

  const [bookingLabels, setBookingLabels] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("booking_labels")) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await API.get("/bookings/my-bookings");
        setBookings(data || []);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    localStorage.setItem("booking_groups", JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(
      "booking_group_assignments",
      JSON.stringify(bookingGroups)
    );
  }, [bookingGroups]);

  useEffect(() => {
    localStorage.setItem("booking_labels", JSON.stringify(bookingLabels));
  }, [bookingLabels]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortOrder, showArchived]);

  useEffect(() => {
    const closeMenu = () => {
      setOpenMenu(null);
      setExpandedGroupMenu(null);
    };

    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const { data } = await API.patch(`/bookings/${bookingId}/status`, {
        status,
      });

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, ...data, status } : booking
        )
      );

      toast.success(
        status === "completed"
          ? "Booking marked as completed"
          : status === "archived"
          ? "Booking archived"
          : status === "pending"
          ? "Booking restored"
          : status === "cancelled"
          ? "Booking cancelled"
          : "Booking updated"
      );
    } catch (error) {
      console.error("Failed to update booking:", error);
      toast.error("Failed to update booking");
    }
  };

  const markCompleted = (bookingId) => {
    updateBookingStatus(bookingId, "completed");
  };

  const cancelBooking = (bookingId) => {
    updateBookingStatus(bookingId, "cancelled");
  };

  const createGroup = () => {
    const trimmed = newGroupName.trim();

    if (!trimmed) {
      toast.error("Please enter a group name");
      return;
    }

    const exists = groups.some(
      (group) => group.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      toast.error("Group already exists");
      return;
    }

    const newGroup = {
      id: crypto.randomUUID(),
      name: trimmed,
      createdAt: new Date().toISOString(),
    };

    setGroups((prev) => [newGroup, ...prev]);
    setNewGroupName("");
    setShowCreateGroupModal(false);
    toast.success("Group created");
  };

  const addBookingToGroup = (bookingId, groupId) => {
    setBookingGroups((prev) => ({
      ...prev,
      [bookingId]: groupId,
    }));

    const group = groups.find((item) => item.id === groupId);
    toast.success(`Added to ${group?.name || "group"}`);

    setOpenMenu(null);
    setExpandedGroupMenu(null);
  };

  const saveLabel = () => {
    if (!labelBooking) return;

    const trimmed = labelValue.trim();

    if (!trimmed) {
      toast.error("Please enter a label");
      return;
    }

    setBookingLabels((prev) => ({
      ...prev,
      [labelBooking.id]: trimmed,
    }));

    setShowLabelModal(false);
    setLabelBooking(null);
    setLabelValue("");

    toast.success("Label saved");
  };

  const copyCustomerInfo = async (booking) => {
    const group = groups.find((item) => item.id === bookingGroups[booking.id]);
    const label = bookingLabels[booking.id];

    const info = `
Name: ${booking.customer_name || "N/A"}
Phone: ${booking.customer_phone || "N/A"}
Email: ${booking.customer_email || "N/A"}
Service: ${booking.service || "N/A"}
Group: ${group?.name || "N/A"}
Label: ${label || "N/A"}
Booking Date: ${
      booking.booking_date
        ? new Date(booking.booking_date).toLocaleString()
        : "N/A"
    }
Status: ${booking.status || "pending"}
    `.trim();

    try {
      await navigator.clipboard.writeText(info);
      toast.success("Customer info copied");
    } catch {
      toast.error("Failed to copy customer info");
    }
  };

  const createFollowUpTask = async ({ title, note, deadline }) => {
    if (!followUpBooking) return;

    const payload = {
      title,
      description:
        note ||
        `Follow up with ${followUpBooking.customer_name || "customer"} about ${
          followUpBooking.service || "their booking"
        }.`,
      status: "Pending",
      priority: "Medium",
      deadline: deadline || undefined,
    };

    try {
      await API.post("/tasks", payload);
      toast.success("Follow-up task created");
    } catch (error) {
      console.error("Failed to create follow-up task:", error);
      toast.error("Could not save task to backend");
    } finally {
      setShowFollowUpModal(false);
      setFollowUpBooking(null);
    }
  };

  const handleAction = (action, booking) => {
    if (action === "view") setSelectedBooking(booking);
    if (action === "archive") updateBookingStatus(booking.id, "archived");
    if (action === "restore") updateBookingStatus(booking.id, "pending");
    if (action === "create-group") setShowCreateGroupModal(true);

    if (action === "label") {
      setLabelBooking(booking);
      setLabelValue(bookingLabels[booking.id] || "");
      setShowLabelModal(true);
    }

    if (action === "follow-up") {
      setFollowUpBooking(booking);
      setShowFollowUpModal(true);
    }

    if (action === "copy") copyCustomerInfo(booking);
    if (action === "cancel") cancelBooking(booking.id);

    setOpenMenu(null);
  };

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return bookings
      .filter((booking) => {
        const status = booking.status || "pending";

        if (showArchived && status !== "archived") return false;
        if (!showArchived && status === "archived") return false;
        if (statusFilter !== "all" && status !== statusFilter) return false;

        const group = groups.find(
          (item) => item.id === bookingGroups[booking.id]
        );

        const label = bookingLabels[booking.id];

        const searchableText = [
          booking.customer_name,
          booking.customer_phone,
          booking.customer_email,
          booking.service,
          status,
          group?.name,
          label,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(term);
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at || a.booking_date || 0).getTime();
        const dateB = new Date(b.created_at || b.booking_date || 0).getTime();

        return sortOrder === "oldest" ? dateA - dateB : dateB - dateA;
      });
  }, [
    bookings,
    search,
    showArchived,
    statusFilter,
    sortOrder,
    groups,
    bookingGroups,
    bookingLabels,
  ]);

  const stats = useMemo(() => {
    return {
      total: bookings.filter((b) => b.status !== "archived").length,
      pending: bookings.filter((b) => (b.status || "pending") === "pending")
        .length,
      completed: bookings.filter((b) => b.status === "completed").length,
    };
  }, [bookings]);

  const attentionItems = useMemo(() => {
    const now = new Date();

    return bookings
      .filter((booking) => {
        const status = booking.status || "pending";
        return status === "pending" || status === "cancelled";
      })
      .slice(0, 5)
      .map((booking) => {
        const bookingDate = booking.booking_date
          ? new Date(booking.booking_date)
          : null;

        let message = "New booking needs review";

        if (bookingDate && bookingDate < now) {
          message = "Past booking still pending";
        }

        if ((booking.status || "pending") === "cancelled") {
          message = "Cancelled booking needs attention";
        }

        return {
          id: booking.id,
          name: booking.customer_name || "Customer",
          service: booking.service || "Booking request",
          message,
        };
      });
  }, [bookings]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBookings.slice(start, start + PAGE_SIZE);
  }, [filteredBookings, currentPage]);

  const exportCSV = () => {
    if (filteredBookings.length === 0) {
      toast.error("No bookings to export");
      return;
    }

    const rows = filteredBookings.map((booking) => {
      const group = groups.find((item) => item.id === bookingGroups[booking.id]);
      const label = bookingLabels[booking.id];

      return {
        Name: booking.customer_name || "",
        Phone: booking.customer_phone || "",
        Email: booking.customer_email || "",
        Service: booking.service || "",
        Date: booking.booking_date
          ? new Date(booking.booking_date).toLocaleString()
          : "",
        Status: booking.status || "pending",
        Group: group?.name || "",
        Label: label || "",
      };
    });

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => `"${String(row[header]).replaceAll('"', '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "taskflow-bookings.csv";
    link.click();

    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#0e749030,transparent_30%),radial-gradient(circle_at_top_right,#7c3aed30,transparent_30%),linear-gradient(135deg,#020617,#0f172a,#020617)] px-3 py-5 text-white sm:px-5 md:px-6 md:py-8">
      <style>{`
        @keyframes bell-ring {
          0% { transform: rotate(0); }
          10% { transform: rotate(16deg); }
          20% { transform: rotate(-14deg); }
          30% { transform: rotate(12deg); }
          40% { transform: rotate(-10deg); }
          50% { transform: rotate(6deg); }
          60% { transform: rotate(-4deg); }
          70% { transform: rotate(2deg); }
          100% { transform: rotate(0); }
        }

        .animate-bell-ring {
          animation: bell-ring 1.2s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>

      <div className="mx-auto max-w-7xl rounded-[1.6rem] border border-white/10 bg-[#111827]/70 p-4 shadow-2xl md:rounded-[2rem] md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300 md:text-sm md:tracking-[0.3em]">
              TaskFlow Bookings
            </p>

            <h1 className="mt-3 text-3xl font-black md:text-4xl">
              {showArchived ? "Archived Bookings" : "Bookings"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
              View customer requests submitted through your public booking link.
            </p>
          </div>

          <div className="grid grid-cols-[48px_1fr_1fr] gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttentionPanel((prev) => !prev)}
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-300 hover:bg-white/[0.08]"
              >
                <Bell
                  size={21}
                  className={
                    attentionItems.length > 0 ? "animate-bell-ring" : ""
                  }
                />

                {attentionItems.length > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-red-500 px-1 text-xs font-black text-white shadow-lg shadow-red-500/30">
                    {attentionItems.length}
                  </span>
                )}
              </button>

              {showAttentionPanel && (
                <div className="fixed left-3 right-3 top-24 z-[9999] rounded-3xl border border-white/10 bg-[#020617] p-4 shadow-2xl shadow-black/70 md:absolute md:left-auto md:right-0 md:top-14 md:w-80">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                      Needs Attention
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowAttentionPanel(false)}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:bg-white/[0.08]"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {attentionItems.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-400">
                      Nothing needs attention right now.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {attentionItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            const booking = bookings.find(
                              (b) => b.id === item.id
                            );
                            setSelectedBooking(booking);
                            setShowAttentionPanel(false);
                          }}
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left hover:bg-white/[0.08]"
                        >
                          <p className="text-sm font-bold text-white">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {item.message}
                          </p>
                          <p className="mt-1 text-xs text-cyan-300">
                            {item.service}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowArchived((prev) => !prev)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-slate-300 hover:bg-white/[0.08] sm:px-4 sm:text-sm"
            >
              <Archive size={16} />
              {showArchived ? "Active" : "Archived"}
            </button>

            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-3 text-xs font-black text-slate-950 hover:bg-cyan-300 sm:px-4 sm:text-sm"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 md:mt-7 md:gap-4">
          <BookingStatCard
            icon={CalendarDays}
            title="Total"
            value={stats.total}
          />
          <BookingStatCard
            icon={Clock}
            title="Pending"
            value={stats.pending}
            tone="amber"
          />
          <BookingStatCard
            icon={CheckCircle2}
            title="Done"
            value={stats.completed}
            tone="green"
          />
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-3 md:p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, phone, email, label or group..."
                className="w-full rounded-2xl border border-white/10 bg-[#0b1020] py-4 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50 md:py-3"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-4 text-sm text-white outline-none md:py-3"
            >
              <option value="all">Status: All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-4 text-sm text-white outline-none md:py-3"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-visible rounded-3xl border border-white/10">
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.7fr_0.8fr_1fr] border-b border-white/10 bg-[#0b1020] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 lg:grid">
            <div>Customer</div>
            <div>Service</div>
            <div>Booking Date</div>
            <div>Status</div>
            <div>Added</div>
            <div className="text-right">Actions</div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">
              Loading bookings...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No bookings found.
            </div>
          ) : (
            paginatedBookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                label={bookingLabels[booking.id]}
                group={groups.find(
                  (group) => group.id === bookingGroups[booking.id]
                )}
                groups={groups}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                expandedGroupMenu={expandedGroupMenu}
                setExpandedGroupMenu={setExpandedGroupMenu}
                onMarkCompleted={markCompleted}
                onAction={handleAction}
                onAddToGroup={addBookingToGroup}
              />
            ))
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            Showing {paginatedBookings.length} of {filteredBookings.length}{" "}
            bookings
          </p>

          <div className="grid grid-cols-3 gap-2 md:flex md:items-center">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="rounded-xl border border-white/10 px-4 py-3 font-bold hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40 md:py-2"
            >
              Previous
            </button>

            <button
              type="button"
              className="rounded-xl bg-cyan-400 px-4 py-3 font-black text-slate-950 md:py-2"
            >
              {currentPage}/{totalPages}
            </button>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              className="rounded-xl border border-white/10 px-4 py-3 font-bold hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40 md:py-2"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          label={bookingLabels[selectedBooking.id]}
          group={groups.find(
            (group) => group.id === bookingGroups[selectedBooking.id]
          )}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {showCreateGroupModal && (
        <CreateGroupModal
          value={newGroupName}
          setValue={setNewGroupName}
          onClose={() => {
            setShowCreateGroupModal(false);
            setNewGroupName("");
          }}
          onCreate={createGroup}
        />
      )}

      {showLabelModal && (
        <LabelModal
          value={labelValue}
          setValue={setLabelValue}
          onClose={() => {
            setShowLabelModal(false);
            setLabelBooking(null);
            setLabelValue("");
          }}
          onSave={saveLabel}
        />
      )}

      {showFollowUpModal && followUpBooking && (
        <FollowUpModal
          booking={followUpBooking}
          onClose={() => {
            setShowFollowUpModal(false);
            setFollowUpBooking(null);
          }}
          onCreate={createFollowUpTask}
        />
      )}
    </div>
  );
}

function BookingStatCard({ icon: Icon, title, value, tone = "cyan" }) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-400/10 text-emerald-300"
      : tone === "amber"
      ? "bg-amber-400/10 text-amber-300"
      : "bg-cyan-400/10 text-cyan-300";

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-3 md:rounded-3xl md:p-5">
      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <div
          className={`grid h-7 w-7 place-items-center rounded-xl md:mb-4 md:h-11 md:w-11 md:rounded-2xl ${toneClass}`}
        >
          <Icon size={14} className="md:hidden" />
          <Icon size={21} className="hidden md:block" />
        </div>

        <p className="mt-2 w-full truncate text-[10px] font-semibold leading-none text-slate-400 md:mt-0 md:text-sm">
          {title}
        </p>

        <h3 className="mt-1 text-lg font-black leading-none text-white md:text-3xl">
          {value}
        </h3>
      </div>
    </div>
  );
}

function FollowUpModal({ booking, onClose, onCreate }) {
  const [title, setTitle] = useState(
    `Follow up with ${booking.customer_name || "customer"}`
  );
  const [note, setNote] = useState("");
  const [deadline, setDeadline] = useState("");

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#020617] p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              Follow-up Task
            </p>

            <h2 className="mt-3 text-2xl font-black">
              {booking.customer_name || "Customer"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:bg-white/[0.08]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
          />

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Follow-up note..."
            rows="4"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
          />

          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none focus:border-cyan-400/50"
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-slate-300 hover:bg-white/[0.08]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              if (!title.trim()) {
                toast.error("Task title is required");
                return;
              }

              onCreate({
                title: title.trim(),
                note: note.trim(),
                deadline,
              });
            }}
            className="rounded-2xl bg-cyan-400 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}