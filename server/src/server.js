import app from './app.js';
import { config } from './config/environment.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';

let server;

const startServer = async () => {
  // Connect to database
  await connectDatabase();

  server = app.listen(config.port, () => {
    console.log(`===============================================`);
    console.log(`Smart Service Hub Server running in ${config.env} mode`);
    console.log(`Listening on: http://localhost:${config.port}`);
    console.log(`Health Check: http://localhost:${config.port}/api/health`);
    console.log(`Allowed Client: ${config.clientUrl}`);
    console.log(`===============================================`);
  });
};

// Graceful shutdown handling
const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDatabase();
      console.log('Process terminated cleanly.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection at Promise]:', promise, 'reason:', reason);
});

startServer();
