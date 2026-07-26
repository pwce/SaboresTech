import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as gastosController from '../controllers/gastos.controller.js';
import { verificarToken } from '../middlewares/verificarToken.middleware.js';
import { validarSchema } from '../middlewares/validador.middleware.js';
import gastoSchema from '../validations/gasto.validation.js';

const router = Router();

const uploadDir = path.join(process.cwd(), "src/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `gasto-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

router.get('/', verificarToken(['atendedor', 'dueña']), gastosController.obtenerGastos);
router.post('/', verificarToken(['atendedor', 'dueña']), upload.single('comprobante'), validarSchema(gastoSchema), gastosController.crearGasto);

// solo la dueña puede confirmar que un reembolso ya fue pagado
router.patch('/:id/reembolso', verificarToken(['dueña']), gastosController.marcarReembolsoHecho);

export default router;