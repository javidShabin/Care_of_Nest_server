import express, {Router} from "express"
import {doctorAuth} from "../../middlewares/doctor_auth.js"
import { upload } from "../../middlewares/multer.js";
import { registerDoctor } from "./doctor_controller.js";

const doctorRouter = express.Router();

doctorRouter.post("/register_doctor", registerDoctor)

export default doctorRouter