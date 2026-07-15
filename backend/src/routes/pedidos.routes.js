// pedidos.routes.js
import express from 'express';
import * as pedidosController from '../controllers/pedidos.controller.js';
import { validarSchema } from '../middlewares/validador.middleware.js';
import { verificarToken } from '../middlewares/verificarToken.middleware.js';
import pedidoSchema from '../validations/pedido.validation.js';

const router = express.Router();

// obtener pedidos: solo permitido para caja/dueña
router.get('/', verificarToken(['atendedor', 'dueña']), pedidosController.obtenerPedidos);

// crear pedido desde la tablet de autoservicio
router.post('/', validarSchema(pedidoSchema), pedidosController.crearPedido);

// cambiar estado: el endpoint original '/:id/estado', protegido para que solo lo mueva el personal
router.put('/:id/estado', verificarToken(['atendedor', 'dueña']), pedidosController.cambiarEstadoPedido); 

export default router;