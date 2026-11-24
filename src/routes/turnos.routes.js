import { Router } from 'express';
import { turnosController } from '../controllers/turnos.controller.js';

const router = Router();

// GET /api/turnos - Retorna la lista completa de turnos (200 OK)
router.get('/', turnosController.getTurnos);

// GET /api/turnos/:id - Retorna un turno por ID (200 OK) o 404 Not Found
router.get('/:id', turnosController.getTurnoById);

// POST /api/turnos - Registra un nuevo turno con cálculo de tarifa (201 Created o 400 Bad Request)
router.post('/', turnosController.createTurno);

export default router;
