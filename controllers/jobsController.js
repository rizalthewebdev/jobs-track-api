const Job = require("../models/JobModel");
const { StatusCodes } = require("http-status-codes");

const getAllJobs = async (req, res) => {
   res.send("Get all Jobs");
};

const getJob = async (req, res) => {
   res.send("Get single job");
};

const createJob = async (req, res) => {
   res.send("Create new job");
};

const updateJob = async (req, res) => {
   res.send("Update job");
};

const deleteJob = async (req, res) => {
   res.send("Delete job");
};

module.exports = {
   getAllJobs,
   getJob,
   createJob,
   updateJob,
   deleteJob,
};
