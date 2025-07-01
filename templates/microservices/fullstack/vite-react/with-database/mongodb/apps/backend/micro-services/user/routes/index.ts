import type { FastifyInstance } from 'fastify';
import { getUsersRoute } from './get-users';

export const router = async (app: FastifyInstance): Promise<void> => {
  app.register(getUsersRoute, { prefix: '/users' });
};
