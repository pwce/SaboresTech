import { Router } from 'express';
import * as reportesController from '../controllers/reportes.controller.js';
import { verificarToken } from '../middlewares/verificarToken.middleware.js';

const router = Router();

// GET /api/v1/reportes/jornada/:jornada_id  ventas por método de pago y por producto de una jornada
router.get('/jornada/:jornada_id', verificarToken(['atendedor', 'dueña']), reportesController.obtenerReporteJornada);

// GET /api/v1/reportes/resumen?tipo=semanal|mensual resumen agrupado de todas las jornadas
router.get('/resumen', verificarToken(['atendedor', 'dueña']), reportesController.obtenerResumenPeriodo);

export default router;
