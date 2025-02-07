import transporter from "../../configs/nodemailer.js";
import Patient from "./patient_model.js";
import TempPatient from "./temp_patient_model.js";
import bcrypt from "bcrypt"

// Register a new patient
export const registerPatient = async (req, res, next) => {
  const {
    fullName,
    email,
    phone,
    password,
    age,
    gender,
    confirmPassword,
    address,
    profilePicture,
    familyContact,
  } = req.body;
  try {
    // Check if the required fields are present
    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !age ||
      !gender ||
      !familyContact
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check the family contact details is present
    const { relativeName, relativePhone, relation } = familyContact;
    if (!relativeName || !relativePhone || !relation) {
      return res
        .status(400)
        .json({ message: "Family contact details are required" });
    }
    // check password and conform password are same
    if (password !== confirmPassword) {
      return res.status(422).json({ message: "Passwords do not match" });
    }
    // Check if the user already exists
    const existingUser = await Patient.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    // Generate 6 degit OTP for user email conformation
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

    // Save or update temporary patient data with OTP
    await TempPatient.findOneAndUpdate(
      { email },
      {
        fullName,
        email,
        password: hashedPassword,
        otp,
        otpExpiresAt: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
        phone,
        age,
        gender,
        address,
        profilePicture,
        familyContact,
      },
      { upsert: true, new: true }
    );
    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify within 10 minutes.",
    });
  } catch (err) {
    next(err); // Pass unexpected errors to error handler
  }
};

// Verify OTP and create patient account
export const verifyOtpAndCreatePatient = async (req, res, next) => {};

// Log in a patient
export const loginPatient = async (req, res, next) => {};

// Get all registered patients
export const fetchAllPatients = async (req, res, next) => {};

// Get a single patient's profile
export const fetchPatientProfile = async (req, res, next) => {};

// Update a patient's profile
export const updatePatientProfile = async (req, res, next) => {};

// Send OTP for password reset
export const sendForgotPasswordOtp = async (req, res, next) => {};

// Verify password reset OTP
export const verifyForgotPasswordOtp = async (req, res, next) => {};

// Update patient's password after OTP verification
export const updatePatientPassword = async (req, res, next) => {};

// Log out a patient and clear session cookie
export const logoutPatient = async (req, res, next) => {};
