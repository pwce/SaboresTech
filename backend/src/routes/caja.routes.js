import { Router } from 'express';
import * as cajaController from '../controllers/caja.controller.js';
import { verificarToken } from '../middlewares/verificarToken.middleware.js';
import { validarSchema } from '../middlewares/validador.middleware.js';
import { abrirCajaSchema, cerrarCajaSchema } from '../validations/caja.validation.js';

const router = Router();

router.get('/', verificarToken(['dueña']), cajaController.obtenerCajaPorJornada);
router.get('/historial', verificarToken(['dueña']), cajaController.obtenerHistorialCajas);
router.post('/abrir', verificarToken(['dueña']), validarSchema(abrirCajaSchema), cajaController.abrirCaja);
router.patch('/:id/cerrar', verificarToken(['dueña']), validarSchema(cerrarCajaSchema), cajaController.cerrarCaja);

export default router;