import jwt from "jsonwebtoken";

// Generate a JWT token for a patient
export const generateUserToken = ({ _id, email, role }) => {
  try {
    // Create a token with the patient's ID and email
    const token = jwt.sign(
      {
        id: _id,
        email: email,
        role: role,
      },
      process.env.JWT_SECRET_KEY, // replace with your secret key
      { expiresIn: "5h" } // Set an expiration time for the token
    );
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    return null;
  }
};

// Generate a JWT token for a doctor
export const generateDoctorToken = ({ _id, email, role }) => {
  try {
    // Create a token with doctor's ID and email
    const token = jwt.sign(
      {
        id: _id,
        email: email,
        role: role,
      },
      process.env.JWT_SECRET_KEY, // replace with your secret key
      { expiresIn: "5h" } // Set an expiration time for the token
    );
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    return null;
  }
};

// Generate a JWT token for a doctor
export const generateAdminToken = ({ _id, email, role }) => {
  try {
    // Create a token with doctor's ID and email
    const token = jwt.sign(
      {
        id: _id,
        email: email,
        role: role,
      },
      process.env.JWT_SECRET_KEY, // replace with your secret key
      { expiresIn: "5h" } // Set an expiration time for the token
    );
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    return null;
  }
};
