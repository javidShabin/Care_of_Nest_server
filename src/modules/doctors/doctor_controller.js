import cloudinaryInstance from "../../configs/cloudinary.js";
import transporter from "../../configs/nodemailer.js";
import { createError } from "../../utils/createError.js";
import { generateDoctorToken } from "../../utils/token.js";
import Doctor from "./doctor_model.js";
import TempDoctor from "./temp_doctor_model.js";
import bcrypt from "bcrypt";

// Register a new doctor
export const registerDoctor = async (req, res, next) => {
  // Destructer doctor details
  const {
    fullName,
    email,
    password,
    phone,
    gender,
    specialization,
    qualifications,
    experience,
    profilePicture,
    confirmPassword,
    availability,
    consultationFee,
    socialLinks,
    timeSlots,
  } = req.body;
  try {
    // Check needed fields are present or not
    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword || // Fixed the typo
      !phone ||
      !gender ||
      !specialization ||
      !qualifications ||
      !experience ||
      !availability ||
      !timeSlots
    ) {
      return next(createError(400, "All fields are required"));
    }
    // Compare password and conform password
    if (password !== confirmPassword) {
      return next(createError(400, "Passwords do not match"));
    }
    // Check the doctor already exist or not
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return next(createError(400, "Doctor already exists"));
    }
    // Generate OTP for sending doctor email for comformation
    const otp = Math.floor(100000 + Math.random() * 900000);
    // Mail details
    const mailOptions = {
      from: process.env.EMAIL, // From email
      to: email, // To email from user
      subject: "Your OTP for Registration",
      text: `Your OTP is ${otp}. Please verify to complete your registration.`,
    };
    await transporter.sendMail(mailOptions);
    // Hash the passowrd using bcypt
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create the temporary doctor detials
    await TempDoctor.updateOne(
      { email },
      {
        fullName,
        email,
        password: hashedPassword,
        otp,
        otpExpiresAt: Date.now() + 10 * 60 * 1000, // Make expiration time configurable
        phone,
        gender,
        profilePicture,
        socialLinks,
        specialization,
        qualifications,
        consultationFee,
        experience,
        availability,
        timeSlots,
      },
      { upsert: true, new: true }
    );
    // Send response
    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify within 10 minutes.",
    });
  } catch (error) {
    console.error("Error registering doctor:", error);
    next(error);
  }
};

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
