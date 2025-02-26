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
export const verifyDoctorOtpAndCreateAccount = async (req, res, next) => {
  // Destructer the emial and otp from request body
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return next(createError(404, "Email and OTP are required"));
    }
    // Find the temporary doctor by email
    const tempDoctor = await TempDoctor.findOne({ email });
    if (!tempDoctor) {
      return next(createError(400, "Doctor not found"));
    }
    // Cnompare the OTP and compare the Expair time
    if (tempDoctor.otp !== otp) {
      return next(createError(400, "Invalid OTP"));
    }
    if (tempDoctor.otpExpiresAt < Date.now()) {
      return next(createError(400, "OTP has expired"));
    }

    // If everuthing correct create the new doctor
    const newDoctor = new Doctor({
      fullName: tempDoctor.fullName,
      email: tempDoctor.email,
      password: tempDoctor.password,
      phone: tempDoctor.phone,
      gender: tempDoctor.gender,
      specialization: tempDoctor.specialization,
      profilePicture: tempDoctor.profilePicture,
      experience: tempDoctor.experience,
      qualifications: tempDoctor.qualifications,
      availability: tempDoctor.availability,
      consultationFee: tempDoctor.consultationFee,
      socialLinks: tempDoctor.socialLinks,
      timeSlots: tempDoctor.timeSlots,
    });
    await newDoctor.save();
    // Generate doctor token using doctor id, email and role
    const token = generateDoctorToken({
      _id: newDoctor._id,
      email: newDoctor.email,
      role: "doctor",
    });
    res.cookie("doctorToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    // Delete the temp patient from database
    await tempDoctor.deleteOne({ email });
    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.ADMIN_EMAIL, // Admin's email address
      subject: "New Doctor Registration",
      text: `A new doctor has registered:

      Full Name: ${newDoctor.fullName}
      Email: ${newDoctor.email}
      Phone: ${newDoctor.phone}
      Specialization: ${newDoctor.specialization}
      Experience: ${newDoctor.experience} years

      Please review their profile.`,
    };
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    // Return a success response
    res.status(201).json({
      msg: "Doctor registered successfully",
      doctor: newDoctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

// Login doctor
export const loginDoctor = async (req, res, next) => {
  // Destrcter email and password from request body
  const { email, password } = req.body;
  try {
    // Check the email and password is present or not
    if (!email || !password) {
      return next(createError(400, "Email and password are required"));
    }
    // Check if the user exists
    const existingDoctor = await Doctor.findOne({ email });
    if (!existingDoctor) {
      return next(createError(400, "Doctor does not exist"));
    }
    // Check the password is corrent
    const isPasswordCorrect = await bcrypt.compareSync(
      password,
      existingDoctor.password
    );
    if (!isPasswordCorrect) {
      return next(createError(404, "Invalid credentials"));
    }
    // Generate a token for the doctor
    const token = generateDoctorToken({
      _id: existingDoctor._id,
      email: existingDoctor.email,
      role: "doctor",
    });
    res.cookie("doctorToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60 * 60 * 1000, // 5 hours
    });
    return res.status(200).json({ message: "Doctor logged in successfully" });
  } catch (error) {
    console.error("Error logging in user:", error);
    next(error);
  }
};

// Get list of all doctors
export const fetchAllDoctors = async (req, res, next) => {
  try {
    // Get all patient from the database, avoid password
    const doctors = await Doctor.find({}).select("-password");
    // Check if there are only doctor
    if (doctors.length === 0) {
      return next(createError(404, "No doctors found found"));
    }
    // Return the patients
    return res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    console.error("Error getting doctors:", error);
    next(error);
  }
};

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
