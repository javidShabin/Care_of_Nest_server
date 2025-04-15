import express from 'express';
import { patientAuth } from '../../middlewares/patient_auth.js';
import { bookApoiment, getDoctorAvailability, getPatientAppointments } from './apoiment_controller.js';
const apoimentRouter = express.Router();

apoimentRouter.get("/available_slot/:doctorId", getDoctorAvailability )
apoimentRouter.post("/book_slot", patientAuth, bookApoiment)
apoimentRouter.get("/get_apoiment_patient", patientAuth, getPatientAppointments)

export default apoimentRouter