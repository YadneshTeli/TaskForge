import 'dotenv/config';

// Validate environment variables before proceeding
import validateEnv from './config/validateEnv.js';
validateEnv();

import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import connectMongo from './config/db.js';
import typeDefs from './schema/index.js';
import getResolvers from './resolvers/index.js';
import * as authMiddleware from './middleware/auth.middleware.js';
import rateLimit from './middleware/rateLimit.middleware.js';
import errorHandler from './middleware/errorHandler.js';
import securityMiddleware from './middleware/security.middleware.js';
import authRoutes from './routes/auth.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import reportRoutes from './routes/report.routes.js';
import projectRoutes from './routes/project.routes.js';
import adminRoutes from './routes/admin.routes.js';
import taskRoutes from './routes/task.routes.js';
import commentRoutes from './routes/comment.routes.js';
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';

const app = express();

// Get allowed origins from environment variable
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:4000"
    ];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all origins during development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Body parser with size limits to prevent DoS attacks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(graphqlUploadExpress());
app.use(authMiddleware.decodeToken);
app.use(rateLimit);
securityMiddleware(app);

app.use("/api/auth", authRoutes);
app.use("/api/file", uploadRoutes);

// Enhanced health check endpoint with database connectivity checks
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'TaskForge Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    checks: {}
  };

  // Check MongoDB connection
  try {
    const mongoState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    health.checks.mongodb = {
      status: mongoState === 1 ? 'connected' : 'disconnected',
      state: mongoState,
      stateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoState]
    };
  } catch (error) {
    health.checks.mongodb = {
      status: 'error',
      message: error.message
    };
  }

  // Check PostgreSQL/Prisma connection
  try {
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    health.checks.postgresql = {
      status: 'connected'
    };
    await prisma.$disconnect();
  } catch (error) {
    health.checks.postgresql = {
      status: 'error',
      message: error.message
    };
  }

  // Determine overall health status
  const allHealthy = Object.values(health.checks)
    .every(check => check.status === 'connected');
  
  health.status = allHealthy ? 'OK' : 'DEGRADED';
  
  // Return appropriate status code
  const statusCode = allHealthy ? 200 : 503;
  res.status(statusCode).json(health);
});

// Simple endpoint to test connectivity
app.get('/health', (req, res) => {
  res.status(200).json({
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});
app.use("/api/report", reportRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use(errorHandler);

async function start() {
    // Load resolvers with GraphQLUpload
    const resolvers = await getResolvers();
    
    // Create ApolloServer with loaded resolvers
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => ({ user: req.user })
    });
    
    await connectMongo();
    await server.start();
    server.applyMiddleware({ app });

    // Listen on all interfaces (0.0.0.0) instead of just localhost
    app.listen(4000, '0.0.0.0', () => {
        console.log("🚀 Server ready at:");
        console.log("   📍 Local: http://localhost:4000/graphql");
        console.log("   📱 Mobile: http://10.72.125.97:4000/graphql");
        console.log("   🌐 REST API: http://10.72.125.97:4000/api");
    });
}

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

start();
