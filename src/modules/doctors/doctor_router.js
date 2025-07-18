import express, { Router } from "express";
import { doctorAuth } from "../../middlewares/doctor_auth.js";
import { upload } from "../../middlewares/multer.js";
import {
  fetchAdminVerifiedDoctors,
  fetchAllDoctors,
  getDoctorProfileById,
  getLoggedInDoctorProfile,
  loginDoctor,
  logoutDoctor,
  registerDoctor,
  sendPasswordResetOtp,
  updateDoctorPassword,
  updateDoctorProfile,
  verifyDoctorOtpAndCreateAccount,
  verifyOtpAndResetPassword,
} from "./doctor_controller.js";
import { adminAuth } from "../../middlewares/admin_auth.js";

const doctorRouter = express.Router();

doctorRouter.post("/register_doctor", registerDoctor);
doctorRouter.post("/verify_otp", verifyDoctorOtpAndCreateAccount);
doctorRouter.post("/login_doctor", loginDoctor);
doctorRouter.get("/get_doctors_list", adminAuth, fetchAllDoctors);
doctorRouter.get("/verifyed_doctors_list", fetchAdminVerifiedDoctors);
doctorRouter.get("/doctor_profile/:_id", getDoctorProfileById);
doctorRouter.get("/doctor_loged_profile", doctorAuth, getLoggedInDoctorProfile);
doctorRouter.put(
  "/update_doctor_profile",
  doctorAuth,
  upload.single("profilePicture"),
  updateDoctorProfile
);
doctorRouter.post("/forgot_password_otp", sendPasswordResetOtp)
doctorRouter.post("/verify_password_otp", verifyOtpAndResetPassword)
doctorRouter.patch("/update_password", updateDoctorPassword)
doctorRouter.delete("/logout_doctor", doctorAuth, logoutDoctor)

export default doctorRouter;
