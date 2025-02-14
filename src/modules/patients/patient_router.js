import express, { Router } from "express";
import {
  fetchAllPatients,
  fetchPatientProfile,
  loginPatient,
  registerPatient,
  sendForgotPasswordOtp,
  updatePatientProfile,
  verifyOtpAndCreatePatient,
} from "./patient_controller.js";
import { patientAuth } from "../../middlewares/patient_auth.js";
import { upload } from "../../middlewares/multer.js";

const patientRouter = express.Router();

// Register a new patient
patientRouter.post("/register", registerPatient);
patientRouter.post("/verify_otp", verifyOtpAndCreatePatient);
patientRouter.post("/login_patient", loginPatient);
patientRouter.get("/patients_list", fetchAllPatients);
patientRouter.get("/patient_profile/:_id", patientAuth, fetchPatientProfile);
patientRouter.put(
  "/update_patient_profile",
  patientAuth,
  upload.single("profilePicture"),
  updatePatientProfile
);
patientRouter.post("/forgot_password_otp", sendForgotPasswordOtp)

export default patientRouter;
