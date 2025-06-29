import fastifyCors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';

/**
 * @description Setup the cors plugin for the fastify instance
 * @param ffy - The fastify instance
 */
export const setupCors = (ffy: FastifyInstance): void => {
  ffy.register(fastifyCors, { origin: '*' });
};
