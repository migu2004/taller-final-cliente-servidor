import { turnosService } from '../services/turnos.service.js';

export const turnosController = {
  /**
   * GET /api/turnos
   * Retorna la lista completa de turnos (200 OK)
   */
  async getTurnos(req, res) {
    try {
      const turnos = await turnosService.listarTurnos();
      return res.status(200).json(turnos);
    } catch (error) {
      console.error('Error al listar turnos:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        mensaje: 'Ocurrió un error inesperado al consultar los turnos.'
      });
    }
  },

  /**
   * GET /api/turnos/:id
   * Retorna un turno por ID (200 OK) o 404 Not Found si no existe
   */
  async getTurnoById(req, res) {
    try {
      const { id } = req.params;
      const turno = await turnosService.obtenerTurnoPorId(id);

      if (!turno) {
        return res.status(404).json({
          error: 'Not Found',
          mensaje: `No se encontró ningún turno con el identificador '${id}'.`
        });
      }

      return res.status(200).json(turno);
    } catch (error) {
      console.error('Error al obtener turno por ID:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        mensaje: 'Ocurrió un error inesperado al consultar el turno.'
      });
    }
  },

  /**
   * POST /api/turnos
   * Crea un nuevo turno validando entradas y calculando tarifas (201 Created o 400 Bad Request)
   */
  async createTurno(req, res) {
    try {
      const { cliente, placaVehiculo, tipoServicio, fechaHora, precioBase, prioritario } = req.body;

      // 1. Validación de campos obligatorios
      const camposFaltantes = [];
      if (!cliente || typeof cliente !== 'string' || cliente.trim() === '') camposFaltantes.push('cliente');
      if (!placaVehiculo || typeof placaVehiculo !== 'string' || placaVehiculo.trim() === '') camposFaltantes.push('placaVehiculo');
      if (!tipoServicio || typeof tipoServicio !== 'string' || tipoServicio.trim() === '') camposFaltantes.push('tipoServicio');
      if (!fechaHora || typeof fechaHora !== 'string' || fechaHora.trim() === '') camposFaltantes.push('fechaHora');
      if (precioBase === undefined || precioBase === null) camposFaltantes.push('precioBase');
      if (prioritario === undefined || prioritario === null) camposFaltantes.push('prioritario');

      if (camposFaltantes.length > 0) {
        return res.status(400).json({
          error: 'Bad Request',
          mensaje: `Faltan campos obligatorios en la solicitud: ${camposFaltantes.join(', ')}.`
        });
      }

      // 2. Validación de valor numérico válido y mayor a cero (precioBase > 0)
      const precioBaseNum = Number(precioBase);
      if (isNaN(precioBaseNum) || precioBaseNum <= 0) {
        return res.status(400).json({
          error: 'Bad Request',
          mensaje: 'El campo precioBase debe ser un valor numérico estrictamente mayor a cero (precioBase > 0).'
        });
      }

      // 3. Validación de tipo para prioritario
      if (typeof prioritario !== 'boolean') {
        return res.status(400).json({
          error: 'Bad Request',
          mensaje: 'El campo prioritario debe ser un valor booleano (true o false).'
        });
      }

      // 4. Invocación de la capa de servicios para cálculos matemáticos y persistencia
      const nuevoTurno = await turnosService.crearTurno({
        cliente,
        placaVehiculo,
        tipoServicio,
        fechaHora,
        precioBase: precioBaseNum,
        prioritario
      });

      return res.status(201).json(nuevoTurno);
    } catch (error) {
      console.error('Error al crear turno:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        mensaje: 'Ocurrió un error inesperado al procesar el registro del turno.'
      });
    }
  }
};
