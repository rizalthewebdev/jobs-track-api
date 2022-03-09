const express = require("express");
const router = express.Router();
const authenticatedUser = require("../middleware/authentication");

const {
   login,
   register,
   updateUser,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.patch("/updateUser", authenticatedUser, updateUser);

module.exports = router;
