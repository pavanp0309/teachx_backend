// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const protect = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Not authorized, token missing" });
//     }

//     const token = authHeader.split(" ")[1];

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (error) {
//       if (error.name === "TokenExpiredError") {
//         return res.status(401).json({ message: "Token expired, please log in again." });
//       } else {
//         return res.status(401).json({ message: "Invalid token, authentication failed." });
//       }
//     }

//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) return res.status(401).json({ message: "User not found. Authentication failed." });

//     req.user = user;
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// export const authorizeRoles = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user || !allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({ message: "Access denied. Insufficient permissions." });
//     }
//     next();
//   };
// };


// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const protect = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader?.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Not authorized, token missing" });
//     }

//     const token = authHeader.split(" ")[1];

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.id).select("-password");

//       if (!req.user) {
//         return res.status(401).json({ message: "User not found. Authentication failed." });
//       }

//       next();
//     } catch (error) {
//       return res.status(401).json({ 
//         message: error.name === "TokenExpiredError" 
//           ? "Token expired, please log in again." 
//           : "Invalid token, authentication failed." 
//       });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
//   if (!req.user || !allowedRoles.includes(req.user.role)) {
//     return res.status(403).json({ message: "Access denied. Insufficient permissions." });
//   }
//   next();
// };


import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 📌 Middleware: Protect Routes (Authentication)
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Authentication failed: User not found." });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token. Authentication failed." });
  }
};

// 📌 Middleware: Role-Based Authorization
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      message: `Access denied. Required roles: ${allowedRoles.join(", ")}` 
    });
  }
  next();
};
