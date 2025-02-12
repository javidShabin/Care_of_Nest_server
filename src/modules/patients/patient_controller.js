import transporter from "../../configs/nodemailer.js";
import { createError } from "../../utils/createError.js";
import { generateUserToken } from "../../utils/token.js";
import Patient from "./patient_model.js";
import TempPatient from "./temp_patient_model.js";
import bcrypt from "bcrypt";

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
      return next(createError(400, "All fields are required"));
    }
    // Check the family contact details is present
    const { relativeName, relativePhone, relation } = familyContact;
    if (!relativeName || !relativePhone || !relation) {
      return next(createError(400, "Family contact details are required"));
    }
    // check password and conform password are same
    if (password !== confirmPassword) {
      return next(createError(422, "Passwords do not match"));
    }
    // Check if the user already exists
    const existingUser = await Patient.findOne({ email });
    if (existingUser) {
      return next(createError(409, "User already exists"));
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
export const verifyOtpAndCreatePatient = async (req, res, next) => {
  // Destructer the emial and otp from request body
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return next(createError(400, "Email and OTP are required"));
    }
    // Find the temporary patient by email
    const tempPatient = await TempPatient.findOne({ email });
    if (!tempPatient) {
      return next(createError(404, "User not found"));
    }
    // verify the OTP same or not
    if (tempPatient.otp !== otp) {
      return next(createError(400, "Invalid OTP"));
    }
    // Check the OTP expire or not
    if (tempPatient.otpExpiresAt < Date.now()) {
      return next(createError(400, "OTP has expired"));
    }
    // Create new patient and save the user
    const newPatient = new Patient({
      fullName: tempPatient.fullName,
      email: tempPatient.email,
      phone: tempPatient.phone,
      password: tempPatient.password,
      age: tempPatient.age,
      gender: tempPatient.gender,
      profilePicture: tempPatient.profilePicture,
      address: tempPatient.address,
      familyContact: tempPatient.familyContact,
      reports: tempPatient.reports,
    });
    await newPatient.save();
    // Generate patient token using patient id, email and role
    const token = generateUserToken({
      _id: newPatient._id,
      email: newPatient.email,
      role: "patient",
    });
    // Set the token to cookie
    res.cookie("patientToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    await TempPatient.deleteOne({ email });
    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Log in a patient
export const loginPatient = async (req, res, next) => {
  // Destructer email and password
  const { email, password } = req.body;
  try {
    // Check if the required fields are present
    if (!email || !password) {
      return next(createError(400, "All fields are required"));
    }
    // Check if the user exists
    const existingPatient = await Patient.findOne({ email });
    if (!existingPatient) {
      return next(createError(401, "Patient does not exist"));
    }
    // Compare password if the password is correct
    const isPasswordCorrect = await bcrypt.compareSync(
      password,
      existingPatient.password
    );
    if (!isPasswordCorrect) {
      return next(createError(401, "Invalid credentials"));
    }
    // Generate a token for the patient
    const token = generateUserToken({
      _id: existingPatient._id,
      email: existingPatient.email,
      role: "patient",
    });

    res.cookie("patientToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60 * 60 * 1000, // 5 hours
    });
    return res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    next(error);
  }
};

// Get all registered patients
export const fetchAllPatients = async (req, res, next) => {
  try {
    // Get all patients from the database
    const patients = await Patient.find({}).select("-password");
    // Check if there are any patients
    if (patients.length === 0) {
      return next(createError(404, "No patients found"));
    }
    // Return the patients
    return res.status(200).json({ patients });
  } catch (error) {
    console.error("Error getting patients:", error);
    return next(error);
  }
};

// Get a single patient's profile
export const fetchPatientProfile = async (req, res, next) => {
  try {
    // Get the patient Id from the request parameters
    const { _id } = req.params;
    // Find the patient by Id from the database
    const patient = await Patient.findById(_id).select("-password");
    // Check if the patient exists
    if (!patient) {
      return next(createError(404, "Patient not found"));
    }
    // Return the patient profile
    return res.status(200).json({ patient });
  } catch (error) {
    console.error("Error getting patient profile:", error);
    return next(createError(500, "Internal server error"));
  }
};

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
