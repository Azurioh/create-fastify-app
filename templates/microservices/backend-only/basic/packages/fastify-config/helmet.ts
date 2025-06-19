import fastifyHelmet from '@fastify/helmet';
import type { FastifyInstance } from 'fastify';

/**
 * @description Setup the helmet plugin for the fastify instance
 * @param ffy - The fastify instance
 */
export const setupHelmet = (ffy: FastifyInstance): void => {
  ffy.register(fastifyHelmet);
};
