import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  Search,
} from "lucide-react";

import API from "../services/api";

import BookingRow from "../components/bookings/BookingRow";
import BookingDetailsModal from "../components/bookings/BookingDetailsModal";
import CreateGroupModal from "../components/bookings/CreateGroupModal";
import LabelModal from "../components/bookings/LabelModal";
import StatCard from "../components/bookings/StatCard";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showArchived, setShowArchived] = useState(false);

  const [openMenu, setOpenMenu] = useState(null);
  const [expandedGroupMenu, setExpandedGroupMenu] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelBooking, setLabelBooking] = useState(null);
  const [labelValue, setLabelValue] = useState("");

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
          booking.id === bookingId ? { ...booking, ...data } : booking
        )
      );

      toast.success(
        status === "completed"
          ? "Booking marked as completed"
          : status === "archived"
          ? "Booking archived"
          : status === "pending"
          ? "Booking restored"
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

  const handleAction = (action, booking) => {
    if (action === "view") {
      setSelectedBooking(booking);
    }

    if (action === "archive") {
      updateBookingStatus(booking.id, "archived");
    }

    if (action === "restore") {
      updateBookingStatus(booking.id, "pending");
    }

    if (action === "create-group") {
      setShowCreateGroupModal(true);
    }

    if (action === "label") {
      setLabelBooking(booking);
      setLabelValue(bookingLabels[booking.id] || "");
      setShowLabelModal(true);
    }

    if (action === "follow-up") {
      toast.success("Follow-up task action selected");
    }

    if (action === "copy") {
      copyCustomerInfo(booking);
    }

    if (action === "cancel") {
      cancelBooking(booking.id);
    }

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#0e749030,transparent_30%),radial-gradient(circle_at_top_right,#7c3aed30,transparent_30%),linear-gradient(135deg,#020617,#0f172a,#020617)] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-[#111827]/70 p-6 shadow-2xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
              TaskFlow Bookings
            </p>

            <h1 className="mt-3 text-4xl font-black">
              {showArchived ? "Archived Bookings" : "Bookings"}
            </h1>

            <p className="mt-2 text-slate-400">
              View customer requests submitted through your public booking link.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowArchived((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300 hover:bg-white/[0.08]"
            >
              <Archive size={17} />
              {showArchived ? "Back to Active" : "Archived Bookings"}
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300"
            >
              <Download size={17} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <StatCard icon={CalendarDays} title="Total Bookings" value={stats.total} />
          <StatCard icon={Clock} title="Pending" value={stats.pending} tone="amber" />
          <StatCard
            icon={CheckCircle2}
            title="Completed"
            value={stats.completed}
            tone="green"
          />
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, email, label or group..."
                className="w-full rounded-2xl border border-white/10 bg-[#0b1020] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all">Status: All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none"
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
            filteredBookings.map((booking) => (
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
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>

          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/[0.06]">
              Previous
            </button>

            <button className="rounded-xl bg-cyan-400 px-4 py-2 font-bold text-slate-950">
              1
            </button>

            <button className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/[0.06]">
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
    </div>
  );
}