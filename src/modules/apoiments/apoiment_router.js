import express from 'express';
import { patientAuth } from '../../middlewares/patient_auth.js';
import { getDoctorAvailability } from './apoiment_controller.js';
const apoimentRouter = express.Router();

apoimentRouter.get("/available_slot/:doctorId", getDoctorAvailability )

export default apoimentRouter