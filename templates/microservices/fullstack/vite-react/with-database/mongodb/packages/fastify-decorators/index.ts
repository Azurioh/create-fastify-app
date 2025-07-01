import type { FastifyInstance } from 'fastify';
import { error, success } from './decorators/response-decorators';

/**
 * @description Setup the decorators for the fastify instance
 * @param ffy - The fastify instance
 */
export function setupDecorators(ffy: FastifyInstance): void {
  ffy.decorateReply('success', success);
  ffy.decorateReply('error', error);
}
