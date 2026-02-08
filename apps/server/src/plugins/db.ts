import fp from 'fastify-plugin';
import pg from 'pg';

declare module 'fastify' {
    interface FastifyInstance {
        db: pg.Pool;
    }
}

export default fp(async (fastify) => {
    const pool = new pg.Pool({
        user: 'user',
        host: 'localhost',
        database: 'hostel_db',
        password: 'password',
        port: 5432,
    });

    fastify.decorate('db', pool);

    fastify.addHook('onClose', async (instance) => {
        await instance.db.end();
    });
});