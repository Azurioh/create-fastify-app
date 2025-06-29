import fastifyMongo from '@fastify/mongodb';
import type { FastifyInstance } from 'fastify';
import environment from '@{{PROJECT_NAME}}/environment';

export const setupMongoDB = (app: FastifyInstance): void => {
  app
    .register(fastifyMongo, {
      forceClose: true,
      url: environment.MONGO_URI,
      database: environment.MONGO_DATABASE,
    })
    .ready((err) => {
      if (err) {
        console.error('MongoDB plugin registration failed:', err);
      }
    });
};
