import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'mystral',
  password: process.env.DB_PASSWORD || 'mystral123',
  database: process.env.DB_NAME || 'mystral',
  connectionLimit: 10,
  acquireTimeout: 30000,
  connectTimeout: 10000,
});

// Test connection on startup
export async function testConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('✅ Connected to MariaDB database');
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  } finally {
    if (conn) conn.release();
  }
}

// Query helper with automatic connection handling
export async function query(sql, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(sql, params);
    return result;
  } finally {
    if (conn) conn.release();
  }
}

// Transaction helper
export async function transaction(callback) {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

export default pool;
