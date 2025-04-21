import express from 'express';
import { patientAuth } from '../../middlewares/patient_auth.js';
import { bookApoiment, cancelAppointment, getDoctorAppointments, getDoctorAvailability, getPatientAppointments } from './apoiment_controller.js';
import { doctorAuth } from '../../middlewares/doctor_auth.js';
const apoimentRouter = express.Router();

apoimentRouter.get("/available_slot/:doctorId", getDoctorAvailability )
apoimentRouter.post("/book_slot", patientAuth, bookApoiment)
apoimentRouter.get("/get_apoiment_patient", patientAuth, getPatientAppointments)
apoimentRouter.get("/get_apoiment_doctor", doctorAuth, getDoctorAppointments)
apoimentRouter.patch("/cancel_appoinment/:id", patientAuth, cancelAppointment)

export default apoimentRouter