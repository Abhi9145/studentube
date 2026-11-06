const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      req.user = await User.findById(decoded.id).select(
        "-password"
      );

      if (!req.user) {
        return res.status(401).json({
          message: "User not found. Please login again.",
        });
      }

      next();
    } else {
      res.status(401).json({
        message: "Not authorized",
      });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        message: "Token expired. Please login again.",
      });
    } else {
      res.status(401).json({
        message: "Token failed. Please login again.",
      });
    }
  }
};

module.exports = { protect };