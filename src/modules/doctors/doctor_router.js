import express, {Router} from "express"
import {doctorAuth} from "../../middlewares/doctor_auth.js"
import { upload } from "../../middlewares/multer.js";

const doctorRouter = express.Router();


export default doctorRouter