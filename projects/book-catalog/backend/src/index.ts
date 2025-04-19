import 'reflect-metadata';
import { ApolloServer } from "apollo-server-koa";
import { typeDefs, resolvers } from "./graphql/index.js";
import { connectDB } from "./config/db.js";
import Koa from 'koa';
import dotenv from 'dotenv';
import authMiddleware from './middlewares/authMiddleware.js';
// import redisClient from './services/redis-client.js';


dotenv.config();

const { PORT } = process.env;
const app = new Koa();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ ctx }) => {
    return {
      user: ctx.state.user,
      // redis: redisClient
    };
  }
});

const serverStart = async () => {
  try {
    await connectDB();
    await server.start();

    app.use(authMiddleware);

    server.applyMiddleware({ app });

    app.listen(PORT, () => {
      console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
}

serverStart();

