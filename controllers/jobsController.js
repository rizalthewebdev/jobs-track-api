const Job = require("../models/JobModel");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const checkPermisions = require("../utils/checkPermision");
const moment = require('moment')

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

   // If page changed change the jobs too
   result = result.skip(skip).limit(limit);

   const jobs = await result;

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

   // Check the permission on user
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

   checkPermisions(req.user, job.createdBy);

   await job.remove();

   res.status(StatusCodes.OK).json({
      message: "Job deleted successfully",
   });
};

const showStats = async (req, res) => {
   let stats = await Job.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
   ]);
   stats = stats.reduce((acc, curr) => {
      const { _id: title, count } = curr;
      acc[title] = count;
      return acc;
   }, {});

   const defaultStats = {
      pending: stats.pending || 0,
      interview: stats.interview || 0,
      declined: stats.declined || 0,
   };

   let monthlyApplications = await Job.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
      {
         $group: {
            _id: {
               year: { $year: "$createdAt" },
               month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
         },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
   ]);
   monthlyApplications = monthlyApplications
      .map((item) => {
         const {
            _id: { year, month },
            count,
         } = item;
         const date = moment()
            .month(month - 1)
            .year(year)
            .format("MMM Y");
         return { date, count };
      })
      .reverse();

   res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

module.exports = {
   getAllJobs,
   createJob,
   updateJob,
   deleteJob,
   showStats,
};
