import { Router } from 'express';
import { obtenerMiPerfil, actualizarMiPerfil } from '../controllers/usuarios_control.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

// Perfil propio: cualquier usuario autenticado
router.use(verificarToken);

router.get('/me', obtenerMiPerfil);
router.put('/me', actualizarMiPerfil);

export default router;
