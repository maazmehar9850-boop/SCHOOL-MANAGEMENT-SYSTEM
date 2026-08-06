import "dotenv/config";
import connectDB from "../config/db.js";
import app from "../app.js";

export default async function handler(req, res) {
  try {
    if (req.url !== "/" && req.url !== "") {
      await connectDB();
    }
    return app(req, res);
  } catch (error) {
    console.error("Vercel handler failed:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
}
