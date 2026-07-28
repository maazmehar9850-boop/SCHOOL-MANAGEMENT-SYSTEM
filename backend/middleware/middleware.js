import jwt from "jsonwebtoken";
import register from "../model/register.js";

const getToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== "string") return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

export const authenticate = async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      return res.status(500).json({ message: "Server misconfiguration: JWT_SECRET missing." });
    }

    const decoded = jwt.verify(token, secretKey);
    const user = await register.findById(decoded.id).select("tokenVersion role");
    if (!user) {
      return res.status(401).json({ message: "Session ended. Please log in again." });
    }

    const tokenVersion = decoded.tokenVersion ?? 0;
    if (tokenVersion !== (user.tokenVersion ?? 0)) {
      return res.status(401).json({ message: "Session ended. Please log in again." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }
    return res.status(401).json({ message: "Invalid token." });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

/** @deprecated Prefer authenticate + authorizeRoles */
export const authenticateRole = (requiredRole) => {
  return [authenticate, authorizeRoles(requiredRole)];
};
