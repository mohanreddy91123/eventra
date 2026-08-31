import dotenv from 'dotenv';
import { pool } from '../config/database.js';

dotenv.config();

async function alterEnum() {
  console.log('Updating events status enum...');
  await pool.query(`
    ALTER TABLE events 
    MODIFY COLUMN status ENUM('PUBLISHED', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'PUBLISHED';
  `);
  console.log('✅ Alter table events completed: status column now includes PUBLISHED.');
  process.exit(0);
}

alterEnum().catch((err) => {
  console.error('Alter status error:', err.message);
  process.exit(1);
});
