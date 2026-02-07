import Fastify from 'fastify'
import cors from '@fastify/cors'
import { pool } from './database.js'

const fastify = Fastify({
  logger: true
})

await fastify.register(cors, { 
  origin: '*' 
})

fastify.get('/db-test', async (request, reply) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    return { status: 'Connected', time: result.rows[0].current_time };
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Database connection failed' });
  }
})

// gracefull shutdown
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

process.on('SIGTERM', async () => {
  await fastify.close();
  await pool.end(); // close db connections
  process.exit(0);
});

start();