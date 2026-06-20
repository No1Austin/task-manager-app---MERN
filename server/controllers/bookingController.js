const { supabase } = require("../config/supabase");

// Create business profile
exports.createBusinessProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const payload = {
      user_id: userId,
      business_name: req.body.business_name,
      booking_slug: req.body.booking_slug,
      business_email: req.body.business_email,
      business_phone: req.body.business_phone,
      business_type: req.body.business_type,
      booking_questions: req.body.booking_questions || [],
      tagline: req.body.tagline,
      brand_color: req.body.brand_color,
      business_description: req.body.business_description,
    };

    const { data, error } = await supabase
      .from("business_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my profile
exports.getMyBusinessProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const { data, error } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "Business profile not found",
      });
    }

    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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
      .single();

    if (error) {
      return res.status(404).json({
        message: "Booking page not found",
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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

    const { data: business } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("booking_slug", slug)
      .single();

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    // Create contact
    const { data: contact } = await supabase
      .from("contacts")
      .insert([
        {
          user_id: business.user_id,
          name: customer_name,
          phone: customer_phone,
          email: customer_email,
          label: "New",
          last_booking_at: booking_date,
        },
      ])
      .select()
      .single();

    // Create booking
    const { data: booking, error } = await supabase
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
}
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Owner sees all bookings
exports.getMyBookings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update booking status: pending, completed, cancelled, archived
exports.updateBookingStatus = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "completed", "cancelled", "archived"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status",
      });
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};