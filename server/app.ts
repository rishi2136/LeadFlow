import express from "express";
import session from "express-session";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createSessionStore, getDbStatus } from "./db/connection";
import { corsMiddleware, corsSafetyNet } from "./middleware/cors";
import authRouter from "./routes/auth";
import leadsRouter from "./routes/leads";

export async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. CORS Middleware & Preflight Handling (Prevents any CORS errors)
  app.use(corsMiddleware);
  app.use(corsSafetyNet);

  // 2. Body Parser Middleware for Form Handling
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 3. Initialize MongoDB Connection & Session Store
  const { store, status } = await createSessionStore();

  // 4. Express Session Configuration with MongoStore (or MemoryStore fallback)
  const sessionSecret = process.env.SESSION_SECRET || "leadflow-secure-session-secret-2026";
  
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: store, // MongoStore if MongoDB connected, else default MemoryStore
      cookie: {
        secure: false, // HTTP in sandbox environment
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: "lax",
      },
    })
  );

  // 5. Health Check & Diagnostics Endpoint
  app.get("/api/health", (req, res) => {
    const currentDbStatus = getDbStatus();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      sessionActive: !!(req.session && req.session.user),
      mongoConnected: currentDbStatus.isMongoConnected,
      sessionStore: currentDbStatus.storeType,
      mongoUrl: currentDbStatus.mongoUrl || "Not configured (using MemoryStore)",
    });
  });

  // Explicit test endpoint for 404 error testing
  app.get("/api/test-404", (req, res) => {
    res.status(404).json({
      error: "Resource Not Found",
      message: "The requested route /api/test-404 does not exist on LeadFlow server.",
    });
  });

  // 6. Mount Modular API Routers
  app.use("/api/auth", authRouter);
  app.use("/api/leads", leadsRouter);

  // Catch-all API 404 handler for unknown /api/* requests
  app.all("/api/*", (req, res) => {
    res.status(404).json({
      error: "API Endpoint Not Found",
      path: req.path,
      message: `The API endpoint ${req.method} ${req.path} does not exist on LeadFlow express server.`,
    });
  });

  // 7. Vite Middleware for Development / Static serving in Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 LeadFlow Express Server running on http://0.0.0.0:${PORT}`);
    console.log(`📦 Session Store: ${status.storeType}`);
  });
}
