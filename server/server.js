const express = require("express");
//import ApolloServer
const { ApolloServer } = require("apollo-server-express");
//import typeDefs and resolvers
const { typeDefs, resolvers } = require("./schemas");
const path = require("path");
const db = require("./config/connection");
const { authMiddleware } = require("./utils/auth");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  //create a new Apollo server and pass in our schema data
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  });
  //start the Apollo server
  await server.start();
  //integrate Apollo server with the Express application as middleware
  server.applyMiddleware({ app });
  //log where we can go to test our GQL API
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
};

//initialize the apollo server
startServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});
// app.use(routes);

db.once("open", () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
