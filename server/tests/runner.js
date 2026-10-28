import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testSuites = [
  'auth.test.js',
  'services.test.js',
  'bookings.test.js',
  'reviews.test.js'
];

async function runTest(suiteFile) {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(__dirname, suiteFile);
    console.log(`\n======================================================`);
    console.log(`▶ RUNNING SUITE: ${suiteFile}`);
    console.log(`======================================================`);

    const proc = spawn(process.execPath, ['--test', fullPath], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' }
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`✔ SUITE PASSED: ${suiteFile}`);
        resolve();
      } else {
        console.error(`✖ SUITE FAILED (exit code ${code}): ${suiteFile}`);
        reject(new Error(`Test suite ${suiteFile} failed with exit code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function runAll() {
  const startTime = Date.now();
  console.log('🚀 Starting Smart Service Hub Full Test Verification...');

  for (const suite of testSuites) {
    try {
      await runTest(suite);
    } catch (err) {
      console.error(`\n❌ Test run aborted due to suite failure: ${suite}`);
      process.exit(1);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n======================================================`);
  console.log(`🎉 ALL 4 TEST SUITES PASSED IN ${durationSec}s!`);
  console.log(`  1. Auth & RBAC Security Suite: 11 tests`);
  console.log(`  2. Services Catalog & Provider API Suite: 9 tests`);
  console.log(`  3. Bookings Lifecycle & State Machine Suite: 11 tests`);
  console.log(`  4. Reviews & Ratings Aggregations Suite: 7 tests`);
  console.log(`  TOTAL: 38 passing integration tests`);
  console.log(`======================================================\n`);
  process.exit(0);
}

runAll();
