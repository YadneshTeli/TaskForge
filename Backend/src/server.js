require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const { graphqlUploadExpress } = require("graphql-upload");
const connectMongo = require("./config/db");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const authMiddleware = require("./middleware/auth.middleware");
const rateLimit = require("./middleware/rateLimit.middleware");
const errorHandler = require("./middleware/errorHandler");
const securityMiddleware = require('./middleware/security.middleware');

const app = express();

const allowedOrigins = [
  "https://your-frontend-domain.com", 
  "http://localhost:3000",
  "http://10.72.125.97:3000",      // Your laptop's WiFi IP for web
  "http://10.72.125.97:4000",      // Direct backend access
  "http://192.168.56.1:3000",      // Ethernet adapter (if needed)
  "http://192.168.137.1:3000",     // Hotspot adapter (if needed)
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

app.use(express.json());
app.use(graphqlUploadExpress());
app.use(authMiddleware.decodeToken);
app.use(rateLimit);
securityMiddleware(app);

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/file", require("./routes/upload.routes"));

// Health check endpoint for network testing
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'TaskForge Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple endpoint to test connectivity
app.get('/health', (req, res) => {
  res.status(200).json({
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});
app.use("/api/report", require("./routes/report.routes"));
app.use("/api/project", require("./routes/project.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/tasks", require("./routes/task.routes"));
app.use("/api/comments", require("./routes/comment.routes"));
app.use(errorHandler);

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ user: req.user })
});

async function start() {
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
