import { Router } from 'express';
import {
  listarModulos, obtenerModulo, crearModulo,
  reemplazarModulo, modificarModulo, eliminarModulo,
} from '../controllers/modulos_control.js';
import { verificarToken, esAdmin } from '../middlewares/auth.js';

const router = Router();

// Todas las rutas requieren sesión
router.use(verificarToken);

// Lectura: cualquier usuario autenticado (el ciudadano solo ve módulos habilitados)
router.get('/', listarModulos);
router.get('/:id', obtenerModulo);

// Escritura: solo administradores
router.post('/', esAdmin, crearModulo);
router.put('/:id', esAdmin, reemplazarModulo);
router.patch('/:id', esAdmin, modificarModulo);
router.delete('/:id', esAdmin, eliminarModulo);

export default router;
