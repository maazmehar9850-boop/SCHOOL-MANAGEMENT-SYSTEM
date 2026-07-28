import { configDotenv } from "dotenv";
import connectDB from "../config/db.js";
import app from "../app.js";

configDotenv();
await connectDB();

export default app;
