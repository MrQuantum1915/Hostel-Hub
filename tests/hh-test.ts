import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const main = async () => {
    console.log("Starting Hostel-Hub Custom Test Suite...");
    const testFiles = fs.readdirSync(__dirname)
        .filter(f => f.endsWith('.test.ts'))
        .sort(); // ensures blackbox runs before whitebox
    
    let passed = 0;
    let failed = 0;

    for (const file of testFiles) {
        console.log(`\nRunning: ${file}`);
        try {
            await import(`./${file}`);
            console.log(`${GREEN}OK: ${file} passed${RESET}`);
            passed++;
        } catch (err) {
            console.error(`${RED}FAILED: ${file} failed${RESET}`);
            console.error(err);
            failed++;
        }
    }

    console.log("\n" + "=".repeat(40));
    const summaryColor = failed === 0 ? GREEN : RED;
    console.log(`${summaryColor}Test Summary: ${passed} passed, ${failed} failed${RESET}`);
    console.log("=".repeat(40));

    // If any dynamically imported tests threw an error instead of process.exit(1)
    if (failed > 0) process.exit(1);
}

main();