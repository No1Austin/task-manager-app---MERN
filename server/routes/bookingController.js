const { supabase } = require("../config/supabase");

// Create or update business profile
exports.createBusinessProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const payload = {
      user_id: userId,
      business_name: req.body.business_name,
      booking_slug: req.body.booking_slug,
      business_email: req.body.business_email,
      business_phone: req.body.business_phone,
      business_type: req.body.business_type || "custom",
      booking_questions: req.body.booking_questions || [],
      tagline: req.body.tagline,
      brand_color: req.body.brand_color || "#22d3ee",
      business_description: req.body.business_description,
    };

    const { data, error } = await supabase
      .from("business_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get my business profile
exports.getMyBusinessProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const { data, error } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) return res.status(400).json({ message: error.message });

    if (!data) {
      return res.status(404).json({ message: "Business profile not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Public booking page lookup
exports.getPublicBookingProfile = async (req, res) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("booking_slug", slug)
      .maybeSingle();

    if (error) return res.status(400).json({ message: error.message });

    if (!data) {
      return res.status(404).json({ message: "Booking page not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Customer submits booking
exports.createPublicBooking = async (req, res) => {
  try {
    const { slug } = req.params;

    const {
      customer_name,
      customer_phone,
      customer_email,
      service,
      booking_date,
      notes,
      custom_answers,
    } = req.body;

    const { data: business, error: businessError } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("booking_slug", slug)
      .maybeSingle();

    if (businessError) {
      return res.status(400).json({ message: businessError.message });
    }

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .insert([
        {
          user_id: business.user_id,
          name: customer_name,
          phone: customer_phone,
          email: customer_email,
          label: "New",
          last_booking_at: booking_date || new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (contactError) {
      return res.status(400).json({ message: contactError.message });
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          user_id: business.user_id,
          contact_id: contact.id,
          customer_name,
          customer_phone,
          customer_email,
          service,
          booking_date,
          notes,
          custom_answers: custom_answers || {},
          status: "pending",
          archived: false,
        },
      ])
      .select()
      .single();

    if (bookingError) {
      return res.status(400).json({ message: bookingError.message });
    }

    return res.status(201).json(booking);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Owner sees bookings
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const showArchived = req.query.archived === "true";

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .eq("archived", showArchived)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ message: error.message });

    return res.status(200).json(data || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Archive or restore booking
exports.archiveBooking = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const { archived } = req.body;

    const { data, error } = await supabase
      .from("bookings")
      .update({ archived: Boolean(archived) })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};