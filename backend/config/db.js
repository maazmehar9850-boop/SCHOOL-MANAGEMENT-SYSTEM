import dns from "dns";
import mongoose from "mongoose";

// Hotspot/router DNS often breaks Node's SRV lookups for mongodb+srv://
// while Compass (different DNS stack) still works.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = (async () => {
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set in environment variables.");
      }

      const conn = await mongoose.connect(process.env.DATABASE_URL, {
        dbName: "MERNSTAG",
      });
      console.log("MongoDB connected", conn.connection.host);
      return conn.connection;
    })().catch((error) => {
      connectionPromise = undefined;
      console.error("Error connecting to MongoDB:", error.message);
      throw error;
    });
  }

  return connectionPromise;
};

export default connectDB;
