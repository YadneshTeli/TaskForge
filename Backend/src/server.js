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

const app = express();

const allowedOrigins = ["https://your-frontend-domain.com", "http://localhost:3000"];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
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

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/file", require("./routes/upload.routes"));
app.use("/api/report", require("./routes/report.routes"));
app.use("/api/project", require("./routes/project.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
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

    app.listen(4000, () => {
    console.log("🚀 Server ready at http://localhost:4000/graphql");
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
