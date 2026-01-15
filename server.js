// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');

// Clean up stale Next.js lock files before starting
const cleanupLockFiles = () => {
  const lockPath = path.join(process.cwd(), '.next', 'dev', 'lock');
  const cachePath = path.join(process.cwd(), '.next', 'cache');
  
  try {
    // Remove lock file if it exists
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
      console.log('✓ Cleaned up stale lock file');
    }
    
    // Optionally clean cache if it's causing issues (uncomment if needed)
    // if (fs.existsSync(cachePath)) {
    //   fs.rmSync(cachePath, { recursive: true, force: true });
    //   console.log('✓ Cleaned up cache');
    // }
  } catch (error) {
    // Ignore errors - lock file might not exist or already be removed
    if (error.code !== 'ENOENT') {
      console.warn('Warning: Could not clean lock files:', error.message);
    }
  }
};

// Clean up before starting
cleanupLockFiles();

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
    resolveJsonModule: true,
    baseUrl: '.',
    paths: {
      '@/*': ['./*'],
    },
  },
});

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initSocketIO } = require('./lib/socket');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3001;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Handle graceful shutdown to clean up lock files
process.on('SIGTERM', () => {
  cleanupLockFiles();
  process.exit(0);
});

process.on('SIGINT', () => {
  cleanupLockFiles();
  process.exit(0);
});

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io
  initSocketIO(httpServer);

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
