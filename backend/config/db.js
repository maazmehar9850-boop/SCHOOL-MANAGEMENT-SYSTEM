import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set in environment variables.");
    }

    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      dbName: "MERNSTAG",
    });
    console.log("MongoDB connected" ,conn.connection.host);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;