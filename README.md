# Project Title

**CareofNest**

## Description

**CareofNest** is a virtual healthcare platform designed to deliver reliable and accessible medical services. It is particularly beneficial for individuals with specific needs, such as pregnant women, elderly patients, and people with disabilities.

## Architecture

Modular Monolithic Architecture

** Why Modular Monolithic? **

- I chose Modular Monolithic Architecture to organize the project by feature-based modules like patients, doctors, and admin. This structure keeps - the code clean, scalable, and easy to maintain, even as the project grows. It allows clear separation of concerns while keeping everything in a - single deployable backend, making development faster and more efficient.

/healthcare-app
│
├── /src
│ ├── /modules
│ │ ├── /patients
│ │ │ ├── patient.controller.js
│ │ │ ├── patient.model.js
│ │ │ └── patient.routes.js
│ │ ├── /doctor
│ │ └── /admin
│ ├── /configs
│ ├── /middlewares
│ ├── /utils
│ └── app.js ← initializes app
│
├── server.js ← entry point
├── .env
├── package.json
└── README.md

## Dependencies

Install the following packages:

- `express`
- `dotenv`
- `cors`
- `mongoose`
- `bcrypt`
- `cookie-parser`
- `helmet`
- `jsonwebtoken`
- `nodemailer`
- `multer`
- `cloudinary`

**Setup Instructions:**

- Add `"type": "module"` in your `package.json`
- Install and configure `mongoose` to connect the server with the MongoDB database

---

### **Models**

#### **Core Models**

1. **patient_model**

   - **Fields**:
     - `name`, `age`, `gender`, `email`, `password`, `contactNumber`, `address`, `profilePicture`, etc.
   - **Family Contact**:
     ```js
     familyContact: {
       name: String,
       relationship: String,
       contactNumber: String,
       isEmergencyContact: { type: Boolean, default: false }
     }
     ```
   - **Role**: `'patient'`
   - **Notes**:
     - Use `bcrypt` to hash the password.

2. **temp_patient_model**
   - **Fields**:
     - OTP
     - Expiry date for OTP
   - **Functionality**:
     - Clear OTP after creating a new patient.

---

### **Controllers**

1. **patient_controller
    -**Register 
     -Check the petient exist
     -Generate OTP
     -Send the OTP to email using nodemailer
     -Hash patient password using bcrypt
     -Save the datails in temp patient model


- _Insert description or controller details here._

---

### **Routes**

- _Insert description or routes details here._

---

### **Middlewares**

- _Error Handler middleware_

- A centralized error handler middleware is used to catch and handle errors across the entire application.
- It ensures consistent error responses and improves debugging by conditionally showing stack traces in development

---

### **Configs**

1. **cloudinary**

   - Cloudinary is integrated to manage image uploads in the project.
   - It handles storage, optimization, and transformation of images seamlessly.
   - This helps deliver high-quality media content efficiently across the platform.

2. **database**

   - Mongoose is used to connect the application to MongoDB.
   - A custom `connectDb` function handles the connection using `mongoose.connect()`.
   - The database URL is securely stored in environment variables (`.env`).

3. **nodemailer**
   - Nodemailer is used to send emails from the server-side in Node.js.
   - It supports various transport methods like SMTP and OAuth2.
   - In this project, it's used for sending OTP through email or verifications.

---

### **Utils**

1. **token.js**
   - JSON Web Tokens (JWT) are used for user authentication and authorization.
   - A utility function `generateUserToken` creates a token using the user's ID, email, and role.
   - The token is signed with a secret key (`JWT_SECRET_KEY`) and set to expire in 5 hours.
