import pkg from 'pg';
const { Pool } = pkg;
import { config } from './environment.js';

let pool = null;
let isDbConnected = false;

if (config.storageType === 'postgres') {
  pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    connectionTimeoutMillis: 3000,
  });

  // Manejo de errores imprevistos en clientes inactivos del pool
  pool.on('error', (err) => {
    console.error('[ERROR] [PostgreSQL] Error inesperado en el pool de conexiones:', err.message);
  });
}

/**
 * Verifica la disponibilidad de la base de datos PostgreSQL.
 * @returns {Promise<boolean>} true si la conexión es exitosa, false de lo contrario.
 */
export const checkDbConnection = async () => {
  if (!pool || config.storageType === 'memory') {
    isDbConnected = false;
    return false;
  }

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isDbConnected = true;
    return true;
  } catch (error) {
    isDbConnected = false;
    return false;
  }
};

export const getDbStatus = () => isDbConnected;

export default pool;
