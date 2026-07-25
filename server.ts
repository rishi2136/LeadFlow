import { startServer } from "./server/app";

startServer().catch((err) => {
  console.error("Fatal error starting LeadFlow Express server:", err);
});
