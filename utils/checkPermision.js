const { UnauthenticatedError } = require("../errors");

const checkPermisions = (requestUser, resourceUserId) => {
   if (requestUser === resourceUserId.toString()) return;

   throw new UnauthenticatedError("Not authorized to access this route");
};

module.exports = checkPermisions;
