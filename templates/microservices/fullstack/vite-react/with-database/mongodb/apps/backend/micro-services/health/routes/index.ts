import type { FastifyInstance } from 'fastify';
import handler from './handler';

const healthRoute = async (app: FastifyInstance): Promise<void> => {
  app.route({
    method: 'GET',
    url: '',
    schema: {
      tags: ['health'],
      description: 'Check if the server is running',
    },
    handler,
  });
};

export async function router(app: FastifyInstance): Promise<void> {
  app.register(healthRoute, { prefix: '/health' });
}
