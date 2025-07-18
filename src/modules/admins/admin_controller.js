import cloudinaryInstance from "../../configs/cloudinary.js";
import transporter from "../../configs/nodemailer.js";
import { createError } from "../../utils/createError.js";
import { generateUserToken } from "../../utils/token.js";
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
        profilePicture,
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
      profilePicture: temAdmin.profilePicture,
    });
    await newAdmin.save();
    // Generate admin token using using id, email and role
    const token = generateUserToken({
      _id: newAdmin._id,
      email: newAdmin.email,
      role: "admin",
    });
    // Set the token to cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 5 * 60 * 60 * 1000, // 5 hours
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
export const loginAdmin = async (req, res, next) => {
  // Destructer email and password
  const { email, password } = req.body;
  try {
    // Check if the required fields are present
    if (!email || !password) {
      return next(createError(400, "All fields are required"));
    }
    // Check if the user exists
    const existngAdmin = await Admin.findOne({ email });
    if (!existngAdmin) {
      return next(createError(401, "Admin does not exist"));
    }
    // Compare password if the password is correct
    const isPasswordCorrect = await bcrypt.compareSync(
      password,
      existngAdmin.password
    );
    if (!isPasswordCorrect) {
      return next(createError(401, "Invalid credentials"));
    }
    // Generate admin token using using id, email and role
    const token = generateUserToken({
      _id: existngAdmin._id,
      email: existngAdmin.email,
      role: "admin",
    });
    // Set the token to cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 5 * 60 * 60 * 1000, // 5 hours
    });
    return res.status(200).json({ message: "Logged in successfully" });
  } catch (error) {
    next(error);
  }
};
// Get logged-in admin's own profile
export const getLoggedInAdminProfile = async (req, res, next) => {
  // Get id from request admin (auth admin)
  const { id } = req.admin;
  try {
    const adminProfile = await Admin.findById(id);
    if (!adminProfile) {
      return next(createError(404, "Admin not found"));
    }
    // Return the doctor profile
    return res.status(200).json({ adminProfile });
  } catch (error) {
    onsole.error("Error getting geting profile:", error);
    next(error);
  }
};
// Update logged-in admin's profile
export const updateAdminProfile = async (req, res, next) => {
  // Get id from request admin (auth admin)
  const { id } = req.admin;
  try {
    // destructer the admin profile fields from request body
    const { fullName, email, phone, profilePicture } = req.body;

    // Store updated data in a variable
    const updatedData = {
      fullName,
      email,
      phone,
      profilePicture,
    };
    // Handle profile picture upload if a file is provided
    if (req.file) {
      try {
        const uploadResult = await cloudinaryInstance.uploader.upload(
          req.file.path
        );
        updatedData.profilePicture = uploadResult.secure_url;
      } catch (error) {
        return next({
          status: 500,
          message: "Profile picture upload failed",
          error: error.message,
        });
      }
    }

    // Update admin profile
    const updatedAdmin = await Admin.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (!updatedAdmin) {
      return next(createError(404, "Admin not found"));
    }
    // Success response
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    next(error);
  }
};
// Send OTP for password reset
export const sendPasswordResetOtp = async (req, res, next) => {
  // Destructer email from request body
  const { email } = req.body;
  try {
    // Check if email is provided
    if (!email) {
      return next(createError(400, "Email is required"));
    }
    // Find the doctor using the email
    const isAdmin = await Admin.findOne({ email });
    if (!isAdmin) {
      return next(createError(404, "Admin not found"));
    }
    // Generate 6-digit OTP for password reset
    const otp = Math.floor(100000 + Math.random() * 900000);
    // Set up email message details
    const mailOptions = {
      from: process.env.EMAIL, // From email
      to: email, // To email (doctor's email)
      subject: "Your OTP for Password Reset",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    };
    // Send the OTP to the doctors email
    await transporter.sendMail(mailOptions);
    // Save or update OTP data in TempDoctor collection
    await TempAdmin.findOneAndUpdate(
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
    next(error);
  }
};
// Verify OTP and reset password
export const verifyOtpAndResetPassword = async (req, res, next) => {
  // Destructer the email and otp from request body
  const { email, otp } = req.body;
  try {
    // Check the email and otp from request body
    if (!email || !otp) {
      return next(createError(400, "Email and OTP are required"));
    }
    // Find the temp admin using email, and check the admin is present
    const temAdmin = await TempAdmin.findOne({ email });
    if (!temAdmin) {
      return next(createError(404, "Admin not found"));
    }
    // Compare the OTP is expired or not (10 minutes)
    if (Date.now() > temAdmin.otpExpiresAt) {
      return next(createError(404, "OTP has expired"));
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
// Update doctor's password
export const updateAdminPassword = async (req, res, next) => {
  // Desructer the email , password, confirmPassword
  const { email, password, confirmPassword } = req.body;
  try {
    // Check the required fields are present or not
    if (!email || !password || !confirmPassword) {
      return next(createError(400, "All fields are required"));
    }
    // Compare password and conform password
    if (password !== confirmPassword) {
      return next(createError(400, "Passwords do not match"));
    }
    // Find tempAdmin using email
    const temAdmin = await TempAdmin.findOne({ email });
    if (!temAdmin) {
      return next(createError(404, "Admin not found"));
    }
    // Hash the admin password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    // Update the admin password find using email
    const admin = await Admin.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );
    // Clear the tempAdmin
    await TempAdmin.deleteOne({ email });
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    next(error)
  }
};
// Logout doctor and clear session
export const logoutAdmin = async (req, res, next) => {
    try {
    // Clear the token from cookie
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Admin logged out successfully" });
  } catch (error) {
    console.error("Error logging out admin:", error);
    next(error)
  }
};
