import type { FastifyInstance } from 'fastify';
import handler from './handler';

export const getUsersRoute = async (app: FastifyInstance): Promise<void> => {
  app.route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['user'],
      description: 'Get the current user',
    },
    handler,
  });
};
