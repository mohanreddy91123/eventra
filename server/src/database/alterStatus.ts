import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function alterEnum() {
  const dbHost = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306', 10);
  const dbUser = process.env.DB_USER || process.env.MYSQLUSER || 'root';
  const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.MYSQLPASSWORD || '');
  const dbName = process.env.DB_NAME || process.env.MYSQLDATABASE || 'eventra_db';

  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  console.log(`Connected to MySQL to update enum at ${dbHost}:${dbPort}...`);
  await connection.query(`
    ALTER TABLE events 
    MODIFY COLUMN status ENUM('PUBLISHED', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'PUBLISHED';
  `);
  console.log('✅ Alter table events completed: status column now includes PUBLISHED.');

  await connection.end();
}

alterEnum().catch(console.error);
