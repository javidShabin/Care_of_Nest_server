import mongoose from "mongoose";

const tempDoctorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "doctor",
    },
    otp: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
    specialization: {
      type: String,
      required: true,
      enum: [
        "Cardiology",
        "Orthopedics",
        "Dentistry",
        "Pediatrics",
        "Dermatology",
        "Other",
      ],
    },
    qualifications: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "https://example.com/default-profile.png",
    },
    availability: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: true,
        },
        timeSlots: [
          {
            startTime: {
              type: String, // Time format: "09:00 AM"
              required: true,
            },
            endTime: {
              type: String, // Time format: "10:00 AM"
              required: true,
            },
          },
        ],
      },
    ],
    consultationFee: {
      type: Number,
      required: true,
    },
    socialLinks: {
      type: Map,
      of: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const TempDoctor = mongoose.model("TempDoctor", tempDoctorSchema);
export default TempDoctor;
