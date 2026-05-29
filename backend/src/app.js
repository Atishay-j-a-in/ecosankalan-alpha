const express = require("express");
const cors = require("cors");
const { JSON_LIMIT } = require("./config/env");
const analyzeRoutes = require("./routes/analyze");
const healthRoutes = require("./routes/health");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(
  express.json({
    limit: JSON_LIMIT,
  })
);

app.use("/api", analyzeRoutes);
app.use("/api", healthRoutes);

app.use(errorHandler);

module.exports = app;
