import express from 'express';
import * as usuariosController from '../controllers/usuarios.controller.js';
import { validarSchema } from '../middlewares/validador.middleware.js';
import usuarioSchema from '../validations/usuario.validation.js';

const router = express.Router();

// GET /api/v1/usuarios
router.get('/', usuariosController.obtenerUsuarios);

// POST /api/v1/usuarios
router.post('/', validarSchema(usuarioSchema), usuariosController.crearUsuario);

export default router;