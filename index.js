
// require('dotenv').config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const movieRouter = require("./routes/movie");
// const actorRouter = require("./routes/actor");
// const producerRouter = require("./routes/producer");

// const app = express();
// const buildVersion = process.env.BUILD_VERSION || 'development';
// const PORT = process.env.PORT || 5000;

// // MongoDB Atlas configuration
// const MONGO_URL = "mongodb+srv://JAYACHANDRAN:KQJrxDn44181NsqT@cluster0.w45he.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// // Initialize middleware
// app.use(cors({
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Basic request logging middleware
// app.use((req, res, next) => {
//     console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//     next();
// });

// // Root endpoint
// app.get('/', (req, res) => {
//     res.status(200).json({ 
//         message: 'IMDB API Server Running',
//         version: buildVersion,
//         timestamp: new Date().toISOString()
//     });
// });

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//     const isDbConnected = mongoose.connection.readyState === 1;
    
//     res.status(isDbConnected ? 200 : 503).json({ 
//         status: isDbConnected ? 'healthy' : 'unhealthy',
//         version: buildVersion,
//         timestamp: new Date().toISOString(),
//         database: {
//             connected: isDbConnected,
//             state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
//         }
//     });
// });

// // API Routes
// app.use("/api/movies", movieRouter);
// app.use("/api/actors", actorRouter);
// app.use("/api/producers", producerRouter);

// // MongoDB Connection Configuration
// const connectDB = async (retries = 5) => {
//     console.log("Starting IMDB API Server - Version:", buildVersion);
    
//     while (retries) {
//         try {
//             console.log("Attempting to connect to MongoDB Atlas...");
            
//             await mongoose.connect(MONGO_URL, {
//                 retryWrites: true,
//                 w: 'majority',
//                 serverSelectionTimeoutMS: 5000,
//                 connectTimeoutMS: 10000,
//                 socketTimeoutMS: 45000
//             });
            
//             console.log("✅ MongoDB Atlas connected successfully");
//             return true;
//         } catch (err) {
//             console.error("❌ MongoDB connection error:", err.message);
//             retries -= 1;
            
//             if (retries === 0) {
//                 console.error("❌ Max retries reached. Exiting...");
//                 process.exit(1);
//             }
            
//             console.log(`⏳ Retrying connection... (${retries} attempts remaining)`);
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         }
//     }
//     return false;
// };

// // Mongoose event handlers
// mongoose.connection.on('error', (err) => {
//     console.error('MongoDB connection error:', err);
// });

// mongoose.connection.on('disconnected', () => {
//     console.log('MongoDB disconnected');
// });

// mongoose.connection.on('reconnected', () => {
//     console.log('MongoDB reconnected');
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error('❌ Error:', err.stack);
//     res.status(err.status || 500).json({
//         error: err.name || 'Internal Server Error',
//         message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
//         version: buildVersion
//     });
// });

// // 404 handler
// app.use((req, res) => {
//     res.status(404).json({
//         error: 'Route not found',
//         path: req.path,
//         method: req.method,
//         version: buildVersion
//     });
// });

// // Graceful shutdown handler
// const gracefulShutdown = async () => {
//     try {
//         console.log('🔄 Initiating graceful shutdown...');
        
//         if (mongoose.connection.readyState === 1) {
//             await mongoose.connection.close();
//             console.log('📝 MongoDB connection closed');
//         }
        
//         process.exit(0);
//     } catch (err) {
//         console.error('❌ Error during graceful shutdown:', err);
//         process.exit(1);
//     }
// };

// // Server initialization
// const startServer = async () => {
//     try {
//         const isConnected = await connectDB();
        
//         if (!isConnected) {
//             console.error("❌ Failed to connect to MongoDB. Server will not start.");
//             process.exit(1);
//         }
        
//         const server = app.listen(PORT, '0.0.0.0', () => {
//             console.log(`🚀 Server is running on port ${PORT}`);
//             console.log(`📦 Version: ${buildVersion}`);
//             console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
//         });

//         server.on('error', (err) => {
//             console.error('Server error:', err);
//             process.exit(1);
//         });

//     } catch (err) {
//         console.error('❌ Failed to start server:', err);
//         process.exit(1);
//     }
// };

// // Global error handlers
// process.on('uncaughtException', (err) => {
//     console.error('❌ Uncaught Exception:', err);
//     process.exit(1);
// });

// process.on('unhandledRejection', (err) => {
//     console.error('❌ Unhandled Rejection:', err);
//     process.exit(1);
// });

// // Shutdown signals
// process.on('SIGTERM', gracefulShutdown);
// process.on('SIGINT', gracefulShutdown);

// // Start the server
// startServer();

// module.exports = app;
// // const express = require("express");
// // const mongoose = require("mongoose");
// // const cors = require("cors");
// // const helmet = require('helmet');
// // const rateLimit = require('express-rate-limit');

// // // Import routes
// // const movieRouter = require("./routes/movie");
// // const actorRouter = require("./routes/actor");
// // const producerRouter = require("./routes/producer");

// // // Initialize express
// // const app = express();

// // // Configuration
// // const config = {
// //     port: parseInt(process.env.PORT || '5000', 10),
// //     mongoUrl: process.env.MONGO_URL,
// //     nodeEnv: process.env.NODE_ENV || 'development',
// //     buildVersion: process.env.BUILD_VERSION || 'development',
// //     corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],
// //     connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT || '10000', 10),
// //     readyStateCheckInterval: parseInt(process.env.READY_STATE_CHECK_INTERVAL || '5000', 10)
// // };

// // // Server state
// // let isShuttingDown = false;
// // let isDbConnected = false;

// // // Rate limiting
// // const limiter = rateLimit({
// //     windowMs: 15 * 60 * 1000, // 15 minutes
// //     max: 100 // limit each IP to 100 requests per windowMs
// // });

// // // Middleware
// // app.use(helmet());
// // app.use(limiter);
// // app.use(cors({
// //     origin: config.corsOrigins,
// //     methods: ['GET', 'POST', 'PUT', 'DELETE'],
// //     credentials: true
// // }));
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // Request logging middleware
// // app.use((req, res, next) => {
// //     if (!isShuttingDown) {
// //         console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
// //         next();
// //     } else {
// //         res.status(503).json({ error: 'Service is shutting down' });
// //     }
// // });

// // // Liveness probe endpoint
// // app.get('/api/health/live', (req, res) => {
// //     res.status(200).json({
// //         status: 'alive',
// //         timestamp: new Date().toISOString(),
// //         version: config.buildVersion
// //     });
// // });

// // // Readiness probe endpoint
// // app.get('/api/health/ready', (req, res) => {
// //     if (isShuttingDown) {
// //         return res.status(503).json({
// //             status: 'shutting_down',
// //             timestamp: new Date().toISOString()
// //         });
// //     }

// //     const isReady = mongoose.connection.readyState === 1 && isDbConnected;
    
// //     res.status(isReady ? 200 : 503).json({
// //         status: isReady ? 'ready' : 'not_ready',
// //         version: config.buildVersion,
// //         timestamp: new Date().toISOString(),
// //         database: {
// //             connected: isDbConnected,
// //             state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
// //         }
// //     });
// // });

// // // API Routes
// // app.use("/api/movies", movieRouter);
// // app.use("/api/actors", actorRouter);
// // app.use("/api/producers", producerRouter);

// // // MongoDB Connection
// // const connectDB = async (retries = 5, delay = 5000) => {
// //     while (retries > 0 && !isShuttingDown) {
// //         try {
// //             console.log(`Connecting to MongoDB... (${retries} attempts remaining)`);
            
// //             await mongoose.connect(config.mongoUrl, {
// //                 serverSelectionTimeoutMS: config.connectionTimeout,
// //                 connectTimeoutMS: config.connectionTimeout,
// //                 socketTimeoutMS: 45000,
// //                 retryWrites: true,
// //                 w: 'majority'
// //             });

// //             console.log('✅ MongoDB connected successfully');
// //             isDbConnected = true;
// //             return true;
// //         } catch (err) {
// //             console.error('❌ MongoDB connection error:', err.message);
// //             retries--;
            
// //             if (retries === 0) {
// //                 console.error('❌ Max retries reached');
// //                 return false;
// //             }

// //             await new Promise(resolve => setTimeout(resolve, delay));
// //         }
// //     }
// //     return false;
// // };

// // // MongoDB Event Handlers
// // mongoose.connection.on('error', (err) => {
// //     console.error('MongoDB error:', err);
// //     isDbConnected = false;
// // });

// // mongoose.connection.on('disconnected', () => {
// //     console.log('MongoDB disconnected');
// //     isDbConnected = false;
    
// //     if (!isShuttingDown) {
// //         connectDB(3).catch(console.error);
// //     }
// // });

// // mongoose.connection.on('connected', () => {
// //     console.log('MongoDB connected');
// //     isDbConnected = true;
// // });

// // // Error Handling
// // app.use((err, req, res, next) => {
// //     console.error('Error:', err);
// //     res.status(err.status || 500).json({
// //         error: err.name || 'Internal Server Error',
// //         message: config.nodeEnv === 'development' ? err.message : 'An error occurred',
// //         version: config.buildVersion
// //     });
// // });

// // // 404 Handler
// // app.use((req, res) => {
// //     res.status(404).json({
// //         error: 'Not Found',
// //         path: req.path,
// //         method: req.method,
// //         version: config.buildVersion
// //     });
// // });

// // // Graceful Shutdown
// // const gracefulShutdown = async (signal) => {
// //     try {
// //         console.log(`\n${signal} received. Starting graceful shutdown...`);
// //         isShuttingDown = true;

// //         // Stop accepting new requests (handled by middleware)
// //         console.log('Stopping new requests...');
        
// //         // Wait for existing requests to complete (you might want to add a timeout)
// //         await new Promise(resolve => setTimeout(resolve, 10000));

// //         // Close MongoDB connection
// //         if (mongoose.connection.readyState === 1) {
// //             console.log('Closing MongoDB connection...');
// //             await mongoose.connection.close();
// //             console.log('MongoDB connection closed');
// //         }

// //         console.log('Graceful shutdown completed');
// //         process.exit(0);
// //     } catch (err) {
// //         console.error('Error during shutdown:', err);
// //         process.exit(1);
// //     }
// // };

// // // Start Server
// // const startServer = async () => {
// //     try {
// //         const isConnected = await connectDB();
        
// //         if (!isConnected) {
// //             console.error('Failed to connect to MongoDB. Exiting...');
// //             process.exit(1);
// //         }

// //         const server = app.listen(config.port, '0.0.0.0', () => {
// //             console.log(`
// // 🚀 Server is running on port ${config.port}
// // 📦 Version: ${config.buildVersion}
// // 🔧 Environment: ${config.nodeEnv}
// // 🏥 Liveness: http://localhost:${config.port}/api/health/live
// // 🔍 Readiness: http://localhost:${config.port}/api/health/ready
// //             `);
// //         });

// //         // Server error handler
// //         server.on('error', (err) => {
// //             console.error('Server error:', err);
// //             process.exit(1);
// //         });

// //         // Periodic ready state check
// //         setInterval(() => {
// //             if (!isShuttingDown && !isDbConnected) {
// //                 console.log('Database connection check failed, attempting reconnect...');
// //                 connectDB(3).catch(console.error);
// //             }
// //         }, config.readyStateCheckInterval);

// //     } catch (err) {
// //         console.error('Failed to start server:', err);
// //         process.exit(1);
// //     }
// // };

// // // Process Event Handlers
// // process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// // process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// // process.on('uncaughtException', (err) => {
// //     console.error('Uncaught Exception:', err);
// //     gracefulShutdown('uncaughtException');
// // });
// // process.on('unhandledRejection', (err) => {
// //     console.error('Unhandled Rejection:', err);
// //     gracefulShutdown('unhandledRejection');
// // });

// // // Start the server
// // startServer();

// // module.exports = app;
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const movieRouter = require("./routes/movie");
const actorRouter = require("./routes/actor");
const producerRouter = require("./routes/producer");

// Initialize express
const app = express();

// Configuration
const config = {
    port: parseInt(process.env.PORT || '5000', 10),
    mongoUrl: process.env.MONGO_URL,
    nodeEnv: process.env.NODE_ENV || 'development',
    buildVersion: process.env.BUILD_VERSION || 'development',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],
    connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT || '10000', 10),
    readyStateCheckInterval: parseInt(process.env.READY_STATE_CHECK_INTERVAL || '5000', 10)
};

// Server state
let isShuttingDown = false;
let isDbConnected = false;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    if (!isShuttingDown) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    } else {
        res.status(503).json({ error: 'Service is shutting down' });
    }
});

// Liveness probe endpoint
app.get('/api/health/live', (req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        version: config.buildVersion
    });
});

// Readiness probe endpoint
app.get('/api/health/ready', (req, res) => {
    if (isShuttingDown) {
        return res.status(503).json({
            status: 'shutting_down',
            timestamp: new Date().toISOString()
        });
    }

    const isReady = mongoose.connection.readyState === 1 && isDbConnected;
    
    res.status(isReady ? 200 : 503).json({
        status: isReady ? 'ready' : 'not_ready',
        version: config.buildVersion,
        timestamp: new Date().toISOString(),
        database: {
            connected: isDbConnected,
            state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
        }
    });
});

// API Routes
app.use("/api/movies", movieRouter);
app.use("/api/actors", actorRouter);
app.use("/api/producers", producerRouter);

// MongoDB Connection
const connectDB = async (retries = 5, delay = 5000) => {
    while (retries > 0 && !isShuttingDown) {
        try {
            console.log(`Connecting to MongoDB... (${retries} attempts remaining)`);
            
            await mongoose.connect(config.mongoUrl, {
                serverSelectionTimeoutMS: config.connectionTimeout,
                connectTimeoutMS: config.connectionTimeout,
                socketTimeoutMS: 45000,
                retryWrites: true,
                w: 'majority'
            });

            console.log('✅ MongoDB connected successfully');
            isDbConnected = true;
            return true;
        } catch (err) {
            console.error('❌ MongoDB connection error:', err.message);
            retries--;
            
            if (retries === 0) {
                console.error('❌ Max retries reached');
                return false;
            }

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return false;
};

// MongoDB Event Handlers
mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
    isDbConnected = false;
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    isDbConnected = false;
    
    if (!isShuttingDown) {
        connectDB(3).catch(console.error);
    }
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
    isDbConnected = true;
});

// Error Handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: config.nodeEnv === 'development' ? err.message : 'An error occurred',
        version: config.buildVersion
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        method: req.method,
        version: config.buildVersion
    });
});

// Graceful Shutdown
const gracefulShutdown = async (signal) => {
    try {
        console.log(`\n${signal} received. Starting graceful shutdown...`);
        isShuttingDown = true;

        // Stop accepting new requests (handled by middleware)
        console.log('Stopping new requests...');
        
        // Wait for existing requests to complete (you might want to add a timeout)
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Close MongoDB connection
        if (mongoose.connection.readyState === 1) {
            console.log('Closing MongoDB connection...');
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        }

        console.log('Graceful shutdown completed');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
};

// Start Server
const startServer = async () => {
    try {
        const isConnected = await connectDB();
        
        if (!isConnected) {
            console.error('Failed to connect to MongoDB. Exiting...');
            process.exit(1);
        }

        const server = app.listen(config.port, '0.0.0.0', () => {
            console.log(`
🚀 Server is running on port ${config.port}
📦 Version: ${config.buildVersion}
🔧 Environment: ${config.nodeEnv}
🏥 Liveness: http://localhost:${config.port}/api/health/live
🔍 Readiness: http://localhost:${config.port}/api/health/ready
            `);
        });

        // Server error handler
        server.on('error', (err) => {
            console.error('Server error:', err);
            process.exit(1);
        });

        // Periodic ready state check
        setInterval(() => {
            if (!isShuttingDown && !isDbConnected) {
                console.log('Database connection check failed, attempting reconnect...');
                connectDB(3).catch(console.error);
            }
        }, config.readyStateCheckInterval);

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

// Process Event Handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();

module.exports = app;