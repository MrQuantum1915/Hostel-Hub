import Fastify from 'fastify'
import autoload from '@fastify/autoload';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyEnv from '@fastify/env';
import cookie from '@fastify/cookie';

import cors from '@fastify/cors'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fastify = Fastify({ logger: true });

// for env var using fastify-env for global access
const schema = {
  type: 'object',
  required: ['JWT_SECRET_KEY', 'COOKIE_SECRET'],
  properties: {
    JWT_SECRET_KEY: { type: 'string' },
    COOKIE_SECRET: { type: 'string' }
  }
};

await fastify.register(fastifyEnv, {
  confKey: 'config',
  schema: schema,
  dotenv: true
});

await fastify.register(cors, {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
})

fastify.register(cookie, {
  secret: process.env.COOKIE_SECRET,
  hook: 'onRequest',
  parseOptions: {}
});

const start = async () => {
  await fastify.register(autoload, {
    dir: path.join(__dirname, 'plugins')
  });

  await fastify.register(autoload, {
    dir: path.join(__dirname, 'routes'),
    dirNameRoutePrefix: true
  });

  await fastify.listen({ port: 3000 });
};

start();