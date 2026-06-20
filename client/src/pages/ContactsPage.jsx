import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/useAuth";
import UpgradeModal from "../components/UpgradeModal";

export default function ContactsPage() {
  const { isPro } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (!isPro) return;

    const fetchContacts = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/contacts");
        setContacts(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [isPro]);

  if (!isPro) {
    return (
      <div className="min-h-screen bg-[#070b1a] px-6 py-8 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white text-[#070b1a]/5 p-8 text-center">
          <h1 className="text-3xl font-black">Contacts is a Pro Feature</h1>

          <p className="mt-3 text-slate-300">
            Upgrade to TaskFlow Pro to manage contacts, groups, WhatsApp messages,
            email campaigns, and customer follow-ups.
          </p>

          <button
            onClick={() => setShowUpgrade(true)}
            className="mt-6 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 font-bold text-white"
          >
            Upgrade to Pro
          </button>
        </div>

        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b1a] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-black">Contacts</h1>

        <p className="mt-2 text-slate-300">
          Manage customers, labels, groups and communications.
        </p>

        {loading ? (
          <p className="mt-6">Loading contacts...</p>
        ) : contacts.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white text-[#070b1a]/5 p-8">
            No contacts yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contacts.map((contact) => (
              <div
                key={contact._id || contact.id}
                className="rounded-3xl border border-white/10 bg-white text-[#070b1a]/5 p-5"
              >
                <h2 className="text-xl font-bold">{contact.name}</h2>

                <p className="mt-2 text-slate-400">
                  {contact.phone || "No phone"}
                </p>

                <p className="text-slate-400">
                  {contact.email || "No email"}
                </p>

                <div className="mt-4 flex gap-2">
                  <button className="rounded-xl bg-cyan-500/20 px-3 py-2 text-sm">
                    View
                  </button>

                  <button className="rounded-xl bg-emerald-500/20 px-3 py-2 text-sm">
                    WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}