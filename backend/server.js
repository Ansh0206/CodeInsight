require("dotenv").config();
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/analysis");
const errorHandler = require("./middleware/errorHandler");

require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.use("/api", apiRoutes);

app.get("/", (_, res) => res.json({ message: "CodeInsight API running" }));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
