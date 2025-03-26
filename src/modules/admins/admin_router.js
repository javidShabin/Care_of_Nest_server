import express, { Router } from "express";
import { adminAuth } from "../../middlewares/admin_auth.js";
import { upload } from "../../middlewares/multer.js";
import { getLoggedInAdminProfile, loginAdmin, logoutAdmin, registerAdmin, sendPasswordResetOtp, updateAdminPassword, updateAdminProfile, verifyAdminOtpAndCreateAccount, verifyOtpAndResetPassword } from "./admin_controller.js";

const adminRouter = express.Router();

adminRouter.post("/register_admin", registerAdmin)
adminRouter.post("/verify_otp", verifyAdminOtpAndCreateAccount)
adminRouter.post("/login_admin", loginAdmin)
adminRouter.get("/admin_profile", adminAuth, getLoggedInAdminProfile)
adminRouter.put("/update_admin_profile", adminAuth, upload.single("profilePicture"), updateAdminProfile)
adminRouter.post("/password_otp", sendPasswordResetOtp)
adminRouter.post("/verify_password_otp", verifyOtpAndResetPassword)
adminRouter.patch("/update_password", updateAdminPassword)
adminRouter.delete("/logout_admin", logoutAdmin)

export default adminRouter;
