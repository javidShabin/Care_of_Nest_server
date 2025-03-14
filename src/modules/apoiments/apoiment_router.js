import express from 'express';
import { bookAppointment } from './apoiment_controller.js';
import { patientAuth } from '../../middlewares/patient_auth.js';
const apoimentRouter = express.Router();

apoimentRouter.post("/book_apoiment", patientAuth, bookAppointment)

export default apoimentRouter