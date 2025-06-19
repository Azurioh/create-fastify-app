import { Errors } from '@{{PROJECT_NAME}}/shared/enums/errors';
import { HttpStatusCode } from '@{{PROJECT_NAME}}/shared/enums/http-status';
import ApiError from '@{{PROJECT_NAME}}/shared/utils/api-error';
import type { FastifyReply } from 'fastify';

/**
 * @description Send a success response
 *
 * @param this - The FastifyReply instance
 * @param data - The data to send in the response
 * @param httpCode - The HTTP code of the response
 * @param meta - The optional metadata for the response
 */
export function success<T>(
  this: FastifyReply,
  data: T,
  httpCode: HttpStatusCode = HttpStatusCode.ok,
  meta?: Record<string, unknown>,
): void {
  this.code(httpCode).send({
    status: 'success',
    data,
    ...(meta && { meta }),
  });
}

/**
 * @description Throw an API error with the specified HTTP code
 *
 * @param this - The FastifyReply instance
 * @param message - The error message
 * @param httpCode - The HTTP code to return
 * @param statusCode - The specific application status code
 * @param details - Additional details about the error
 */
export function error(
  this: FastifyReply,
  message: string,
  httpCode: HttpStatusCode = HttpStatusCode.badRequest,
  statusCode: Errors = Errors.BAD_REQUEST,
  details?: Record<string, unknown>,
): never {
  const errorInstance = new ApiError(httpCode, statusCode, message, details);
  this.code(httpCode);
  throw errorInstance;
}
