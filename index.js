import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { connectDb } from "./src/configs/database.js";


const PORT = 4000;
const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(cookieParser()); // Cookie parser

// Start the server
connectDb()
  .then(() => {
    console.log("Connected to MongoDB"); // First connect the databse
    app.listen(PORT, () => {
      // Then start the server
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
