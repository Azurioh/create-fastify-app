import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import environment from '@{{PROJECT_NAME}}/environment';
import type { FastifyInstance } from 'fastify';

/**
 * @description Setup the swagger plugin for the fastify instance
 * @param ffy - The fastify instance
 */
export const setupSwagger = (ffy: FastifyInstance): void => {
  const apibaseUrl = environment.API_BASE_URL;

  ffy.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'API',
        description: 'documentation API',
        version: '0.1.0',
      },
      servers: [{ url: apibaseUrl }],
    },
  });

  ffy.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    staticCSP: true,
    transformSpecification: (swaggerObject) => swaggerObject,
  });
};
