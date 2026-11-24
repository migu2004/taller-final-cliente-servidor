import pool, { getDbStatus } from '../config/db.js';

// Almacenamiento en memoria (Fallback para cumplimiento estricto del requisito de ejecución sin BD externa)
let turnosMemoria = [
  {
    id: 1,
    cliente: 'Carlos Méndez',
    placaVehiculo: 'ABC-123',
    tipoServicio: 'Alineación y Balanceo',
    fechaHora: '2026-11-25 08:30:00',
    precioBase: 80000.0,
    prioritario: false,
    porcentajeRecargo: 0.0,
    totalPagar: 80000.0,
    creadoEn: new Date().toISOString()
  },
  {
    id: 2,
    cliente: 'Laura Restrepo',
    placaVehiculo: 'XYZ-789',
    tipoServicio: 'Mantenimiento Preventivo 10K',
    fechaHora: '2026-11-25 10:00:00',
    precioBase: 150000.0,
    prioritario: true,
    porcentajeRecargo: 14.0,
    totalPagar: 171000.0,
    creadoEn: new Date().toISOString()
  }
];

let nextMemoryId = 3;

/**
 * Mapea una fila de PostgreSQL a formato camelCase de la API
 */
const mapRowToEntity = (row) => ({
  id: row.id,
  cliente: row.cliente,
  placaVehiculo: row.placa_vehiculo,
  tipoServicio: row.tipo_servicio,
  fechaHora: row.fecha_hora,
  precioBase: parseFloat(row.precio_base),
  prioritario: row.prioritario,
  porcentajeRecargo: parseFloat(row.porcentaje_recargo),
  totalPagar: parseFloat(row.total_pagar),
  creadoEn: row.creado_en
});

export const turnosRepository = {
  /**
   * Obtiene todos los turnos registrados
   */
  async findAll() {
    if (getDbStatus() && pool) {
      const result = await pool.query('SELECT * FROM turnos ORDER BY id ASC');
      return result.rows.map(mapRowToEntity);
    }
    return [...turnosMemoria];
  },

  /**
   * Busca un turno por su identificador numérico
   */
  async findById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;

    if (getDbStatus() && pool) {
      const result = await pool.query('SELECT * FROM turnos WHERE id = $1', [numericId]);
      if (result.rows.length === 0) return null;
      return mapRowToEntity(result.rows[0]);
    }

    const turno = turnosMemoria.find((t) => t.id === numericId);
    return turno ? { ...turno } : null;
  },

  /**
   * Inserta un nuevo turno
   */
  async create(data) {
    if (getDbStatus() && pool) {
      const query = `
        INSERT INTO turnos (
          cliente, placa_vehiculo, tipo_servicio, fecha_hora, 
          precio_base, prioritario, porcentaje_recargo, total_pagar
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      const values = [
        data.cliente,
        data.placaVehiculo,
        data.tipoServicio,
        data.fechaHora,
        data.precioBase,
        data.prioritario,
        data.porcentajeRecargo,
        data.totalPagar
      ];

      const result = await pool.query(query, values);
      return mapRowToEntity(result.rows[0]);
    }

    const nuevoTurno = {
      id: nextMemoryId++,
      cliente: data.cliente,
      placaVehiculo: data.placaVehiculo,
      tipoServicio: data.tipoServicio,
      fechaHora: data.fechaHora,
      precioBase: data.precioBase,
      prioritario: data.prioritario,
      porcentajeRecargo: data.porcentajeRecargo,
      totalPagar: data.totalPagar,
      creadoEn: new Date().toISOString()
    };

    turnosMemoria.push(nuevoTurno);
    return { ...nuevoTurno };
  }
};
