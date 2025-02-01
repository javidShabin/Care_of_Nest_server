import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: "https://example.com/default-profile.png",
  },
  role: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    default: "patient",
  },
  reports: [
    {
      reportName: String,
      reportUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  familyContact: {
    relativeName: {
      type: String,
      required: true,
    },
    relation: {
      type: String,
      enum: [
        "Father",
        "Mother",
        "Son",
        "Daughter",
        "Brother",
        "Sister",
        "Wife",
        "Husband",
        "Relative",
        "Friend",
        "Other",
      ],
      required: true,
    },
    relativePhone: {
      type: String,
      required: true,
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
