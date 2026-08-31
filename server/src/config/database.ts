import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized Database Configuration Resolver
 * Strict Priority Order:
 * 1. Railway / Cloud MySQL Connection URI (MYSQL_URL, DATABASE_URL, DATABASE_PRIVATE_URL, MYSQL_PRIVATE_URL)
 * 2. Railway Discrete Environment Variables (MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE)
 * 3. Custom / Local Environment Variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
 * 4. Local Development Fallbacks (localhost:3306)
 */
export function getDatabaseConfig(): mysql.PoolOptions {
  const connectionUrl =
    process.env.MYSQL_URL ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_PRIVATE_URL ||
    process.env.MYSQL_PRIVATE_URL;

  // PRIORITY 1: Direct MySQL Connection URL (e.g. Railway MySQL Service)
  if (connectionUrl && (connectionUrl.startsWith('mysql://') || connectionUrl.startsWith('mysql2://'))) {
    const cleanUrl = connectionUrl.replace(/^mysql2:\/\//, 'mysql://');
    return {
      uri: cleanUrl,
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
  }

  // PRIORITY 2: Railway Discrete Variables
  if (process.env.MYSQLHOST) {
    return {
      host: process.env.MYSQLHOST,
      port: parseInt(process.env.MYSQLPORT || '3306', 10),
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD || '',
      database: process.env.MYSQLDATABASE || 'railway',
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
  }

  // PRIORITY 3: Custom or Local DB_* Variables
  if (process.env.DB_HOST) {
    return {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'eventra_db',
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
  }

  // PRIORITY 4: Local Development Fallback
  return {
    host: 'localhost',
    port: parseInt(process.env.PORT || '3306', 10),
    user: process.env.USER || process.env.USERNAME || 'root',
    password: '',
    database: 'eventra_db',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    timezone: '+00:00',
    dateStrings: true,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: undefined,
  };
}

const activeDbConfig = getDatabaseConfig();

export const pool = mysql.createPool(activeDbConfig);

/**
 * Creates a single database connection using the centralized configuration
 */
export const createAdminConnection = async () => {
  const config = getDatabaseConfig();
  if (config.uri) {
    return await mysql.createConnection({
      uri: config.uri,
      multipleStatements: true,
      ssl: config.ssl,
    });
  }
  return await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    multipleStatements: true,
    ssl: config.ssl,
  });
};

/**
 * Tests database connectivity safely without exposing passwords or credentials
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    const config = getDatabaseConfig();

    if (config.uri) {
      const maskedUri = config.uri.replace(/:([^:@/]+)@/, ':***@');
      console.log(`✅ Connected to MySQL Database via URI: ${maskedUri}`);
    } else {
      console.log(`✅ Connected to MySQL Database: ${config.database || 'default'} (${config.host}:${config.port}) as user: ${config.user || 'default'}`);
    }

    connection.release();
    return true;
  } catch (error: any) {
    const config = getDatabaseConfig();
    const target = config.uri
      ? config.uri.replace(/:([^:@/]+)@/, ':***@')
      : `${config.host}:${config.port}`;
    console.error(`❌ Failed to connect to MySQL database at ${target}:`, error.message);
    return false;
  }
};

export default pool;
