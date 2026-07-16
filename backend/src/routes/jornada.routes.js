// jornada.routes.js
import { Router } from 'express';
import * as jornadaController from '../controllers/jornada.controller.js';
import { verificarToken } from '../middlewares/verificarToken.middleware.js';

const router = Router();

router.get('/activa', jornadaController.obtenerJornadaActiva);
router.get('/', verificarToken(['atendedor', 'dueña']), jornadaController.obtenerJornadas);

router.post('/abrir', verificarToken(['atendedor', 'dueña']), jornadaController.guardarJornada);
router.post('/cerrar', verificarToken(['atendedor', 'dueña']), jornadaController.finalizarJornada);

router.patch('/actualizar-insumos', verificarToken(['atendedor', 'dueña']), jornadaController.actualizarInsumosJornada);

export default router;