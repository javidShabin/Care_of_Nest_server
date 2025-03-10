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

export const bookApoiment = async (req, res, next) => {
  const { doctorId, date, timeSlot, reason } = req.body;
  const patientId = req.patient.id;

  try {
    if (!doctorId || !date || !timeSlot || !reason) {
      return next(createError(404, "All fields are required"));
    }
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const isSlotValid = doctor.availability.some((day) =>
      day.timeSlots.some((slot) => slot._id.toString() === timeSlot)
    );

    if (!isSlotValid) {
      return next(createError(400, "Invalid time slot"));
    }

    // const arr = doctor.availability.map(
    //   (slots) => slots._id.toString() === timeSlot
    // );
    // console.log(arr, "=====booked slotes");
  } catch (error) {}
};
