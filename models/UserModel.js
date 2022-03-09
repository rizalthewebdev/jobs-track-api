const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, "Please provide name"],
      minlength: 3,
      maxlength: 50,
      trim: true,
   },
   email: {
      type: String,
      required: [true, "Please provide email"],
      validate: {
         validator: validator.isEmail,
         message: "Please provide a valid email",
      },
      unique: true,
   },
   password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: 6,
      select: false,
   },
   location: {
      type: String,
      trim: true,
      maxlength: 20,
      default: 'your city'
   }
});

// Encrypt the password
UserSchema.pre("save", async function () {
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);
});

// Create JSON web token
UserSchema.methods.createJWT = function () {
   return jwt.sign(
      { userId: this._id, name: this.name },
      process.env.JWT_SECRET,
      {
         expiresIn: process.env.JWT_LIFETIME,
      }
   );
};

// Compare Password
UserSchema.methods.comparePassword = async function (candidatePassword) {
   const isMatch = await bcrypt.compare(candidatePassword, this.password);
   return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
