import cloudinaryInstance from "../../configs/cloudinary.js";
import transporter from "../../configs/nodemailer.js";
import { createError } from "../../utils/createError.js";
import { generateAdminToken } from "../../utils/token.js";
import Admin from "./admin_model.js";
import TempAdmin from "./temp_admin_model.js";

// Register new admin
export const registerAdmin = async (req, res, next) => {}
// Verify OTP and create a new admin account
export const verifyAdminOtpAndCreateAccount = async (req, res, next) => {}
// Login admin
export const loginAdmin = async (req, res, next) => {}
// Get logged-in admin's own profile
export const getLoggedInAdminProfile = async (req, res, next) => {}
// Update logged-in admin's profile
export const updateAdminProfile = async (req, res, next) => {}
// Send OTP for password reset
export const sendPasswordResetOtp = async (req, res, next) => {}
// Verify OTP and reset password
export const verifyOtpAndResetPassword = async (req, res, next) => {}
// Update doctor's password
export const updateAdminPassword = async (req, res, next) => {}
// Logout doctor and clear session
export const logoutAdmin = async (req, res, next) => {}