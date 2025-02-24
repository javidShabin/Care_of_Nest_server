import express, { Router } from "express";
import {
  fetchAllPatients,
  fetchPatientProfile,
  loginPatient,
  logoutPatient,
  registerPatient,
  sendForgotPasswordOtp,
  updatePatientPassword,
  updatePatientProfile,
  verifyForgotPasswordOtp,
  verifyOtpAndCreatePatient,
} from "./patient_controller.js";
import { patientAuth } from "../../middlewares/patient_auth.js";
import { upload } from "../../middlewares/multer.js";

const patientRouter = express.Router();

// Register a new patient
patientRouter.post("/register_patient", registerPatient);
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
patientRouter.post("/forgot_password_otp", sendForgotPasswordOtp);
patientRouter.post("/verify_password_otp", verifyForgotPasswordOtp);
patientRouter.patch("/change-password", updatePatientPassword);
patientRouter.delete("/patient-logout", logoutPatient);

export default patientRouter;
