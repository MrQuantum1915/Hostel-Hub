import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  user: 'user',
  host: 'localhost', // Use 'db' if running the app inside Docker
  database: 'hostel_db',
  password: 'password',
  port: 5432,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});