import jwt from "jsonwebtoken";
import { createError } from "../utils/createError.js";

export const adminAuth = (req, res, next) => {
  try {
    // Extract the token from the cookies
    const { adminToken } = req.cookies;
    // Check if the token is present
    if (!adminToken) {
      return next(createError(401, "Unauthorized access"));
    }
    // Verify the token
    const verifyToken = jwt.verify(adminToken, process.env.JWT_SECRET_KEY);
    // Check if the token is valid
    if (!verifyToken) {
      return next(createError(401, "Unauthorized access"));
    }
    // If the token is valid, proceed to the next middleware or route handler
    req.admin = verifyToken;
    next();
  } catch (error) {
    console.error("Error in patientAuth middleware:", error);
    return next(error);
  }
};
