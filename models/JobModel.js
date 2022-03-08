const mongoose = require("mongoose");

const JobSchema = mongoose.Schema({});

module.exports = mongoose.model("Job", JobSchema);
