import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Extract database credentials supporting DB_*, MYSQL*, or MYSQL_URL / DATABASE_URL
let dbHost = process.env.DB_HOST || process.env.MYSQLHOST;
let dbPort = parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306', 10);
let dbUser = process.env.DB_USER || process.env.MYSQLUSER;
let dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : process.env.MYSQLPASSWORD;
let dbName = process.env.DB_NAME || process.env.MYSQLDATABASE;

// Check for single connection string URL (e.g., MYSQL_URL, DATABASE_URL)
const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.DATABASE_PRIVATE_URL;
if (connectionUrl && (!dbHost || !dbUser)) {
  try {
    const parsed = new URL(connectionUrl);
    dbHost = dbHost || parsed.hostname;
    dbPort = dbPort || parseInt(parsed.port || '3306', 10);
    dbUser = dbUser || parsed.username;
    dbPassword = dbPassword !== undefined ? dbPassword : decodeURIComponent(parsed.password || '');
    dbName = dbName || (parsed.pathname ? parsed.pathname.replace(/^\//, '') : 'eventra_db');
  } catch (err) {
    console.warn('⚠️ Could not parse connection URL, falling back to individual parameters.');
  }
}

// Final fallbacks
dbHost = dbHost || 'localhost';
dbPort = dbPort || 3306;
dbUser = dbUser || 'root';
dbPassword = dbPassword || '';
dbName = dbName || 'eventra_db';

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
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
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
  } catch (error: any) {
    console.error(`❌ Failed to connect to MySQL database at ${dbHost}:${dbPort}:`, error.message);
    return false;
  }
};

export default pool;
