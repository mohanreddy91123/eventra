import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function alterEnum() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'eventra_db',
  });

  console.log('Connected to MySQL to update enum...');
  await connection.query(`
    ALTER TABLE events 
    MODIFY COLUMN status ENUM('PUBLISHED', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'PUBLISHED';
  `);
  console.log('✅ Alter table events completed: status column now includes PUBLISHED.');

  await connection.end();
}

alterEnum().catch(console.error);
