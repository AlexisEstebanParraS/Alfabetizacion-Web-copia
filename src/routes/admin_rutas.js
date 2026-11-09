import { Router } from 'express';
import { obtenerUsuarios, actualizarUsuario, obtenerMetricas } from '../controllers/admin_control.js';
import { verificarToken, esAdmin } from '../middlewares/auth.js';

const router = Router();

// Todo el panel administrativo requiere sesión y rol admin
router.use(verificarToken, esAdmin);

router.get('/usuarios', obtenerUsuarios);
router.patch('/usuarios/:id', actualizarUsuario);
router.get('/metricas', obtenerMetricas);

export default router;
