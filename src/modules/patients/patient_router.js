import express from 'express';
import { loginPatient, registerPatient, verifyOtpAndCreatePatient } from './patient_controller.js';

const patientRouter = express.Router();

// Register a new patient
patientRouter.post('/register', registerPatient);
patientRouter.post('/verify_otp', verifyOtpAndCreatePatient)
patientRouter.post("/login_patient", loginPatient)


export default patientRouter;