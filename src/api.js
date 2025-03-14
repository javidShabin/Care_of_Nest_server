import express from "express";
import patientRouter from "./modules/patients/patient_router.js";
import doctorRouter from "./modules/doctors/doctor_router.js";
import adminRouter from "./modules/admins/admin_router.js";
import apoimentRouter from "./modules/apoiments/apoiment_router.js";
const apiRouter = express.Router();

apiRouter.use("/patient", patientRouter);
apiRouter.use("/doctor", doctorRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/apoiment", apoimentRouter)

export default apiRouter;
