// app.js
import express from "express";

import errorHandler from "./middlewares/errorHandler.js";
import apiRouter from "./api.js";

const app = express();

app.use(express.json());  // Parse JSON

app.use("/api", apiRouter)

// Global error handler
app.use(errorHandler);

export default app;