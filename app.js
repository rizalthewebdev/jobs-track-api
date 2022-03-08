// Use && Import needed package
require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const cors = require("cors");

// Extra Security package
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// Import function to connect with MongoDB
const connectDB = require("./db/connect");

// Import Route
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");

// Import the route where user have authenticated
const authenticatedUser = require("./middleware/authentication");

// Import error middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// Limit the access into API
app.set("trust proxy", 1);
app.use(
   rateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, //limit each IP to 100 request per windowsMs
   })
);

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

// Route to authenntication
app.use("/api/v1/auth", authRoutes);

// Make job routes only can access by authenticated user
app.use("/api/v1/jobs", authenticatedUser, jobRoutes);

// Use error middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Get port and url from environment variables
const port = process.env.PORT;
const uri = process.env.MONGO_URI;

// Initialize function to run the server
const start = async () => {
   try {
      // Connecting to MongoDB
      await connectDB(uri).then(() => console.log("Connected to DB"));

      // Create a server with port
      app.listen(port, () =>
         console.log(`Server running on http://localhost:${port}...`)
      );
   } catch (error) {
      // Print the error if error happen
      console.log({ message: error.message });
   }
};

// Start the server
start();
