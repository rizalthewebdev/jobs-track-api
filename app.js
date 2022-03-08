// Import & use package
require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const cors = require("cors");

const connectDB = require("./db/connect");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");

const authenticatedUser = require('./middleware/authentication')

// Import error middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs",authenticatedUser, jobRoutes);

// Use error middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT;
const uri = process.env.MONGO_URI;

// Initialize function to run the server
const start = async () => {
   try {
      await connectDB(uri).then(() => console.log("Connected to DB"));
      app.listen(port, () =>
         console.log(`Server running on http://localhost:${port}...`)
      );
   } catch (error) {
      console.log({ message: error.message });
   }
};

// Start the server
start();
