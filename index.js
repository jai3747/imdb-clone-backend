// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const compression = require("compression");
const winston = require("winston");
const { URL } = require('url');

// Setup Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Import routes
const movieRouter = require("./routes/movie");
const actorRouter = require("./routes/actor");
const producerRouter = require("./routes/producer");

// Initialize express
const app = express();

// Configuration
const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUrl: process.env.MONGO_URL || "mongodb+srv://[YOUR_CONNECTION_STRING]",
  nodeEnv: process.env.NODE_ENV || "development",
  buildVersion: process.env.BUILD_VERSION || "development",
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["http://localhost:3000"],
  connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT || "10000", 10),
  readyStateCheckInterval: parseInt(
    process.env.READY_STATE_CHECK_INTERVAL || "5000",
    10
  ),
  allowedImageDomains: [
    'imgur.com',
    'i.imgur.com',
    'upload.wikimedia.org',
    'images.unsplash.com',
    'cloudinary.com',
    // Add other trusted domains here
  ]
};

// Utility function to validate image URLs
const isValidImageUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;
    
    // Check if the hostname is in our allowed list
    const isAllowedDomain = config.allowedImageDomains.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );

    // Check if the URL uses HTTPS
    const isHttps = url.protocol === 'https:';

    // Check if the path ends with an image extension
    const hasImageExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(url.pathname);

    return isAllowedDomain && isHttps && hasImageExtension;
  } catch {
    return false;
  }
};

// Add the URL validator to the app's locals so it can be used in routes
app.locals.isValidImageUrl = isValidImageUrl;

// Server state
let isShuttingDown = false;
let isDbConnected = false;

// Enhanced rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", ...config.corsOrigins],
        imgSrc: ["'self'", 'https:', 'data:', ...config.allowedImageDomains.map(domain => `https://*.${domain}`)],
      },
    },
  })
);
app.use(compression());
app.use(morgan("combined"));
app.use(limiter);
app.use(
  cors({
    origin: config.corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware to disable caching
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  if (!isShuttingDown) {
    logger.info(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  } else {
    res.status(503).json({
      error: "Service is shutting down",
      retryAfter: 30,
    });
  }
});

// Health check endpoints
app.get("/api/health/live", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api/health/ready", (req, res) => {
  if (isDbConnected) {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ status: "Service Unavailable", timestamp: new Date().toISOString() });
  }
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  logger.error("Error:", {
    error: err,
    request: {
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body,
    },
  });

  const statusCode = err.status || 500;
  const errorResponse = {
    error: err.name || "Internal Server Error",
    message: config.nodeEnv === "development" ? err.message : "An error occurred",
    status: statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    version: config.buildVersion,
  };

  if (config.nodeEnv === "development" && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

// MongoDB Connection with improved error handling
const connectDB = async (retries = 5, delay = 5000) => {
  while (retries > 0 && !isShuttingDown) {
    try {
      logger.info(`Connecting to MongoDB... (${retries} attempts remaining)`);

      await mongoose.connect(config.mongoUrl, {
        serverSelectionTimeoutMS: config.connectionTimeout,
        connectTimeoutMS: config.connectionTimeout,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: "majority",
      });

      logger.info("✅ MongoDB connected successfully");
      isDbConnected = true;
      return true;
    } catch (err) {
      logger.error("❌ MongoDB connection error:", err);
      retries--;

      if (retries === 0) {
        logger.error("❌ Max retries reached");
        return false;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return false;
};

// Start Server with enhanced logging
const startServer = async () => {
  try {
    const isConnected = await connectDB();

    if (!isConnected) {
      logger.error("Failed to connect to MongoDB. Exiting...");
      process.exit(1);
    }

    // API Routes
    app.use("/api/movies", movieRouter);
    app.use("/api/actors", actorRouter);
    app.use("/api/producers", producerRouter);

    const server = app.listen(config.port, "0.0.0.0", () => {
      logger.info(`
🚀 Server is running on port ${config.port}
📦 Version: ${config.buildVersion}
🔧 Environment: ${config.nodeEnv}
🌐 CORS Origins: ${config.corsOrigins.join(", ")}
🏥 Liveness: http://localhost:${config.port}/api/health/live
🔍 Readiness: http://localhost:${config.port}/api/health/ready
      `);
    });

    // Graceful shutdown
    process.on("SIGINT", () => {
      isShuttingDown = true;
      logger.info("Shutting down server...");
      server.close(() => {
        logger.info("Server closed.");
        process.exit(0);
      });
    });

    // Server error handler
    server.on("error", (err) => {
      logger.error("Server error:", err);
      process.exit(1);
    });

    // Enhanced periodic health checks
    setInterval(() => {
      if (!isShuttingDown && !isDbConnected) {
        logger.warn("Database connection check failed, attempting reconnect...");
        connectDB(3).catch((err) => logger.error("Reconnection failed:", err));
      }
    }, config.readyStateCheckInterval);
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;