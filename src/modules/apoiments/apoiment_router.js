import express from 'express';
import { patientAuth } from '../../middlewares/patient_auth.js';
import { bookApoiment, getDoctorAvailability } from './apoiment_controller.js';
const apoimentRouter = express.Router();

apoimentRouter.get("/available_slot/:doctorId", getDoctorAvailability )
apoimentRouter.post("/book_slot", patientAuth, bookApoiment)

export default apoimentRouter