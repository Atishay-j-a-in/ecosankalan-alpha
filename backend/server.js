const app = require("./src/app");
const { PORT } = require("./src/config/env");

const server = app.listen(PORT, () => {
  console.log(
    `Waste Detection Backend running on http://localhost:${PORT}`
  );
});

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down.`);
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  shutdown("uncaughtException");
});