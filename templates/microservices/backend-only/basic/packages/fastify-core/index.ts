import Fastify, { type FastifyReply, type FastifyRequest, type FastifyInstance } from 'fastify';
import { setupCors } from '@{{PROJECT_NAME}}/fastify-config/cors';
import { setupRateLimit } from '@{{PROJECT_NAME}}/fastify-config/rate-limit';
import { setupSwagger } from '@{{PROJECT_NAME}}/fastify-config/swagger';
import { setupHelmet } from '@{{PROJECT_NAME}}/fastify-config/helmet';
import { setupDecorators } from '@{{PROJECT_NAME}}/fastify-decorators';
import { HttpStatusCode } from '@{{PROJECT_NAME}}/shared/enums/http-status';
import ApiError from '@{{PROJECT_NAME}}/shared/utils/api-error';
import environment from '@{{PROJECT_NAME}}/environment';
import { Errors } from '@{{PROJECT_NAME}}/shared/enums/errors';
import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';

export const fastify = Fastify({ logger: true });

/**
 * @description Setup the server
 * @param ffy - The fastify instance
 * @returns void
 */
export const setupServer = (ffy: FastifyInstance): void => {
  // Setup decorators
  setupDecorators(ffy);

  // Setup plugins
  setupCors(ffy);
  setupHelmet(ffy);
  setupRateLimit(ffy);

  // Setup swagger
  setupSwagger(ffy);

  ffy.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    reply.status(404).send({
      message: `The resource ${request.url} doesn't exist`,
    });
  });

  /*!> Register the default error handler */
  ffy.setErrorHandler((error: unknown, _: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof ApiError) {
      reply.send({
        message: error.message,
        statusCode: error.statusCode,
        ...(error.data && { data: error.data }),
      });
    } else if (error instanceof Error) {
      if (environment.NODE_ENV === 'development') {
        reply.status(HttpStatusCode.internalServerError).send({
          message: error.message,
          statusCode: Errors.INTERNAL_SERVER_ERROR,
          stack: error.stack,
        });
      } else {
        reply.status(HttpStatusCode.internalServerError).send({
          message: error.message,
          statusCode: Errors.INTERNAL_SERVER_ERROR,
        });
      }
    } else {
      ffy.log.error('Unhandled error occured:', error);
      reply.status(HttpStatusCode.internalServerError).send({
        message: 'An unhandled error occurred while processing your request',
        statusCode: Errors.INTERNAL_SERVER_ERROR,
      });
    }
  });

  /*!> Validator for request body schemas */
  ffy.setValidatorCompiler(({ schema }) => {
    const ajv = new Ajv({ coerceTypes: false, strict: true });
    ajvFormats(ajv);
    return ajv.compile(schema);
  });
};
