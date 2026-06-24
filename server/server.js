const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const contactRoutes = require("./routes/contactRoutes");



const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://task-manager-app-mern-phi.vercel.app",
  "https://task-manager-app-mern-rlew.vercel.app",
  "https://task-manager-app-mern-wheat.vercel.app",
  "https://task-manager-app-mern-git-main-austins-projects-f4744c22.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://taskflowaemasystems.com",
  "https://www.taskflowaemasystems.com",
  "https://task-manager-app-mern-phi.vercel.app",

];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Task Manager API is running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/contacts", contactRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});