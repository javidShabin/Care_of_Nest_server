// app.js
import express from "express";

import { registerPatient } from "./modules/patients/patient_controller.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());  // Parse JSON

// Register route
app.post("/register", registerPatient);

// Global error handler
app.use(errorHandler);

export default app;