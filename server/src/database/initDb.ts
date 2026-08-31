import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createAdminConnection, getDatabaseConfig } from '../config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase() {
  console.log('🚀 Initializing Eventra Database...');

  const config = getDatabaseConfig();
  let connection;

  try {
    connection = await createAdminConnection();
    console.log('📡 Connected to MySQL Server successfully for schema initialization.');

    // If discrete database is configured, ensure it exists and select it
    if (config.database) {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await connection.query(`USE \`${config.database}\`;`);
      console.log(`📁 Database '${config.database}' ready.`);
    }

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
