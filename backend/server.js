require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const authRoutes = require("./routes/auth");
const apiRoutes  = require("./routes/analysis");
const errorHandler = require("./middleware/errorHandler");

// Initialise DB (runs migrations + seed)
require("./config/db");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "1mb" }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api",      apiRoutes);

app.get("/", (_, res) => res.json({ message: "CodeInsight API v1.0 running ✅" }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
