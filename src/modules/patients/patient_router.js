import express from 'express';
import { registerPatient } from './patient_controller.js';

const patientRouter = express.Router();

// Register a new patient
patientRouter.post('/register', registerPatient);


export default patientRouter;