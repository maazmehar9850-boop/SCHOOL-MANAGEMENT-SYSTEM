import { configDotenv } from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

configDotenv();

const port = process.env.PORT || 3030;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is started at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
