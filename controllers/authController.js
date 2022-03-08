const User = require("../models/UserModel");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
   const user = await User.create({ ...req.body });
   const token = user.createJWT();
   res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

const login = async (req, res) => {
   res.status(StatusCodes);
};

module.exports = { register, login };
