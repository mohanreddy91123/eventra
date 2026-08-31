import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export interface ResolvedDbConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  ssl?: { rejectUnauthorized: boolean };
}

/**
 * Resolves database configuration with strict priority:
 * 1. Railway / Cloud connection string (MYSQL_URL, DATABASE_URL, DATABASE_PRIVATE_URL)
 * 2. Railway discrete variables (MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE)
 * 3. Custom / Local variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
 * 4. Local development fallbacks
 */
export function resolveDatabaseConfig(): ResolvedDbConfig {
  const connectionUrl =
    process.env.MYSQL_URL ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_PRIVATE_URL ||
    process.env.MYSQL_PRIVATE_URL;

  // Priority 1: Full connection URL string
  if (connectionUrl && (connectionUrl.startsWith('mysql://') || connectionUrl.startsWith('mysql2://'))) {
    try {
      const parsed = new URL(connectionUrl.replace(/^mysql2:\/\//, 'mysql://'));
      const host = parsed.hostname;
      const port = parsed.port ? parseInt(parsed.port, 10) : 3306;
      const user = parsed.username ? decodeURIComponent(parsed.username) : undefined;
      const password = parsed.password ? decodeURIComponent(parsed.password) : undefined;
      const database = parsed.pathname ? parsed.pathname.replace(/^\//, '') : undefined;

      if (host && user !== undefined) {
        return {
          host,
          port,
          user,
          password: password !== undefined ? password : '',
          database: database || 'railway',
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        };
      }
    } catch (err: any) {
      console.warn('⚠️ Could not parse MySQL connection URL, falling back to discrete variables:', err.message);
    }
  }

  // Priority 2: Railway discrete environment variables
  if (process.env.MYSQLHOST) {
    return {
      host: process.env.MYSQLHOST,
      port: parseInt(process.env.MYSQLPORT || '3306', 10),
      user: process.env.MYSQLUSER || 'root',
      password: process.env.MYSQLPASSWORD !== undefined ? process.env.MYSQLPASSWORD : '',
      database: process.env.MYSQLDATABASE || 'railway',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    };
  }

  // Priority 3: Custom / Local DB_* variables
  if (process.env.DB_HOST) {
    return {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
      database: process.env.DB_NAME || 'eventra_db',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    };
  }

  // Priority 4: Local development fallback
  return {
    host: 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: 'root',
    password: '',
    database: 'eventra_db',
    ssl: undefined,
  };
}

const resolvedConfig = resolveDatabaseConfig();

const dbConfig: mysql.PoolOptions = {
  host: resolvedConfig.host,
  port: resolvedConfig.port,
  user: resolvedConfig.user,
  password: resolvedConfig.password,
  database: resolvedConfig.database,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  timezone: '+00:00',
  dateStrings: true,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: resolvedConfig.ssl,
};

export const pool = mysql.createPool(dbConfig);

// Helper for single connection without selecting database (used during database creation/init)
export const createAdminConnection = async () => {
  return await mysql.createConnection({
    host: resolvedConfig.host,
    port: resolvedConfig.port,
    user: resolvedConfig.user,
    password: resolvedConfig.password,
    ssl: resolvedConfig.ssl,
  });
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Connected to MySQL Database: ${resolvedConfig.database} (${resolvedConfig.host}:${resolvedConfig.port}) as user: ${resolvedConfig.user}`);
    connection.release();
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to connect to MySQL database at ${resolvedConfig.host}:${resolvedConfig.port} as user '${resolvedConfig.user}':`, error.message);
    return false;
  }
};

export default pool;
