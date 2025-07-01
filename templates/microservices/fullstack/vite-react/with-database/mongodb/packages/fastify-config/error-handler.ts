import { HttpStatusCode } from '@{{PROJECT_NAME}}/shared/enums/http-status';
import type { FastifyRequest, FastifyReply } from 'fastify';
import Ajv from 'ajv';
import ApiError from '@{{PROJECT_NAME}}/shared/utils/api-error';
import environment from '@{{PROJECT_NAME}}/environment';
import { Errors } from '@{{PROJECT_NAME}}/shared/enums/errors';

export const notFoundHandler = (req: FastifyRequest, reply: FastifyReply): void => {
  reply.error(`The resource ${req.url} doesn't exist`, HttpStatusCode.notFound, Errors.ROUTE_NOT_FOUND);
};

/**
 * @function errorHandler
 * @description Handles errors in the application
 * @param error - The error to handle
 * @param req - The request object
 * @param reply - The reply object
 */
export const errorHandler = (error: unknown, _req: FastifyRequest, reply: FastifyReply): void => {
  if (error instanceof ApiError) {
    if (error.httpCode === HttpStatusCode.internalServerError) {
      Logger.getInstance().error(error.message);
    }
    reply.send({
      message: error.message,
      statusCode: error.statusCode,
      ...(error.data && { data: error.data }),
    });
  } else if (error instanceof Ajv.ValidationError || error instanceof z.ZodError) {
    if (error instanceof Ajv.ValidationError) {
      Logger.getInstance().error(error.message);
    } else {
      Logger.getInstance().error(error.errors.map((error) => error.message).join(', '));
    }

    reply.status(HttpStatusCode.badRequest).send({
      message: error.message,
      statusCode: Errors.BAD_REQUEST,
    });
  } else {
    Logger.getInstance().error(error);
    if (error instanceof Error) {
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
      reply.status(HttpStatusCode.internalServerError).send({
        message: 'An unhandled error occurred while processing your request',
        statusCode: Errors.INTERNAL_SERVER_ERROR,
      });
    }
  }
};
