const express = require("express");
const router = express.Router();

const {
   getAllJobs,
   getJob,
   createJob,
   updateJob,
   deleteJob,
} = require("../controllers/jobsController");

router.route("/").post(createJob).get(getAllJobs);
router.route("/:id").patch(updateJob).delete(deleteJob);

module.exports = router;
