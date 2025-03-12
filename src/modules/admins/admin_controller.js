import cloudinaryInstance from "../../configs/cloudinary.js";
import transporter from "../../configs/nodemailer.js";
import { createError } from "../../utils/createError.js";
import { generateAdminToken } from "../../utils/token.js";
import Admin from "./admin_model.js";
import TempAdmin from "./temp_admin_model.js";

// Register new admin
export const registerAdmin = async (req, res, next) => {
  // Destructer every field from request body
  const { fullName, email, password, confirmPassword, phone } = req.body;
  try {
    // Check if the required fields are present
    if (!fullName || !email || !password || !confirmPassword || !phone) {
      return next(createError(400, "All fields are required"));
    }
    // check password and conform password are same
    if (password !== confirmPassword) {
      return next(createError(422, "Passwords do not match"));
    }
    // Check if the admin already existe
    const existAdmin = await Admin.findOne({ email });
    if (existAdmin) {
      return next(createError(409, "Admin already exists"));
    }
  } catch (error) {}
};
// Verify OTP and create a new admin account
export const verifyAdminOtpAndCreateAccount = async (req, res, next) => {};
// Login admin
export const loginAdmin = async (req, res, next) => {};
// Get logged-in admin's own profile
export const getLoggedInAdminProfile = async (req, res, next) => {};
// Update logged-in admin's profile
export const updateAdminProfile = async (req, res, next) => {};
// Send OTP for password reset
export const sendPasswordResetOtp = async (req, res, next) => {};
// Verify OTP and reset password
export const verifyOtpAndResetPassword = async (req, res, next) => {};
// Update doctor's password
export const updateAdminPassword = async (req, res, next) => {};
// Logout doctor and clear session
export const logoutAdmin = async (req, res, next) => {};
