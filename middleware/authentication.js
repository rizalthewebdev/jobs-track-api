const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");

const auth = async (req, res, next) => {
   // Check header
   const authHeader = req.headers.authorization;

   if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthenticatedError("Authentication invalid");
   }

   // Get the token only from header
   const token = authHeader.split(" ")[1];

   try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      const user = User.findById(payload.id).select('-password')
      req.user = user
      
      req.user = { userId: payload.userId, name: payload.name };
      next();
   } catch (error) {
      throw new UnauthenticatedError("Authentication invalid");
   }
};

module.exports = auth;
