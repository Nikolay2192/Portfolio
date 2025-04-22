import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-koa';
import { typeDefs, resolvers } from './graphql/index.js';
import { closeDB, connectDB } from './config/db.js';
import Koa from 'koa';
import dotenv from 'dotenv';
import authMiddleware from './middlewares/authMiddleware.js';
import helmet from 'koa-helmet';
import { createServer } from 'http';

dotenv.config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

const { PORT, HOST, NODE_ENV } = process.env;
const app = new Koa();

app.use(async (ctx, next) => {
  if (ctx.path === '/health') {
    ctx.status = 200;
    ctx.body = { status: 'ok' };
    return;
  }
  await next();
});

// app.use(helmet());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ ctx }) => ({
    user: ctx.state.user,
  }),
  introspection: NODE_ENV !== 'production',
});

const serverStart = async () => {
  try {
    await connectDB();
    await server.start();

    app.use(authMiddleware); 

    server.applyMiddleware({ app });

    const httpServer = createServer(app.callback());

    httpServer.listen(PORT, () => {
      console.log(`Server ready at http://${HOST}:${PORT}${server.graphqlPath}`);
    });

    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      await closeDB();
      httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

serverStart();
