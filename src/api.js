import express from "express"
import patientRouter from "./modules/patients/patient_router.js";
const apiRouter = express.Router()

apiRouter.use("/patient", patientRouter)

export default apiRouter;