import express, { Router } from "express";
import { doctorAuth } from "../../middlewares/doctor_auth.js";
import { upload } from "../../middlewares/multer.js";
import {
  loginDoctor,
  registerDoctor,
  verifyDoctorOtpAndCreateAccount,
} from "./doctor_controller.js";

const doctorRouter = express.Router();

doctorRouter.post("/register_doctor", registerDoctor);
doctorRouter.post("/verify_otp", verifyDoctorOtpAndCreateAccount);
doctorRouter.post("/login_doctor", loginDoctor);

export default doctorRouter;
