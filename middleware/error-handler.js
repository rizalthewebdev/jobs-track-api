const { StatusCodes } = require("http-status-codes");

const errorHandler = (err, req, res, next) => {
   let customError = {
      statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      message: err.message || "Something went wrong please try again later",
   };

   // Custom error if error name is CastError(Incorrect Id)
   if(err.name === 'CastError'){
      customError.message = `Data with id ${err.value} not found`
      customError.statusCode = 404
   }

   // Custom the error if error name is ValidationError(User not provide all of fields)
   if (err.name === "ValidationError") {
      customError.message = Object.values(err.errors)
         .map((item) => item.message)
         .join(", ");
      customError.statusCode = 400;
   }

   // Custom the error if the code of error is 11000(Duplicate Email)
   if (err.code && err.code === 11000) {
      customError.message = `Duplicate value enter for ${Object.keys(
         err.keyValue
      )} field, please choose another value`;
      customError.statusCode = 400;
   }

   // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
   return res
      .status(customError.statusCode)
      .json({ message: customError.message });
};

module.exports = errorHandler;
