import { config } from "./config/index.js";
import { app } from "./app.js";

// Server start
const server = app.listen(config.PORT, () => {
  console.log(`Environment: ${config.NODE_ENV}`);
  console.log(`Server running on port ${config.PORT}`);
});

// Graceful shutdown process
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
