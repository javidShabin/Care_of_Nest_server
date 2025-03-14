import Appointment from '../apoiments/apoiment_model.js';
import Doctor from '../doctors/temp_doctor_model.js';

export const bookAppointment = async (req, res, next) => {
    const { doctorId, date, timeSlot, reason } = req.body;
    const userId = req.patient.id
    

}