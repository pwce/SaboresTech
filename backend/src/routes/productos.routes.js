import express from 'express';
import * as productosController from '../controllers/productos.controller.js';
import { validarSchema } from '../middlewares/validador.middleware.js';
import { verificarToken } from '../middlewares/verificarToken.middleware.js';
import productoSchema from '../validations/producto.validation.js';

const router = express.Router();

// GET /api/v1/productos para listar
router.get('/', productosController.obtenerProductos);

// POST /api/v1/productos para crear uno nuevo (solo atendedor o dueña)
router.post('/', verificarToken(['atendedor', 'dueña']), validarSchema(productoSchema), productosController.crearProducto);

// PUT /api/v1/productos/:id mpdificar un producto
router.put('/:id', verificarToken(['atendedor', 'dueña']), validarSchema(productoSchema), productosController.actualizarProducto);

// DELETE /api/v1/productos/:i eiminar un producto
router.delete('/:id', verificarToken(['atendedor', 'dueña']), productosController.eliminarProducto);

export default router;