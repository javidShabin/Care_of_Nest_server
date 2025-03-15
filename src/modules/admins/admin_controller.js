import cloudinaryInstance from "../../configs/cloudinary.js";
import transporter from "../../configs/nodemailer.js";
import { createError } from "../../utils/createError.js";
import { generateAdminToken } from "../../utils/token.js";
import Admin from "./admin_model.js";
import TempAdmin from "./temp_admin_model.js";
import bcrypt from "bcrypt";

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
    // Generate 6 degit OTP for admin email conformation and security
    const otp = Math.floor(100000 + Math.random() * 900000);
    // setUp email message details
    const mailOptions = {
      from: process.env.EMAIL, // From email
      to: email, // To email from user
      subject: "Your OTP for Registration",
      text: `Your OTP is ${otp}. Please verify to complete your registration.`,
    };
    // Send the mail with creating mail details
    await transporter.sendMail(mailOptions);
    // Hash the patient passowrd
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);
    // Save or update temporary admin data with OTP and expire date
    await TempAdmin.findOneAndUpdate(
      { email },
      {
        fullName,
        email,
        password: hashedPassword,
        otp,
        otpExpiresAt: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
        phone,
      },
      { upsert: true, new: true }
    );
    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify within 10 minutes.",
    });
  } catch (error) {}
};
// Verify OTP and create a new admin account
export const verifyAdminOtpAndCreateAccount = async (req, res, next) => {
  // Destructer the emial and otp from request body
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return next(createError(400, "Email and OTP are required"));
    }
    // Find the temporary admin by email
    const temAdmin = await TempAdmin.findOne({ email });
    if (!temAdmin) {
      return next(createError(404, "Admin not found"));
    }
    // verify the OTP same or not
    if (temAdmin.otp !== otp) {
      return next(createError(400, "Invalid OTP"));
    }
    // Check the OTP expire or not
    if (temAdmin.otpExpiresAt < Date.now()) {
      return next(createError(400, "OTP has expired"));
    }
    // Create new admin and save the server
    const newAdmin = new Admin({
      fullName: temAdmin.fullName,
      email: temAdmin.email,
      password: temAdmin.password,
      phone: temAdmin.phone,
    });
    await newAdmin.save();
    // Generate admin token using using id, email and role
    const token = generateAdminToken({
      _id: newAdmin._id,
      email: newAdmin.email,
      role: "admin",
    });
    // Set the token to cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    await TempAdmin.deleteOne({ email });
    res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error) {
    next(error);
  }
};
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
