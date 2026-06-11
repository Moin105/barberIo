import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { runMigrations } from "./migrate.js";
import { ensureSuperAdmin } from "./bootstrap.js";
import { attachUser } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import ownerRoutes from "./routes/owner.js";
import publicRoutes from "./routes/public.js";
import bookingRoutes from "./routes/bookings.js";
import adminRoutes from "./routes/admin.js";
import barberRoutes from "./routes/barber.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(express.json({ limit: "200kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_ORIGIN.split(",").map((s) => s.trim()),
    credentials: true,
  })
);
app.use(attachUser());

app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/owner", ownerRoutes);
app.use("/public", publicRoutes);
app.use("/bookings", bookingRoutes);
app.use("/admin", adminRoutes);
app.use("/barber", barberRoutes);

app.use((err, _req, res, _next) => {
  console.error("[unhandled]", err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  if (process.env.RUN_MIGRATIONS !== "false") {
    try {
      await runMigrations();
      await ensureSuperAdmin();
    } catch (e) {
      console.error("[boot] failed:", e.message);
      process.exit(1);
    }
  }
  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
    console.log(`[server] CORS origin: ${CLIENT_ORIGIN}`);
  });
}

start();
