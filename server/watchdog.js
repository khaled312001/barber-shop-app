const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const APP_DIR = '/home/u492425110/barber-app';
const SERVER_FILE = path.join(APP_DIR, 'server_dist/index.js');
const PORT = 3000;
const CHECK_INTERVAL = 30000;
const STARTUP_GRACE = 15000;
const HEALTH_TIMEOUT = 10000;

function loadEnv() {
    try {
        const envFile = path.join(APP_DIR, '.env');
        if (!fs.existsSync(envFile)) return {};
        const env = {};
        const content = fs.readFileSync(envFile, 'utf8');
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const idx = trimmed.indexOf('=');
            if (idx > 0) {
                const key = trimmed.slice(0, idx).trim();
                let value = trimmed.slice(idx + 1).trim();
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                env[key] = value;
            }
        }
        return env;
    } catch (e) {
        console.error('[Watchdog] Failed to load .env:', e.message);
        return {};
    }
}

const envVars = loadEnv();
console.log('[Watchdog] Loaded env vars:', Object.keys(envVars).join(', '));

let serverProcess = null;
let restarting = false;
let lastStartTime = 0;

function startServer() {
    if (restarting) return;
    restarting = true;
    lastStartTime = Date.now();
    console.log('[Watchdog] Starting server at ' + new Date().toISOString());
    serverProcess = spawn('node', [SERVER_FILE], {
        cwd: APP_DIR,
        stdio: ['ignore', 'inherit', 'inherit'],
        env: Object.assign({}, process.env, envVars, { NODE_ENV: 'production', PORT: String(PORT) }),
    });
    serverProcess.on('exit', (code, signal) => {
        console.log('[Watchdog] Server exited (code=' + code + ', signal=' + signal + ') — restarting in 5s');
        serverProcess = null;
        restarting = false;
        setTimeout(startServer, 5000);
    });
    serverProcess.on('error', (err) => {
        console.error('[Watchdog] Server error: ' + err.message);
        serverProcess = null;
        restarting = false;
        setTimeout(startServer, 5000);
    });
    setTimeout(() => { restarting = false; }, STARTUP_GRACE);
}

function healthCheck() {
    if (Date.now() - lastStartTime < STARTUP_GRACE) return;
    if (restarting || !serverProcess) return;
    const req = http.get('http://127.0.0.1:' + PORT + '/api/salons', { timeout: HEALTH_TIMEOUT }, (res) => res.resume());
    req.on('error', () => {
        if (serverProcess && !restarting) {
            try { serverProcess.kill('SIGTERM'); } catch (e) {}
        }
    });
    req.on('timeout', () => req.destroy());
}

process.on('SIGTERM', () => { if (serverProcess) serverProcess.kill('SIGTERM'); process.exit(0); });
process.on('SIGINT', () => { if (serverProcess) serverProcess.kill('SIGTERM'); process.exit(0); });

startServer();
setInterval(healthCheck, CHECK_INTERVAL);
console.log('[Watchdog] Running');
