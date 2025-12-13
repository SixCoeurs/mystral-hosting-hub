import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Pool de connexions pour de meilleures performances
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'mystral',

  // Configuration du pool
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  // Configuration charset
  charset: 'utf8mb4',

  // Timezone
  timezone: '+00:00',

  // Convertir les dates en objets Date JavaScript
  dateStrings: false,

  // Support des BigInt
  supportBigNumbers: true,
  bigNumberStrings: false
});

// Test de connexion
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion à MariaDB réussie');

    // Vérifier que la base de données existe
    const [rows] = await connection.query('SELECT DATABASE() as db');
    console.log(`📦 Base de données: ${rows[0].db}`);

    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à MariaDB:', error.message);
    return false;
  }
}

// Helper pour exécuter des requêtes
export async function query(sql, params = []) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// Helper pour les transactions
export async function transaction(callback) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Helper pour récupérer une seule ligne
export async function queryOne(sql, params = []) {
  const results = await query(sql, params);
  return results[0] || null;
}

// Helper pour insérer et récupérer l'ID
export async function insert(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result.insertId;
}

export default pool;
