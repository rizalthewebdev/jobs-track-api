const Job = require("../models/JobModel");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const moment = require("moment");
const checkPermisions = require("../utils/checkPermision");

const getAllJobs = async (req, res) => {
   const { status, jobType, sort, search } = req.query;

   const queryObject = {
      createdBy: req.user.userId,
   };

   // Add stuff basic on condition

   if (status && status !== "all") {
      queryObject.status = status;
   }
   if (jobType && jobType !== "all") {
      queryObject.jobType = jobType;
   }
   if (search) {
      queryObject.position = { $regex: search, $options: "i" };
   }

   // Syncronous search data from MongoDb
   let result = Job.find(queryObject);

   // Sort condition
   if (sort === "latest") {
      result = result.sort("-createdAt");
   }
   if (sort === "oldest") {
      result = result.sort("createdAt");
   }
   if (sort === "a-z") {
      result = result.sort("position");
   }
   if (sort === "z-a") {
      result = result.sort("-position");
   }

   // Setup Pagination

   const page = Number(req.query.page) || 1;
   const limit = Number(req.query.limit) || 10;
   const skip = (page - 1) * limit;

   result = result.skip(skip).limit(limit);

   const job = await result;

   const totalJobs = await Job.countDocuments(queryObject);
   const numOfPages = Math.ceil(totalJobs / limit);

   res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};

const createJob = async (req, res) => {
   const { position, company } = req.body;

   if (!position || !company) {
      throw new BadRequestError("Please provide all values");
   }

   req.body.createdBy = req.user.userId;

   const job = await Job.create(req.body);
   res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
   const {
      body: { company, position },
      params: { id: jobId },
   } = req;

   if (!company || !position) {
      throw new BadRequestError("Please provided all values");
   }

   const job = await Job.findOne({ _id: jobId });

   if (!job) {
      throw new NotFoundError(`No job with id : ${jobId}`);
   }

   // Check ther permission on user
   checkPermisions(req.user, job.createdBy);

   const updatedJob = await Job.findByIdAndUpdate(
      { _id: jobId, createdBy: userId },
      req.body,
      { new: true, runValidators: true }
   );

   res.status(StatusCodes.OK).json({ updatedJob });
};

const deleteJob = async (req, res) => {
   const { id: jobId } = req.params;

   const job = await Job.findOne({ _id: jobId });

   if (!job) {
      throw new NotFoundError(`No job with id ${jobId}`);
   }

   checkPermisions(req.user, job.createdBy)

   await job.remove()

   res.status(StatusCodes.OK).json({
      message: "Job deleted successfully",
   });
};

module.exports = {
   getAllJobs,
   getJob,
   createJob,
   updateJob,
   deleteJob,
};
