// Register a new patient
export const registerPatient = async (req, res, next) => {};

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
