// server.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { connectDb } from "./src/configs/database.js"; // Correct path to database.js inside src
import app from "./src/app.js";


const PORT = process.env.PORT || 4000; // Use dynamic port if available

const server = express();

// Middleware
server.use(helmet());
server.use(express.json());
server.use(
  cors({
    origin: true,
    credentials: true,
  })
);
server.use(cookieParser()); // Cookie parser

// Mount the routes defined in app.js
server.use("/app", app);

server.use("/", (req, res) => {
  res.json({ message: "Hello world" });
});



// Start the server after database connection
connectDb()
  .then(() => {
    console.log("Connected to MongoDB"); // First, connect to the database
    server.listen(PORT, () => {
      // Then, start the server
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
