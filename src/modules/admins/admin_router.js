import express, { Router } from "express";
import { adminAuth } from "../../middlewares/admin_auth.js";
import { upload } from "../../middlewares/multer.js";

const adminRouter = express.Router();

export default adminRouter;
