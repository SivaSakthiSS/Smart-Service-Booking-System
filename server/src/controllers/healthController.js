import { getDatabaseStatus } from '../config/db.js';
import { config } from '../config/environment.js';

export const getHealth = (req, res) => {
  const dbStatus = getDatabaseStatus();
  const uptimeSeconds = Math.floor(process.uptime());

  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  const formattedUptime = `${hours}h ${minutes}m ${seconds}s`;

  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    success: true,
    message: 'Smart Service Hub API is operational',
    data: {
      service: 'smart-service-hub-api',
      version: '1.0.0',
      environment: config.env,
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptimeSeconds,
        formatted: formattedUptime
      },
      database: dbStatus,
      system: {
        nodeVersion: process.version,
        memoryUsageMB: {
          rss: (memoryUsage.rss / 1024 / 1024).toFixed(2),
          heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
          heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2)
        }
      }
    }
  });
};
