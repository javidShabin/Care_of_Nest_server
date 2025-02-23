import jwt from "jsonwebtoken";

export const doctorAuth = (req, res, next) => {
  try {
    // Extract the token from the cookies
    const { doctorToken } = req.cookies;
    // Check if the token is present
    if (!doctorToken) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    // Verify the token
    const verifyToken = jwt.verify(doctorToken, process.env.JWT_SECRET_KEY);
    // Check if the token is valid
    if (!verifyToken) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    // If the token is valid, proceed to the next middleware or route handler
    req.doctor = verifyToken;
    next();
  } catch (error) {
    console.error("Error in patientAuth middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
