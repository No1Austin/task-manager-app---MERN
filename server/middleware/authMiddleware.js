const jwt = require("jsonwebtoken");
const { supabase } = require("../config/supabase");

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    token = token.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = authMiddleware;