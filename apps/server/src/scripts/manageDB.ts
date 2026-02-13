import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';
import { execSync } from 'child_process';

import fs from 'fs';

// using nodejs env loading because fastify-env works in server not in standalone scripts
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');

const QUERY = fs.readFileSync(path.join(__dirname, 'TestingQueries.sql'), 'utf-8');

try {
    process.loadEnvFile(envPath);
} catch (err) {
    console.warn("Warning: .env file not found at", envPath);
}

const pool = new pg.Pool({
    user: process.env.POSTGRES_USER || 'user',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'hostel_db',
    password: process.env.POSTGRES_PASSWORD || 'password',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

const waitForDB = async () => {
    let retries = 30;
    while (retries > 0) {
        try {
            await pool.query('SELECT 1');
            console.log("Database is ready!");
            return;
        } catch (err) {
            console.log(`Waiting for database... (${retries} retries left)`);
            retries--;
            await new Promise(res => setTimeout(res, 1000));
        }
    }
    console.error("Could not connect to database after multiple retries.");
    process.exit(1);
};

const setupDB = async () => {
    try {
        console.log("Connecting to database...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS auth(
                id UUID PRIMARY KEY DEFAULT uuidv7(),
                user_name TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS users(
                id UUID REFERENCES auth(id) ON DELETE CASCADE,
                user_name TEXT REFERENCES auth(user_name) ON DELETE CASCADE,
                name VARCHAR(20) NOT NULL,
                email TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student',
                phone TEXT NOT NULL
            );
        `);

        console.log("DB initialized successfully!");
        console.log("- Created table: auth");
        console.log("- Created table: users");

    } catch (err) {
        console.error("DB initialization failed:", err);
        process.exit(1);
    }

};


const resetDB = async () => {
    try {
        console.log("RESETTING DATABASE...");

        await pool.query(`
            DROP SCHEMA public CASCADE;
            CREATE SCHEMA public;
            GRANT ALL ON SCHEMA public TO public;
            GRANT ALL ON SCHEMA public TO "${process.env.POSTGRES_USER || 'user'}";
        `);

        console.log("Database cleared.");

        console.log("Running setup...");
        await setupDB();

    } catch (err) {
        console.error("Database reset failed:", err);
        process.exit(1);
    }

};


const runQuery = async () => {
    try {
        console.log("Running Query:");
        console.log(QUERY);
        console.log("--------------------------------");

        const res = await pool.query(QUERY);

        console.log("Success!");
        if (res.rows.length > 0) {
            console.table(res.rows);
        } else {
            console.log("No rows returned (DDL command successful).");
        }

    } catch (err) {
        console.error("Query failed:", err);
    }

};

const main = async () => {
    const args = process.argv.slice(2);
    console.log("Command:", args[0]);
    if (args[0] === '--help') {
        console.log(`
Usage: pnpm db:manage [command]

Commands:
    setup     Initialize the database tables
    reset     Drop all tables and re-run setup
    query     Run the SQL command defined in the QUERY constant
    --help    Show this help message
                `);
        return;
    }
    try {
        // start docker first....
        console.log("[INFO] Starting database container...");
        // execSync used to run shell commands
        execSync('docker compose -f ../../docker-compose.yml up -d', { stdio: 'inherit' });

        await waitForDB();
        switch (args[0]) {
            case 'setup':
                await setupDB();
                break;
            case 'reset':
                await resetDB();
                break;
            case 'query':
                await runQuery();
                break;
            default:
                console.log("Invalid argument. Use pnpm db:manage --help for more information");
        }
    } finally {
        await pool.end();
        console.log("Stopping database container...");
        try {
            execSync('docker compose -f ../../docker-compose.yml stop', { stdio: 'inherit' });
        } catch (err) {
            console.error("Failed to stop docker container:", err);
        }
    }
}

main();