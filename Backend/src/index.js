require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const { graphqlUploadExpress } = require("graphql-upload");
const connectMongo = require("./config/db");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const authMiddleware = require("./middleware/auth.middleware");

const app = express();
app.use(cors());
app.use(express.json());
app.use(graphqlUploadExpress());
app.use(authMiddleware.decodeToken);

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/file", require("./routes/upload.routes"));
app.use("/api/report", require("./routes/report.routes"));

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

start();
