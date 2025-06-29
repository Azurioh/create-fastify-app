/// <reference path="../../../packages/shared/types/fastify.d.ts" />
import { fastify, setupServer } from '@{{PROJECT_NAME}}/fastify-core';
import enviroment from '@{{PROJECT_NAME}}/environment';
import { router } from './routes';

const start = async () => {
  setupServer(fastify);

  fastify.register(router);

  await fastify.ready();

  fastify.mongo.db?.collection('users').insertOne({
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
  });

  try {
    await fastify.listen({
      port: enviroment.PORT,
      host: '0.0.0.0',
    });
    console.log(`Server listening on http://0.0.0.0:${enviroment.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
