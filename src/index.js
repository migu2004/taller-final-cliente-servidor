import express from 'express';
import cors from 'cors';
import { config } from './config/environment.js';
import { checkDbConnection } from './config/db.js';
import turnosRoutes from './routes/turnos.routes.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Endpoint informativo raíz
app.get('/', (req, res) => {
  res.status(200).json({
    proyecto: 'API REST de Gestión de Turnos - Taller Automotriz "MotorExpert Pro"',
    asignatura: 'Cliente-Servidor (CIAF 2026-2)',
    integrantes: [
      { nombre: 'Santiago García', ordenAlfabetico: 1 },
      { nombre: 'Miguel Zambrano', ordenAlfabetico: 2 }
    ],
    reglaNegocio: {
      parametroN: config.nParametro,
      formula: 'porcentajeRecargo = N * 2%',
      porcentajeRecargoAplicado: `${config.porcentajeRecargo}%`
    },
    endpoints: {
      listarTurnos: 'GET /api/turnos',
      obtenerTurno: 'GET /api/turnos/:id',
      crearTurno: 'POST /api/turnos'
    }
  });
});

// Conexión de rutas del módulo de turnos
app.use('/api/turnos', turnosRoutes);

// Manejador para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    mensaje: `La ruta '${req.method} ${req.originalUrl}' no existe en este servidor.`
  });
});

// Inicialización del servidor
const startServer = async () => {
  const dbAvailable = await checkDbConnection();

  app.listen(config.port, () => {
    console.log('====================================================');
    console.log('[INFO] API Taller Automotriz "MotorExpert Pro" iniciada correctamente');
    console.log(`[INFO] Servidor escuchando en: http://localhost:${config.port}`);
    console.log(`[CONFIG] Parametro N: ${config.nParametro} | Recargo prioritario: ${config.porcentajeRecargo}%`);
    if (dbAvailable) {
      console.log(`[DATABASE] Persistencia: PostgreSQL (Conectado a ${config.db.database})`);
    } else {
      console.log(`[DATABASE] Persistencia: Memoria local (Modo autonomo sin dependencias externas)`);
    }
    console.log('====================================================');
  });
};

startServer();

export default app;
