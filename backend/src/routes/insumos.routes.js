// insumos.routes.js
import express from 'express';
import * as insumosController from '../controllers/insumos.controller.js';
import { validarSchema } from '../middlewares/validador.middleware.js';
import { verificarToken } from '../middlewares/verificarToken.middleware.js';
import insumoSchema from '../validations/insumo.validation.js';

const router = express.Router();

router.get('/', insumosController.obtenerInsumos);
router.post('/', verificarToken(['atendedor', 'dueña']), validarSchema(insumoSchema), insumosController.crearInsumo);
router.put('/:id', verificarToken(['atendedor', 'dueña']), validarSchema(insumoSchema), insumosController.actualizarInsumo);
router.delete('/:id', verificarToken(['atendedor', 'dueña']), insumosController.eliminarInsumo);

export default router;