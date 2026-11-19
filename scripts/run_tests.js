const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = 3009;

console.log(`Starting Next.js server on port ${PORT}...`);
const server = spawn('npx.cmd', ['next', 'start', '-p', String(PORT)], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  shell: true,
});

function waitForServer(port, maxRetries = 25) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const interval = setInterval(() => {
      retries++;
      const req = http.get(`http://127.0.0.1:${port}/api/stats`, (res) => {
        clearInterval(interval);
        resolve();
      });
      req.on('error', () => {
        if (retries >= maxRetries) {
          clearInterval(interval);
          reject(new Error(`Server on port ${port} did not start in time`));
        }
      });
    }, 1000);
  });
}

async function run() {
  try {
    console.log(`Waiting for server to become ready on http://127.0.0.1:${PORT}...`);
    await waitForServer(PORT);
    console.log('Server is responsive! Running test_platform.js...');

    const tests = spawn('node', ['scripts/test_platform.js'], {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, TEST_PORT: String(PORT) },
      stdio: 'inherit',
      shell: true,
    });

    tests.on('exit', (code) => {
      console.log(`Test exited with code ${code}. Stopping Next.js server...`);
      spawn('taskkill', ['/pid', String(server.pid), '/f', '/t']);
      process.exit(code || 0);
    });
  } catch (err) {
    console.error(err.message);
    spawn('taskkill', ['/pid', String(server.pid), '/f', '/t']);
    process.exit(1);
  }
}

run();
