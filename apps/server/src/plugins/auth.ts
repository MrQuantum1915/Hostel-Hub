import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';

export default fp(async (fastify:any) => {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET_KEY,
    cookie: {
      cookieName: 'token',
      signed: true
    }
  });

  fastify.decorate('authenticate', async (request:any, reply:any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});