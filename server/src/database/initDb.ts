import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { resolveDatabaseConfig } from '../config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase() {
  console.log('🚀 Initializing Eventra Database...');

  const config = resolveDatabaseConfig();

  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      multipleStatements: true,
      ssl: config.ssl,
    });

    console.log(`📡 Connected to MySQL Server on ${config.host}:${config.port} as '${config.user}'`);

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`📁 Database '${config.database}' verified/created.`);

    await connection.query(`USE \`${config.database}\`;`);

    // Locate schema.sql reliably
    let schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      schemaPath = path.join(process.cwd(), 'src', 'database', 'schema.sql');
    }

    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      await connection.query(sql);
      console.log('✅ Database schema applied successfully.');
    } else {
      console.warn('⚠️ schema.sql file not found at:', schemaPath);
    }
  } catch (error: any) {
    console.error(`❌ Database initialization error on ${config.host}:${config.port} as '${config.user}':`, error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Auto-run if executed directly
if (process.argv[1]?.includes('initDb')) {
  initDatabase()
    .then(() => {
      console.log('✨ Database init finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal database error:', err);
      process.exit(1);
    });
}
