import 'fastify';
import type { Errors } from '@{{PROJECT_NAME}}/shared/enums/errors';
import type { HttpStatusCode } from '@{{PROJECT_NAME}}/shared/enums/http-status';

declare module 'fastify' {
  interface FastifyReply {
    /**
     * Sends a success response with the specified HTTP code.
     *
     * @param data - The data to send in the response.
     * @param httpCode - The HTTP code of the response.
     * @param meta - Optional metadata for the response.
     */
    success<T>(data: T, httpCode?: HttpStatusCode, meta?: Record<string, unknown>): void;

    /**
     * Throws an API error with the specified HTTP code.
     *
     * @param message - The descriptive error message.
     * @param httpCode - The HTTP code to return.
     * @param statusCode - The application-specific status code.
     * @param details - Additional details about the error.
     */
    error(message: string, httpCode: HttpStatusCode, statusCode: Errors, details?: Record<string, unknown>): never;
  }

  interface FastifyInstance {
    mongo: {
      db: import('mongodb').Db | null;
      client: import('mongodb').MongoClient;
    };
  }
}
