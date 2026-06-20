const { supabase } = require("../config/supabase");

exports.getContacts = async (req, res) => {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ message: error.message });

  res.status(200).json(data);
};

exports.getContactById = async (req, res) => {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .single();

  if (error) return res.status(404).json({ message: "Contact not found" });

  res.status(200).json(data);
};

exports.createContact = async (req, res) => {
  const { name, phone, email, label, notes } = req.body;

  const { data, error } = await supabase
    .from("contacts")
    .insert([
      {
        user_id: req.user.id,
        name,
        phone,
        email,
        label: label || "New",
        notes,
      },
    ])
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });

  res.status(201).json(data);
};

exports.updateContact = async (req, res) => {
  const { data, error } = await supabase
    .from("contacts")
    .update(req.body)
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });

  res.status(200).json(data);
};

exports.deleteContact = async (req, res) => {
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", req.params.id)
    .eq("user_id", req.user.id);

  if (error) return res.status(400).json({ message: error.message });

  res.status(200).json({ message: "Contact deleted successfully" });
};