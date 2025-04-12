import { createError } from "../../utils/createError.js";
import Appointment from "../apoiments/apoiment_model.js";
import Doctor from "../doctors/doctor_model.js";
import { format } from "date-fns";

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

// Book a appoinment
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

    const apoimentDay = format(new Date(date), "EEEE");
    // Add the new apoiment
    const appointment = new Appointment({
      patientId,
      doctorId,
      date,
      timeSlot,
      day: apoimentDay,
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

// Get all appoinment for patient
export const getPatientAppointments = async (req, res, next) => {
  // Get patient Id from authentication
  const patientId = req.patient.id;
  try {
    // Find apoiment by id
    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "fullName specialization")
      .sort({ date: 1 });
    console.log(appointments);
    if (!appointments) {
      return next(createError(404, "Apoiment not found"));
    }
    // If find apoiments sedn as response
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Get all appoinment for doctor
export const getDoctorAppointments = async (req, res, next) => {
  // Get patient Id from authentication
  const doctorId = req.doctor.id;
  try {
    // Find apoiment by doctor Id
    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "fullName email") // show patient details
      .sort({ date: 1 });
    if (!appointments) {
      return next(createError(404, "Apoiment not found"));
    }
    // If find apoiments sedn as response
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Cancel appoinment
export const cancelAppointment = async (req, res, next) => {
  // Get appoinment id from request params
  const { id } = req.params;
  try {
    // Find the appoinment by id
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return next(createError(404, "Appointment not found"));
    }
    // Change the appoinment status
    appointment.status = "cancelled";
    await appointment.save(); // save the status

    res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Reschedule appoinemtn
export const rescheduleAppoinment = async (req, res, next) => {
  // Destructer the needed fields
  const { appointmentId, newDate, newTimeSlot } = req.body;
  try {
    // Find the appoinment by id
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return next(createError(404, "Appointment not found"));

    // Check if new slot is available and not booked
    const doctor = await Doctor.findById(appointment.doctorId);
    const isSlotValid = doctor.availability.some((day) =>
      day.timeSlots.some((slot) => slot._id.toString() === newTimeSlot)
    );
    if (!isSlotValid) return next(createError(400, "Invalid time slot"));
    const isAlreadyBooked = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: newDate,
      timeSlot: newTimeSlot,
      reason: appointment.reason
    });
    if (isAlreadyBooked) return next(createError(409, "Slot already booked"));
    // Update and save
    appointment.date = newDate;
    appointment.timeSlot = newTimeSlot;
    appointment.day = format(new Date(newDate), "EEEE");
    await appointment.save();

    res.status(200).json({ message: "Appointment rescheduled", appointment });
  } catch (error) {
    next(error);
  }
};
