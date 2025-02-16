import cloudinaryInstance from "../../configs/cloudinary.js";
import transporter from "../../configs/nodemailer.js";
import { createError } from "../../utils/createError.js";
import { generateDoctorToken } from "../../utils/token.js";
import Doctor from "./doctor_model.js";
import TempDoctor from "./temp_doctor_model.js";

// Register a new doctor
export const registerDoctor = async (req, res, next) => {};

// Verify OTP and create a new doctor account
export const verifyDoctorOtpAndCreateAccount = async (req, res, next) => {};

// Login doctor
export const loginDoctor = async (req, res, next) => {};

// Get list of all doctors
export const fetchAllDoctors = async (req, res, next) => {};

// Get all doctors verified by admin
export const fetchAdminVerifiedDoctors = async (req, res, next) => {};

// Get doctor profile (for user view) by ID
export const getDoctorProfileById = async (req, res, next) => {};

// Get logged-in doctor's own profile
export const getLoggedInDoctorProfile = async (req, res, next) => {};

// Update logged-in doctor's profile
export const updateDoctorProfile = async (req, res, next) => {};

// Send OTP for password reset
export const sendPasswordResetOtp = async (req, res, next) => {};

// Verify OTP and reset password
export const verifyOtpAndResetPassword = async (req, res, next) => {};

// Update doctor's password (while logged in)
export const updateDoctorPassword = async (req, res, next) => {};

// Logout doctor and clear session
export const logoutDoctor = async (req, res, next) => {};
