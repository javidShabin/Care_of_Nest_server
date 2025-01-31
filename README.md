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

**\*\*\*\***\*\***\*\*\*\***-------------Models---------------\***\*\*\*\*\***\*\*\*\***\*\*\*\*\***
**\*\*\*\***\*\***\*\*\*\***-------------Controllers---------------\***\*\*\*\*\***\*\*\*\***\*\*\*\*\***
**\*\*\*\***\*\***\*\*\*\***-------------Routes---------------\***\*\*\*\*\***\*\*\*\***\*\*\*\*\***
**\*\*\*\***\*\***\*\*\*\***-------------Middlewares---------------\***\*\*\*\*\***\*\*\*\***\*\*\*\*\***
**\*\*\*\***\*\***\*\*\*\***-------------Cofigs---------------\***\*\*\*\*\***\*\*\*\***\*\*\*\*\***
**\*\*\*\***\*\***\*\*\*\***-------------Utils---------------\***\*\*\*\*\***\*\*\*\***\*\*\*\*\***
