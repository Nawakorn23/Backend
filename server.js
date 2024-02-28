const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

// Route files
const hospitals = require("./routes/hospitals");
const auth = require("./routes/auth");
const appointments = require("./routes/appointments");

const app = express();

// Body parser
app.use(express.json());

// Prevent http param pollutions
app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 5,
});
app.use(limiter);

// Prevent XSS attacks
app.use(xss());

// Set cecurity headers
app.use(helmet());

// Sanitize data
app.use(mongoSanitize());

// Cookie parser
app.use(cookieParser());

app.use("/api/v1/hospitals", hospitals);
app.use("/api/v1/auth", auth);
app.use("/api/v1/appointments", appointments);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server runing in `, process.env.NODE_ENV, ` mode on port `, PORT)
);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      titel: "Library API",
      version: "1.0.0",
      description: "A simple Express VacQ API",
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Handle unhandle promise rejections
process.on(`unhandledRejection`, (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Colse server & exit process
  server.close(() => process.exit(1));
});
