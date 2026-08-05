import express from "express";
import cors from "cors";
import routing from "./routing/routing.js";
import { uploadsRoot } from "./utils/uploadPaths.js";

const app = express();

app.use(express.json({ limit: "1mb" }));

const allowedOrigins = new Set(
  [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://cms-maaz.vercel.app",
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : []),
  ]
    .map((o) => (o || "").trim())
    .filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

app.use("/uploads", express.static(uploadsRoot));
app.use("/api/v1", routing);

app.get("/", (req, res) => {
  res.json({ name: "Aspira College API", status: "ok", version: "1.0.0" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

export default app;
