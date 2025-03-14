import cloudinaryInstance from "../../configs/cloudinary.js";
import transporter from "../../configs/nodemailer.js";
import { createError } from "../../utils/createError.js";
import { generateUserToken } from "../../utils/token.js";
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
export const updatePatientProfile = async (req, res, next) => {
  try {
    // Get the patient ID from the authenticated user
    const id = req.user?.id;
    if (!id) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }

    // Extract update fields from request body
    const { fullName, email, phone, age, gender, address } = req.body;

    // Prepare the update data
    const updatedData = {
      fullName,
      email,
      phone,
      age,
      gender,
      address,
    };

    // If file is provided, upload it to Cloudinary
    if (req.file) {
      try {
        const uploadResult = await cloudinaryInstance.uploader.upload(
          req.file.path
        );
        updatedData.profilePicture = uploadResult.secure_url;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "File upload failed",
          error: uploadError.message,
        });
      }
    }

    // Update patient data in the database
    const updatedPatient = await Patient.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    // Handle case when patient is not found
    if (!updatedPatient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    // Respond with updated data
    res.json({
      success: true,
      message: "Your profile updated successfully",
      data: updatedPatient,
    });
  } catch (error) {
    console.error("Error updating patient profile:", error);

    next(error);
  }
};

// Send OTP for password reset
export const sendForgotPasswordOtp = async (req, res, next) => {
  // Destructer email from request body
  const { email } = req.body;
  try {
    // Check if email is provided
    if (!email) {
      return next(createError(400, "Email is required"));
    }

    // Find the patient using the email
    const isPatient = await Patient.findOne({ email });
    if (!isPatient) {
      return next(createError(404, "Patient not found"));
    }

    // Generate 6-digit OTP for password reset
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Set up email message details
    const mailOptions = {
      from: process.env.EMAIL, // From email
      to: email, // To email (user's email)
      subject: "Your OTP for Password Reset",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    };

    // Send the OTP to the user's email
    await transporter.sendMail(mailOptions);

    // Save or update OTP data in TempPatient collection
    await TempPatient.findOneAndUpdate(
      { email },
      {
        otp,
        otpExpiresAt: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please use it within 10 minutes.",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Verify password reset OTP
export const verifyForgotPasswordOtp = async (req, res, next) => {
  // Destructer the emial and otp from request body
  const { email, otp } = req.body;
  try {
    // Check the email and otp is present
    if (!email || !otp) {
      return next(createError(404, "Email and OTP are required"));
    }
    // Find the temp user using email, and check the user is present
    const tempUser = await TempPatient.findOne({ email });
    if (!tempUser) {
      return next(createError(404, "Patient not found"));
    }
    // Campare the OTP
    if (tempUser.otp !== otp) {
      return next(createError(400, "Invalid OTP"));
    }
    // Check the OTP is expired or not (10 minutes)
    if (Date.now() > tempUser.otpExpiresAt) {
      return next(createError(400, "OTP has expired"));
    }
    // OTP is valid
    return res.status(200).json({
      message: "OTP verified successfully. You can now change your password.",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    next(error);
  }
};

// Update patient's password after OTP verification
export const updatePatientPassword = async (req, res, next) => {
  // Destructer the email, password and verify password
  const { email, password, confirmPassword } = req.body;
  try {
    // Check required fields are present or not
    if (!email || !password || !confirmPassword) {
      return next(createError(400, "All fields are required"));
    }
    // Compare password and confom password
    if (password !== confirmPassword) {
      return next(createError(400, "Passwords do not match"));
    }
    // Find tempuser using email
    const isTempUser = TempPatient.findOne({ email });
    if (!isTempUser) {
      return next(createError(404, "Patient not found"));
    }
    // Hash the user password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the patient password
    const patient = await Patient.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    // clear the tempPatient
    await TempPatient.deleteOne({ email });
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    next(error);
  }
};

// Log out a patient and clear session cookie
export const logoutPatient = async (req, res, next) => {
  try {
    // Clear the token from cookie
    res.clearCookie("patientToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error);
    next(error);
  }
};
