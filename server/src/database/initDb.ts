import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export async function initDatabase() {
  console.log('🚀 Initializing Eventra Database...');

  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'eventra_db';

  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true,
    });

    console.log(`📡 Connected to MySQL Server on ${dbHost}:${dbPort}`);

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`📁 Database '${dbName}' verified/created.`);

    await connection.query(`USE \`${dbName}\`;`);

    // Read and run schema.sql
    const schemaPath = path.join(process.cwd(), 'src', 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      await connection.query(sql);
      console.log('✅ Database schema applied successfully.');
    } else {
      console.warn('⚠️ schema.sql file not found at:', schemaPath);
    }
  } catch (error: any) {
    console.error('❌ Database initialization error:', error.message);
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
