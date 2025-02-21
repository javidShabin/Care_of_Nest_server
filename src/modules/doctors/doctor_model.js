import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
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
      ], // Example Specializations
    },
    qualifications: {
      type: String,
      required: true,
    },
    experience: {
      type: Number, // Years of experience
      required: true,
    },
    profilePicture: {
      type: String,
      default: "https://example.com/default-profile.png", // Default profile image
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
      type: Number, // Consultation fee for the doctor
      required: true,
    },
    socialLinks: {
      type: Map,
      of: String, // Social media or professional portfolio links (LinkedIn, Twitter, etc.)
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false, // Admin needs to verify the doctor
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
  { timestamps: true } // Automatically add createdAt and updatedAt
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
