import Fastify from 'fastify'
import cors from '@fastify/cors'

const fastify = Fastify({
  logger: true
})

await fastify.register(cors, { 
  origin: '*' 
})

fastify.get('/', async function handler (request, reply) {
  return { data: 'Mr Quantum' }
})

try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}