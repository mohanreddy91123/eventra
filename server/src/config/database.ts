import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306', 10);
const dbUser = process.env.DB_USER || process.env.MYSQLUSER || 'root';
const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.MYSQLPASSWORD || '');
const dbName = process.env.DB_NAME || process.env.MYSQLDATABASE || 'eventra_db';

const dbConfig: mysql.PoolOptions = {
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  timezone: '+00:00',
  dateStrings: true,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
};

export const pool = mysql.createPool(dbConfig);

// Helper for single connection without selecting database (used during database creation/init)
export const createAdminConnection = async () => {
  return await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Connected to MySQL Database: ${dbName} (${dbHost}:${dbPort})`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`❌ Failed to connect to MySQL database at ${dbHost}:${dbPort}:`, error);
    return false;
  }
};

export default pool;
