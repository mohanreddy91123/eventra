import app from './app.js';
import { testConnection } from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

// 1. Immediately bind and listen so Railway / Cloud proxy health checks succeed instantly
const server = app.listen(PORT, HOST, () => {
  console.log(`🌟 Eventra Backend is running on http://${HOST}:${PORT}`);
  console.log(`📡 Health check available at: http://${HOST}:${PORT}/api/health`);
});

// 2. Asynchronously verify database connection in background
testConnection()
  .then((connected) => {
    if (connected) {
      console.log('🚀 MySQL Database connection active and ready for queries.');
    } else {
      console.warn('⚠️ Warning: Initial database ping failed. Connection pool will retry on demand.');
    }
  })
  .catch((err) => {
    console.error('Database ping error:', err.message);
  });

export default server;
