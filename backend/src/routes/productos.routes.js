import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as productosController from '../controllers/productos.controller.js';
import { verificarToken } from '../middlewares/verificarToken.middleware.js';
import { validarSchema } from '../middlewares/validador.middleware.js';
import productoSchema from '../validations/producto.validation.js';

const router = Router();

const uploadDir = path.join(process.cwd(), "src/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `prod-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// GET /api/v1/productos para listar
router.get('/', productosController.obtenerProductos);

// POST /api/v1/productos para crear uno nuevo (solo atendedor o dueña)
router.post('/', verificarToken(['atendedor', 'dueña']), upload.single('imagen'), validarSchema(productoSchema), productosController.crearProducto);

// PUT /api/v1/productos/:id mpdificar un producto
router.put('/:id', verificarToken(['atendedor', 'dueña']), validarSchema(productoSchema), productosController.actualizarProducto);

// DELETE /api/v1/productos/:i eiminar un producto
router.delete('/:id', verificarToken(['atendedor', 'dueña']), productosController.eliminarProducto);

export default router;