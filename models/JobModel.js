const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
   company: {
      type: String,
      required: [true, "Please provide company name"],
      maxlength: 60,
   },
   position: {
      type: String,
      required: [true, "Please provide position"],
      maxlength: 100,
   },
   status: {
      type: String,
      enum: ["interview", "pending", "declined"],
      default: "pending",
   },
   createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide User"],
   },
}, {timestamps: true});

module.exports = mongoose.model("Job", JobSchema);
