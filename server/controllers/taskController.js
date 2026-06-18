const { supabase } = require("../config/supabase");

exports.getTasks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("SUPABASE GET TASKS ERROR:", error);
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("GET TASKS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, deadline } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          user_id: req.user.id,
          title,
          description: description || "",
          status: status || "pending",
          priority: priority || "medium",
          deadline: deadline || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("SUPABASE CREATE TASK ERROR:", error);
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .update(req.body)
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) {
      console.error("SUPABASE UPDATE TASK ERROR:", error);
      return res.status(400).json({ message: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);

    if (error) {
      console.error("SUPABASE DELETE TASK ERROR:", error);
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};