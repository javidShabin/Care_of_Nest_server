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
    res.status(500).json({ message: "Server error" });
  }
};
