import { config } from '../config/environment.js';
import { turnosRepository } from '../repositories/turnos.repository.js';

export const turnosService = {
  /**
   * Obtiene la lista completa de turnos registrados
   */
  async listarTurnos() {
    return await turnosRepository.findAll();
  },

  /**
   * Obtiene un turno específico por su ID
   * @param {string|number} id 
   */
  async obtenerTurnoPorId(id) {
    return await turnosRepository.findById(id);
  },

  /**
   * Aplica la regla de negocio parametrizada por N y registra un nuevo turno
   * @param {Object} datosTurno 
   */
  async crearTurno(datosTurno) {
    const { cliente, placaVehiculo, tipoServicio, fechaHora, precioBase, prioritario } = datosTurno;
    const precioBaseNum = parseFloat(precioBase);
    const esPrioritario = Boolean(prioritario);

    // Regla de Negocio Parametrizada:
    // porcentajeRecargo = N * 2%
    const porcentajeRecargo = esPrioritario ? config.porcentajeRecargo : 0.0;

    // Cálculo matemático de la tarifa total:
    // Si prioritario: totalPagar = precioBase + (precioBase * porcentajeRecargo / 100)
    // Si no: totalPagar = precioBase
    let totalPagar = precioBaseNum;
    if (esPrioritario) {
      const recargoMonto = (precioBaseNum * config.porcentajeRecargo) / 100;
      totalPagar = precioBaseNum + recargoMonto;
    }

    // Redondear a 2 decimales para precisión contable
    totalPagar = Math.round(totalPagar * 100) / 100;

    const nuevoTurnoData = {
      cliente: cliente.trim(),
      placaVehiculo: placaVehiculo.trim().toUpperCase(),
      tipoServicio: tipoServicio.trim(),
      fechaHora: fechaHora.trim(),
      precioBase: precioBaseNum,
      prioritario: esPrioritario,
      porcentajeRecargo: porcentajeRecargo,
      totalPagar: totalPagar
    };

    return await turnosRepository.create(nuevoTurnoData);
  }
};
