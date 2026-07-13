import { Router } from 'express';
import { loginPorPin } from '../controllers/auth.controller.js';

const router = Router();

// POST /api/v1/auth/pin
router.post('/login', loginPorPin);

export default router;