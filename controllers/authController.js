const User = require("../models/UserModel");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const register = async (req, res) => {
   const user = await User.create({ ...req.body });
   const token = user.createJWT();
   res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

const login = async (req, res) => {
   const { email, password } = req.body;

   // Null value validation
   if (!email || !password) {
      throw new BadRequestError("Please provide email and password");
   }

   const user = await User.findOne({ email });

   // Check user email in the DB
   if (!user) {
      throw new UnauthenticatedError("Invalid Credentials");
   }

   const isCorrectPassword = await user.comparePassword(password)
   // Compare Password
   if (!isCorrectPassword) {
      throw new UnauthenticatedError("Password Incorrect");
   }

   
   const token = user.createJWT();
   res.status(StatusCodes.OK).json({
      user: {
         name: user.name,
      },
      token,
   });
};

module.exports = { register, login };
