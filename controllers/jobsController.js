const Job = require("../models/JobModel");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllJobs = async (req, res) => {
   const jobs = await Job.find({ createdBy: req.user.userId }).sort(
      "createdAt"
   );
   res.status(StatusCodes.OK).json({ jobs, nbJobs: jobs.length });
};

const getJob = async (req, res) => {
   const {
      user: { userId },
      params: { id: jobId },
   } = req;
   const job = await Job.findOne({
      _id: jobId,
      createdBy: userId,
   });

   if (!job) {
      throw new NotFoundError(`No job with id ${jobId}`);
   }

   res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
   req.body.createdBy = req.user.userId;

   const job = await Job.create(req.body);
   res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
   const {
      body: { company, position, status },
      user: { userId },
      params: { id: jobId },
   } = req;

   if (!company || !position || !status) {
      throw new BadRequestError("Company, Position, and Status must provided");
   }

   const job = await Job.findByIdAndUpdate(
      { _id: jobId, createdBy: userId },
      req.body,
      { new: true, runValidators: true }
   );

   res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
   const {
      user: { userId },
      params: { id: jobId },
   } = req;
   const job = await Job.findByIdAndRemove({ _id: jobId, createdBy: userId });

   res.status(StatusCodes.OK).json({
      message: "Job deleted successfully",
      deletedJob: job,
   });
};

module.exports = {
   getAllJobs,
   getJob,
   createJob,
   updateJob,
   deleteJob,
};
