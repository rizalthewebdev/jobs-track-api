const User = require("../models/UserModel");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const register = async (req, res) => {
   const { name, email, password } = req.body;

   // If any field is null return an error
   if (!name || !email || !password) {
      throw new BadRequestError("Please provide all values");
   }

   // If email already use return an error
   const userAlreadyExist = await User.findOne({ email });
   if (userAlreadyExist) {
      throw new BadRequestError("Email already in use");
   }

   const user = await User.create({ name, email, password });
   const token = user.createJWT();
   res.status(StatusCodes.CREATED).json({
      user: { name: user.name, email: user.email, location: user.location },
      token,
   });
};

const login = async (req, res) => {
   const { email, password } = req.body;

   // Null value validation
   if (!email || !password) {
      throw new BadRequestError("Please provide email and password");
   }

   const user = await User.findOne({ email }).select("+password");

   // Check user email in the DB
   if (!user) {
      throw new UnauthenticatedError("Invalid Credentials");
   }

   const isCorrectPassword = await user.comparePassword(password);
   // Compare Password
   if (!isCorrectPassword) {
      throw new UnauthenticatedError("Password Incorrect");
   }

   const token = user.createJWT();
   res.status(StatusCodes.OK).json({
      user,
      token,
   });
};

const updateUser = async (req, res) => {
   const { email, name, location } = req.body;

   // Null value validation
   if (!email || !name || !location) {
      throw new BadRequestError("Please provide all values");
   }

   // Find the user is ID
   const user = await User.findOne({ _id: req.user.userId });

   // Update the data
   user.email = email;
   user.name = name;
   user.location = location;

   // Save the update to DB
   await user.save();

   const token = user.createJWT();

   res.status(StatusCodes.OK).json({ user, token });
};

module.exports = { register, login, updateUser };
