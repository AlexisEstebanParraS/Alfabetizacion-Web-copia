import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { registrarUsuario, iniciarSesion } from '../controllers/auth_control.js';

const router = Router();

// Rate limiting: hasta 10 solicitudes de login por IP cada 15 minutos.
// Al superar el límite se responde 429 Too Many Requests (protección contra fuerza bruta).
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { ok: false, error: { mensaje: 'Demasiados intentos. Intenta nuevamente en 15 minutos.' } },
});

// Rutas públicas de autenticación
router.post('/registro', registrarUsuario);
router.post('/login', limiteLogin, iniciarSesion);

export default router;
