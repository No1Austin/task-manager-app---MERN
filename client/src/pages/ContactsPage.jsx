import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BellPlus,
  CalendarDays,
  ChevronRight,
  Clipboard,
  Clock3,
  Download,
  Eye,
  Grid2X2,
  ListTodo,
  Mail,
  Menu,
  MessageCircle,
  MoreHorizontal,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  UserRoundPlus,
  Users,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/useAuth";
import UpgradeModal from "../components/UpgradeModal";

const REMINDER_WINDOWS = [
  { label: "24hrs", hours: 24 },
  { label: "12hrs", hours: 12 },
  { label: "1hr", hours: 1 },
];

export default function ContactsPage() {
  const { isPro } = useAuth();

  const fileInputRef = useRef(null);

  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [followUps, setFollowUps] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState("contacts");

  const [menuState, setMenuState] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [groupModal, setGroupModal] = useState(null);
  const [followUpModal, setFollowUpModal] = useState(null);
  const [contactModal, setContactModal] = useState(false);

  useEffect(() => {
    if (!isPro) return;

    const fetchContacts = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/contacts");
        setContacts(data || []);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
        toast.error("Failed to load contacts");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();

    setGroups(JSON.parse(localStorage.getItem("contact_groups") || "[]"));
    setFollowUps(JSON.parse(localStorage.getItem("contact_followups") || "[]"));
  }, [isPro]);

  useEffect(() => {
    localStorage.setItem("contact_groups", JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem("contact_followups", JSON.stringify(followUps));
  }, [followUps]);

  const closeMenu = () => setMenuState(null);

  const openSmartMenu = (event, contact) => {
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    const menuHeight = 430;
    const menuWidth = 290;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight;

    setMenuState({
      contact,
      top: openUp ? Math.max(12, rect.top - menuHeight - 8) : rect.bottom + 8,
      left: Math.min(
        Math.max(12, rect.right - menuWidth),
        window.innerWidth - menuWidth - 12
      ),
    });
  };

  const createContact = async (form) => {
    if (!form.name.trim()) {
      toast.error("Contact name is required");
      return;
    }

    const newContact = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      label: form.label.trim(),
      group: form.group.trim(),
      followUpCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      const { data } = await API.post("/contacts", newContact);
      setContacts((prev) => [data || newContact, ...prev]);
      toast.success("Contact created");
    } catch (error) {
      console.error("Backend create contact failed:", error);
      setContacts((prev) => [newContact, ...prev]);
      toast.success("Contact created locally");
    }

    setContactModal(false);
  };

  const updateContactInUI = (id, updates) => {
    setContacts((prev) =>
      prev.map((contact) =>
        (contact._id || contact.id) === id ? { ...contact, ...updates } : contact
      )
    );
  };

  const saveContactUpdate = async (contact, updates) => {
    const id = contact._id || contact.id;
    const updatedContact = { ...contact, ...updates };

    updateContactInUI(id, updates);

    try {
      try {
        await API.patch(`/contacts/${id}`, updatedContact);
      } catch {
        await API.put(`/contacts/${id}`, updatedContact);
      }
    } catch (error) {
      console.error("Failed to save contact update:", error);
      toast.error("Saved on screen, but backend update failed");
    }
  };

  const deleteContact = async (contact) => {
    const id = contact._id || contact.id;

    if (!id) return toast.error("Contact ID not found");
    if (!window.confirm(`Delete ${contact.name || "this contact"}?`)) return;

    try {
      await API.delete(`/contacts/${id}`);

      setContacts((prev) => prev.filter((item) => (item._id || item.id) !== id));

      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          contactIds: group.contactIds.filter((contactId) => contactId !== id),
        }))
      );

      setFollowUps((prev) => prev.filter((item) => item.contactId !== id));

      toast.success("Contact deleted");
      closeMenu();
    } catch (error) {
      console.error("Failed to delete contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  const labelContact = async (contact) => {
    const label = window.prompt("Enter label:", contact.label || "");
    if (!label) return;

    await saveContactUpdate(contact, { label });
    toast.success("Contact labelled");
    closeMenu();
  };

  const copyContactInfo = async (contact) => {
    const text = `
Name: ${contact.name || "N/A"}
Phone: ${contact.phone || "N/A"}
Email: ${contact.email || "N/A"}
Company: ${contact.company || "N/A"}
Label: ${contact.label || "N/A"}
Group: ${contact.group || "N/A"}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Contact info copied");
      closeMenu();
    } catch {
      toast.error("Could not copy contact info");
    }
  };

  const createGroup = (groupName, contact) => {
    if (!groupName.trim()) return toast.error("Group name is required");

    const contactId = contact ? contact._id || contact.id : null;

    const newGroup = {
      id: crypto.randomUUID(),
      name: groupName.trim(),
      contactIds: contactId ? [contactId] : [],
      createdAt: new Date().toISOString(),
    };

    setGroups((prev) => [newGroup, ...prev]);

    if (contact) {
      saveContactUpdate(contact, { group: newGroup.name });
    }

    toast.success("Group created");
    setGroupModal(null);
    closeMenu();
  };

  const addToGroup = (groupId, contact) => {
    const contactId = contact._id || contact.id;
    const group = groups.find((item) => item.id === groupId);

    if (!group) return toast.error("Select a group");

    setGroups((prev) =>
      prev.map((item) =>
        item.id === groupId
          ? {
              ...item,
              contactIds: Array.from(new Set([...item.contactIds, contactId])),
            }
          : item
      )
    );

    saveContactUpdate(contact, { group: group.name });

    toast.success("Contact added to group");
    setGroupModal(null);
    closeMenu();
  };

  const createFollowUpTask = async ({ contact, title, note, dueDate }) => {
    if (!title.trim()) return toast.error("Follow-up title is required");
    if (!dueDate) return toast.error("Please select follow-up date and time");

    const contactId = contact._id || contact.id;

    const newFollowUp = {
      id: crypto.randomUUID(),
      contactId,
      contactName: contact.name || "Unnamed Contact",
      title: title.trim(),
      note: note.trim(),
      dueDate,
      status: "Pending",
      reminders: {
        "24hrs": false,
        "12hrs": false,
        "1hr": false,
      },
      createdAt: new Date().toISOString(),
    };

    setFollowUps((prev) => [newFollowUp, ...prev]);

    await saveContactUpdate(contact, {
      followUpCount: Number(contact.followUpCount || 0) + 1,
      lastFollowUp: dueDate,
    });

    try {
      await API.post("/tasks", {
        title: title.trim(),
        description: note || `Follow up with ${contact.name || "customer"}.`,
        status: "Pending",
        priority: "Medium",
        deadline: dueDate,
      });
    } catch (error) {
      console.error("Task backend failed:", error);
      toast.error("Follow-up saved, but task creation failed");
    }

    toast.success("Follow-up task created");
    setFollowUpModal(null);
    closeMenu();
    setActiveView("followups");
  };

  const completeFollowUp = (followUpId) => {
    setFollowUps((prev) =>
      prev.map((item) =>
        item.id === followUpId
          ? {
              ...item,
              status: "Completed",
              completedAt: new Date().toISOString(),
            }
          : item
      )
    );

    toast.success("Follow-up completed");
  };

  const deleteFollowUp = (followUpId) => {
    if (!window.confirm("Delete this follow-up?")) return;

    setFollowUps((prev) => prev.filter((item) => item.id !== followUpId));
    toast.success("Follow-up deleted");
  };

  const downloadContactsCSV = () => {
    if (contacts.length === 0) {
      toast.error("No contacts to export");
      return;
    }

    const headers = ["Name", "Phone", "Email", "Company", "Label", "Group"];

    const rows = contacts.map((contact) => [
      contact.name || "",
      contact.phone || "",
      contact.email || "",
      contact.company || "",
      contact.label || "",
      contact.group || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "taskflow-contacts.csv";
    link.click();

    URL.revokeObjectURL(url);
    toast.success("Contacts downloaded");
  };

  const importContactsCSV = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(Boolean);

      if (lines.length < 2) {
        toast.error("CSV file is empty");
        return;
      }

      const imported = lines.slice(1).map((line) => {
        const values = parseCSVLine(line);

        return {
          id: crypto.randomUUID(),
          name: values[0] || "Unnamed Contact",
          phone: values[1] || "",
          email: values[2] || "",
          company: values[3] || "",
          label: values[4] || "",
          group: values[5] || "",
          followUpCount: 0,
          createdAt: new Date().toISOString(),
        };
      });

      setContacts((prev) => [...imported, ...prev]);

      try {
        await Promise.allSettled(
          imported.map((contact) => API.post("/contacts", contact))
        );
      } catch (error) {
        console.error("Import backend save failed:", error);
      }

      toast.success(`${imported.length} contact(s) imported`);
      event.target.value = "";
    };

    reader.readAsText(file);
  };

  const upcomingFollowUps = useMemo(() => {
    const now = new Date();

    return followUps
      .filter((item) => item.status !== "Completed")
      .map((item) => {
        const due = item.dueDate ? new Date(item.dueDate) : null;
        const hoursLeft = due ? (due - now) / (1000 * 60 * 60) : null;

        const reminder = REMINDER_WINDOWS.find(
          (window) =>
            hoursLeft !== null && hoursLeft > 0 && hoursLeft <= window.hours
        );

        return {
          ...item,
          due,
          hoursLeft,
          reminderLabel: reminder?.label || null,
          isOverdue: due ? due < now : false,
        };
      })
      .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
  }, [followUps]);

  const filteredContacts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return contacts;

    return contacts.filter((contact) =>
      [
        contact.name,
        contact.phone,
        contact.email,
        contact.company,
        contact.label,
        contact.group,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [contacts, search]);

  if (!isPro) {
    return (
      <div className="min-h-screen bg-[#030712] px-5 py-8 text-white">
        <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 text-center shadow-2xl">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-cyan-400/10 text-cyan-300">
            <Users size={30} />
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
            Pro Feature
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Contacts is a Pro Feature
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Upgrade to TaskFlow Pro to manage contacts, groups, WhatsApp
            messages, email campaigns, and customer follow-ups.
          </p>

          <button
            type="button"
            onClick={() => setShowUpgrade(true)}
            className="mt-7 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-4 font-black text-white shadow-lg shadow-cyan-500/20"
          >
            Upgrade to Pro
          </button>
        </div>

        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] px-4 pb-28 pt-5 text-white md:px-6 md:py-8">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={importContactsCSV}
        className="hidden"
      />

      {menuState && (
        <button
          type="button"
          onClick={closeMenu}
          className="fixed inset-0 z-[9998] cursor-default bg-transparent"
        />
      )}

      {menuState && (
        <ContactActionMenu
          contact={menuState.contact}
          top={menuState.top}
          left={menuState.left}
          closeMenu={closeMenu}
          setSelectedContact={setSelectedContact}
          setGroupModal={setGroupModal}
          setFollowUpModal={setFollowUpModal}
          deleteContact={deleteContact}
          labelContact={labelContact}
          copyContactInfo={copyContactInfo}
          groups={groups}
        />
      )}

      {selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          followUps={followUps}
          onClose={() => setSelectedContact(null)}
        />
      )}

      {groupModal && (
        <GroupModal
          mode={groupModal.mode}
          contact={groupModal.contact}
          groups={groups}
          onClose={() => setGroupModal(null)}
          onCreateGroup={createGroup}
          onAddToGroup={addToGroup}
        />
      )}

      {followUpModal && (
        <FollowUpModal
          contact={followUpModal.contact}
          onClose={() => setFollowUpModal(null)}
          onCreate={createFollowUpTask}
        />
      )}

      {contactModal && (
        <CreateContactModal
          groups={groups}
          onClose={() => setContactModal(false)}
          onCreate={createContact}
        />
      )}

      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-[#081120]/90 p-4 shadow-2xl md:p-6">
          <div className="flex items-center justify-between md:hidden">
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"
            >
              <Menu size={21} />
            </button>

            <div className="text-center">
              <h1 className="text-lg font-black">
                {activeView === "contacts" ? "Contacts" : "Follow-ups"}
              </h1>
              <p className="text-xs text-slate-400">TaskFlow CRM</p>
            </div>

            <button
              type="button"
              onClick={() => setContactModal(true)}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500"
            >
              <Plus size={21} />
            </button>
          </div>

          <div className="hidden flex-col gap-5 md:flex lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                TaskFlow Contacts
              </p>

              <h1 className="mt-3 text-4xl font-black">
                {activeView === "contacts" ? "Contacts" : "Follow-ups"}
              </h1>

              <p className="mt-2 max-w-2xl text-slate-400">
                Manage customers, groups, labels and follow-up tasks from one
                clean workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setContactModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-slate-200 hover:bg-white/[0.08]"
              >
                <UserRoundPlus size={18} />
                Create Contact
              </button>

              <button
                type="button"
                onClick={() => setGroupModal({ mode: "create", contact: null })}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-500/20"
              >
                <Plus size={18} />
                Create Group
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-300 hover:bg-cyan-400/15"
              >
                <Upload size={18} />
                Import
              </button>

              <button
                type="button"
                onClick={downloadContactsCSV}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-400/20 bg-violet-400/10 px-5 py-3 text-sm font-black text-violet-300 hover:bg-violet-400/15"
              >
                <Download size={18} />
                CSV
              </button>
            </div>
          </div>

          <div className="mt-6 md:hidden">
            <p className="text-sm font-bold text-cyan-300">Welcome back</p>

            <h2 className="mt-2 text-4xl font-black tracking-tight">
              {activeView === "contacts" ? "Contacts" : "Follow-ups"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {activeView === "contacts"
                ? "Manage customers, groups, labels and follow-ups."
                : "See the follow-ups you need to do next."}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setContactModal(true)}
                className="rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3 text-sm font-black text-white"
              >
                Create Contact
              </button>

              <button
                type="button"
                onClick={() => setGroupModal({ mode: "create", contact: null })}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-slate-200"
              >
                Create Group
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-300"
              >
                Import CSV
              </button>

              <button
                type="button"
                onClick={downloadContactsCSV}
                className="rounded-2xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-sm font-black text-violet-300"
              >
                Download CSV
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 md:mt-7 md:gap-4">
            <StatBox
              icon={Users}
              label="Contacts"
              value={contacts.length}
              tone="cyan"
              active={activeView === "contacts"}
              onClick={() => setActiveView("contacts")}
            />

            <StatBox
              icon={Tag}
              label="Groups"
              value={groups.length}
              tone="violet"
              active={false}
              onClick={() => setActiveView("contacts")}
            />

            <StatBox
              icon={Sparkles}
              label="Follow-ups"
              value={upcomingFollowUps.length}
              tone="emerald"
              active={activeView === "followups"}
              onClick={() => setActiveView("followups")}
            />
          </div>

          {activeView === "contacts" && (
            <>
              {groups.length > 0 && (
                <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                  {groups.map((group) => (
                    <span
                      key={group.id}
                      className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-slate-300"
                    >
                      {group.name} ({group.contactIds.length})
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-3 md:mt-6 md:p-4">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search contacts..."
                    className="w-full rounded-2xl border border-white/10 bg-[#030712] py-4 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50 md:py-3"
                  />
                </div>
              </div>

              {loading ? (
                <EmptyBox text="Loading contacts..." />
              ) : filteredContacts.length === 0 ? (
                <EmptyBox text="No contacts yet." />
              ) : (
                <div className="mt-5 space-y-3 md:grid md:gap-4 md:space-y-0 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredContacts.map((contact) => (
                    <ContactCard
                      key={contact._id || contact.id}
                      contact={contact}
                      openSmartMenu={openSmartMenu}
                      setSelectedContact={setSelectedContact}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeView === "followups" && (
            <FollowUpsPanel
              followUps={upcomingFollowUps}
              onComplete={completeFollowUp}
              onDelete={deleteFollowUp}
            />
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setContactModal(true)}
        className="fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white shadow-2xl shadow-cyan-500/30 md:hidden"
      >
        <Plus size={25} />
      </button>

      <MobileBottomNav />

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result.map((item) => item.trim());
}

function CreateContactModal({ groups, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    label: "",
    group: "",
  });

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#020617] p-6 text-white shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
          Create Contact
        </p>

        <h2 className="mt-3 text-2xl font-black">New Customer</h2>

        <div className="mt-5 space-y-3">
          <input
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            placeholder="Full name"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none"
          />

          <input
            value={form.phone}
            onChange={(e) => updateForm("phone", e.target.value)}
            placeholder="Phone"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none"
          />

          <input
            value={form.email}
            onChange={(e) => updateForm("email", e.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none"
          />

          <input
            value={form.company}
            onChange={(e) => updateForm("company", e.target.value)}
            placeholder="Company"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none"
          />

          <input
            value={form.label}
            onChange={(e) => updateForm("label", e.target.value)}
            placeholder="Label e.g New, VIP, Lead"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none"
          />

          <select
            value={form.group}
            onChange={(e) => updateForm("group", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#020617] px-4 py-4 text-sm text-white outline-none"
          >
            <option value="">No group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-slate-300"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onCreate(form)}
            className="rounded-2xl bg-cyan-400 py-3 text-sm font-black text-slate-950"
          >
            Save Contact
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ contact, openSmartMenu, setSelectedContact }) {
  const name = contact.name || "Unnamed Contact";
  const initial = name.charAt(0).toUpperCase();

  const whatsappLink = contact.phone
    ? `https://wa.me/${String(contact.phone).replace(/\D/g, "")}`
    : null;

  const emailLink = contact.email ? `mailto:${contact.email}` : null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/20 transition hover:border-cyan-400/30 hover:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-base font-black text-white md:h-10 md:w-10 md:text-sm">
            {initial}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-white">{name}</h2>

            <p className="truncate text-xs text-slate-500">
              {contact.company || contact.label || "Customer"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(event) => openSmartMenu(event, contact)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]"
        >
          <MoreVertical size={17} />
        </button>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p className="flex items-center gap-2 truncate text-slate-400">
          <Phone size={15} className="shrink-0 text-cyan-300" />
          <span className="truncate">{contact.phone || "No phone"}</span>
        </p>

        <p className="flex items-center gap-2 truncate text-slate-400">
          <Mail size={15} className="shrink-0 text-cyan-300" />
          <span className="truncate">{contact.email || "No email"}</span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {contact.group && (
          <span className="rounded-xl bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300">
            {contact.group}
          </span>
        )}

        {contact.label && (
          <span className="rounded-xl bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
            {contact.label}
          </span>
        )}

        {contact.followUpCount ? (
          <span className="rounded-xl bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
            {contact.followUpCount} follow-up
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setSelectedContact(contact)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-xs font-bold text-slate-300 hover:bg-white/[0.08]"
        >
          View
        </button>

        {whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-400/10 px-3 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-400/15"
          >
            
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-400/10 px-3 py-3 text-xs font-bold text-emerald-300 opacity-50"
          >
           <MessageCircle size={14} />
Chat
          </button>
        )}

        {emailLink ? (
          <a
            href={emailLink}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-cyan-400/10 px-3 py-3 text-xs font-bold text-cyan-300 hover:bg-cyan-400/15"
          >
            <Mail size={14} />
            Email
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-cyan-400/10 px-3 py-3 text-xs font-bold text-cyan-300 opacity-50"
          >
            <Mail size={14} />
            Email
          </button>
        )}
      </div>
    </div>
  );
}

function ContactActionMenu({
  contact,
  top,
  left,
  closeMenu,
  setSelectedContact,
  setGroupModal,
  setFollowUpModal,
  deleteContact,
  labelContact,
  copyContactInfo,
  groups,
}) {
  const whatsappLink = contact.phone
    ? `https://wa.me/${String(contact.phone).replace(/\D/g, "")}`
    : null;

  const emailLink = contact.email ? `mailto:${contact.email}` : null;

  return (
    <div
      className="fixed z-[9999] w-[290px] rounded-[1.7rem] border border-white/10 bg-[#020617] p-2 shadow-2xl shadow-black/70"
      style={{ top, left }}
    >
      <MenuButton
        icon={Eye}
        label="View details"
        onClick={() => {
          setSelectedContact(contact);
          closeMenu();
        }}
      />

      <MenuButton
        icon={Users}
        label="Add to group"
        rightIcon={ChevronRight}
        onClick={() => setGroupModal({ mode: "add", contact })}
        disabled={groups.length === 0}
      />

      <MenuButton
        icon={UserRoundPlus}
        label="Create group"
        onClick={() => setGroupModal({ mode: "create", contact })}
      />

      <MenuButton icon={Tag} label="Label customer" onClick={() => labelContact(contact)} />

      <MenuButton
        icon={BellPlus}
        label="Add follow-up task"
        onClick={() => setFollowUpModal({ contact })}
      />

      <MenuButton
        icon={Clipboard}
        label="Copy customer info"
        onClick={() => copyContactInfo(contact)}
      />

      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeMenu}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-emerald-300 hover:bg-white/[0.06]"
        >
          <MessageCircle size={18} />
          Chat on WhatsApp
        </a>
      )}

      {emailLink && (
        <a
          href={emailLink}
          onClick={closeMenu}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-cyan-300 hover:bg-white/[0.06]"
        >
          <Mail size={18} />
          Send email
        </a>
      )}

      <div className="my-2 border-t border-white/10" />

      <button
        type="button"
        onClick={() => deleteContact(contact)}
        className="mt-1 flex w-full items-center gap-3 rounded-2xl bg-red-500/10 px-4 py-3 text-left text-sm font-semibold text-red-300 hover:bg-red-500/15"
      >
        <Trash2 size={18} />
        Delete contact
      </button>
    </div>
  );
}

function MenuButton({ icon: Icon, label, onClick, rightIcon: RightIcon, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold hover:bg-white/[0.06] ${
        disabled ? "cursor-not-allowed text-slate-600" : "text-slate-300"
      }`}
    >
      <Icon size={18} />
      <span className="flex-1">{label}</span>
      {RightIcon && <RightIcon size={18} />}
    </button>
  );
}

function GroupModal({ mode, contact, groups, onClose, onCreateGroup, onAddToGroup }) {
  const [groupName, setGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "");

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#020617] p-6 text-white shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
          {mode === "create" ? "Create Group" : "Add To Group"}
        </p>

        <h2 className="mt-3 text-2xl font-black">
          {contact?.name || "Contact Group"}
        </h2>

        {mode === "create" ? (
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name e.g VIP Customers"
            className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none"
          />
        ) : (
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="mt-5 w-full rounded-2xl border border-white/10 bg-[#020617] px-4 py-4 text-sm text-white outline-none"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-slate-300"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              mode === "create"
                ? onCreateGroup(groupName, contact)
                : onAddToGroup(selectedGroupId, contact)
            }
            className="rounded-2xl bg-cyan-400 py-3 text-sm font-black text-slate-950"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function FollowUpModal({ contact, onClose, onCreate }) {
  const [title, setTitle] = useState(`Follow up with ${contact.name || "contact"}`);
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#020617] p-6 text-white shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
          Follow-up Task
        </p>

        <h2 className="mt-3 text-2xl font-black">
          {contact.name || "Unnamed Contact"}
        </h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none"
        />

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Follow-up note..."
          rows="4"
          className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none"
        />

        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none"
        />

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Reminder logic will flag this follow-up 24hrs, 12hrs and 1hr before
          the selected date and time.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-slate-300"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onCreate({ contact, title, note, dueDate })}
            className="rounded-2xl bg-cyan-400 py-3 text-sm font-black text-slate-950"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

function FollowUpsPanel({ followUps, onComplete, onDelete }) {
  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div>
        <h2 className="text-xl font-black">Follow-ups to do</h2>
        <p className="mt-1 text-sm text-slate-400">
          These are your pending follow-up tasks.
        </p>
      </div>

      {followUps.length === 0 ? (
        <EmptyBox text="No follow-ups due yet." />
      ) : (
        <div className="mt-5 space-y-3">
          {followUps.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-white/10 bg-[#030712] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-black text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {item.contactName}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-xl px-3 py-1 text-xs font-black ${
                    item.isOverdue
                      ? "bg-red-500/15 text-red-300"
                      : item.reminderLabel
                      ? "bg-amber-500/15 text-amber-300"
                      : "bg-cyan-500/15 text-cyan-300"
                  }`}
                >
                  {item.isOverdue
                    ? "Overdue"
                    : item.reminderLabel
                    ? `${item.reminderLabel} reminder`
                    : "Upcoming"}
                </span>
              </div>

              {item.note && (
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {item.note}
                </p>
              )}

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                <Clock3 size={16} className="text-cyan-300" />
                {item.due ? item.due.toLocaleString() : "No due date selected"}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onComplete(item.id)}
                  className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
                >
                  Complete
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactDetailsModal({ contact, followUps, onClose }) {
  const contactId = contact._id || contact.id;
  const contactFollowUps = followUps.filter((item) => item.contactId === contactId);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#020617] p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              Contact Details
            </p>

            <h2 className="mt-3 text-2xl font-black">
              {contact.name || "Unnamed Contact"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.08]"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <DetailItem label="Phone" value={contact.phone || "No phone"} />
          <DetailItem label="Email" value={contact.email || "No email"} />
          <DetailItem label="Company" value={contact.company || "No company"} />
          <DetailItem label="Label" value={contact.label || "No label"} />
          <DetailItem label="Group" value={contact.group || "No group"} />
          <DetailItem label="Follow-ups" value={`${contactFollowUps.length} task(s)`} />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm leading-6 text-slate-200">
        {value}
      </p>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, tone, active, onClick }) {
  const tones = {
    cyan: "bg-cyan-400/10 text-cyan-300",
    violet: "bg-violet-400/10 text-violet-300",
    emerald: "bg-emerald-400/10 text-emerald-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-4 text-left transition md:p-5 ${
        active
          ? "border-cyan-400/40 bg-cyan-400/10"
          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
      }`}
    >
      <div
        className={`grid h-10 w-10 place-items-center rounded-2xl md:h-12 md:w-12 ${tones[tone]}`}
      >
        <Icon size={20} />
      </div>

      <p className="mt-3 truncate text-xs text-slate-400 md:text-sm">{label}</p>
      <p className="mt-1 text-2xl font-black md:text-4xl">{value}</p>
    </button>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-slate-400">
      {text}
    </div>
  );
}

function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#07101f]/95 px-5 pb-5 pt-3 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 text-xs font-bold text-slate-400">
        <Link to="/dashboard" className="flex flex-col items-center gap-1">
          <Grid2X2 size={22} />
          Dashboard
        </Link>

        <Link to="/tasks" className="flex flex-col items-center gap-1">
          <ListTodo size={22} />
          Tasks
        </Link>

        <Link to="/bookings" className="flex flex-col items-center gap-1">
          <CalendarDays size={22} />
          Bookings
        </Link>

        <Link
          to="/contacts"
          className="flex flex-col items-center gap-1 text-cyan-300"
        >
          <Users size={22} />
          Contacts
        </Link>

        <button type="button" className="flex flex-col items-center gap-1">
          <MoreHorizontal size={22} />
          More
        </button>
      </div>
    </nav>
  );
}