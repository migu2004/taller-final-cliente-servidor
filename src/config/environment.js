import dotenv from 'dotenv';
dotenv.config();

// Parámetro N: Número de lista del primer integrante por orden alfabético de apellido (García, Santiago)
const N = parseInt(process.env.N_PARAMETRO, 10) || 7;

// Regla de Negocio: porcentajeRecargo = N * 2%
const porcentajeRecargo = N * 2;

export const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nParametro: N,
  porcentajeRecargo: porcentajeRecargo,
  storageType: process.env.STORAGE_TYPE || 'postgres',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'taller_turnos',
  }
};
