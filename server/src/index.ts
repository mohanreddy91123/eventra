import app from './app.js';
import { testConnection } from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  console.log('🚀 Starting Eventra Server...');
  const isDbConnected = await testConnection();

  if (!isDbConnected) {
    console.warn('⚠️ Warning: Database connection failed. Please ensure MySQL is running.');
  }

  app.listen(PORT, () => {
    console.log(`🌟 Eventra Backend is running on http://localhost:${PORT}`);
    console.log(`📡 Health check available at: http://localhost:${PORT}/api/health`);
  });
}

startServer();
