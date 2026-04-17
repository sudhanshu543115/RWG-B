import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export const generateToken = (userId, role = "tourist") => {
  return jwt.sign(
    {
      id: userId,
      role: role
    },
    JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
};