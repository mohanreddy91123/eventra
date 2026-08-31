import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { resolveDatabaseConfig } from '../config/database.js';

dotenv.config();

async function alterEnum() {
  const config = resolveDatabaseConfig();

  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: config.ssl,
  });

  console.log(`Connected to MySQL to update enum at ${config.host}:${config.port} as '${config.user}'...`);
  await connection.query(`
    ALTER TABLE events 
    MODIFY COLUMN status ENUM('PUBLISHED', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'PUBLISHED';
  `);
  console.log('✅ Alter table events completed: status column now includes PUBLISHED.');

  await connection.end();
}

alterEnum().catch(console.error);
