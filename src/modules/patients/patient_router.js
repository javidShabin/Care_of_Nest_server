import express from 'express';
import { registerPatient, verifyOtpAndCreatePatient } from './patient_controller.js';

const patientRouter = express.Router();

// Register a new patient
patientRouter.post('/register', registerPatient);
patientRouter.post('/verify_otp', verifyOtpAndCreatePatient)


export default patientRouter;