import { createError } from "../../utils/createError.js";
import Appointment from "../apoiments/apoiment_model.js";
import Doctor from "../doctors/doctor_model.js";

// Get the doctor availability
export const getDoctorAvailability = async (req, res, next) => {
  // Get docrot id from request params
  const { doctorId } = req.params;
  try {
    // Find the doctor by id
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return next(createError(404, "Doctor not found"));
    }
    res.json({
      doctorId,
      availability: doctor.availability,
    });
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Book a apoiment
export const bookApoiment = async (req, res, next) => {
  // Destructer the needed fields from request body
  const { doctorId, date, timeSlot, reason } = req.body;
  const patientId = req.patient.id; // Get patient id from authentication

  try {
    // Check the required fields are present or not
    if (!doctorId || !date || !timeSlot || !reason) {
      return next(createError(404, "All fields are required"));
    }
    // Find the doctor using Id
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Check the given slot is available
    const isSlotValid = doctor.availability.some((day) =>
      day.timeSlots.some((slot) => slot._id.toString() === timeSlot)
    );

    if (!isSlotValid) return next(createError(400, "Invalid time slot"));
    // Check if slot already booked
    const isAlreadyBooked = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
    });
    if (isAlreadyBooked) return next(createError(409, "Slot already booked"));
    // Add the new apoiment
    const appointment = new Appointment({
      patientId,
      doctorId,
      date,
      timeSlot,
      reason,
    });
    await appointment.save(); // Save the apoiment
    res
      .status(201)
      .json({ message: "Appointment booked successfully", appointment });
  } catch (error) {
    next(error);
  }
};

// Get apoiment for patient
export const getPatientAppointments = async (req, res, next) => {
  // Get patient Id from authentication
  const patientId = req.patient.id;
  try {
    // Find apoiment by id
    const appointments = await Appointment.find({ patientId })
    console.log(appointments)
  } catch (error) {
    
  }
}