import jwt from 'jsonwebtoken';
import { ApiError } from './error.js';

// Roles según database.sql
export const ROL_CIUDADANO = 1;
export const ROL_ADMIN = 2;

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ ERROR CRÍTICO: JWT_SECRET no está definido en el archivo .env');
  process.exit(1); // Detiene el servidor si no hay clave secreta
}

/**
 * Verifica que la petición traiga "Authorization: Bearer <token>" con un JWT válido.
 * 401 = no autenticado (falta el token, es inválido o expiró).
 */
export const verificarToken = (req, res, next) => {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Acceso denegado: No se proporcionó un token de autenticación'));
  }

  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(new ApiError(401, 'Token inválido o expirado'));
  }
};

/**
 * Restringe una ruta a administradores.
 * 403 = autenticado, pero sin permiso.
 */
export const esAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol_id !== ROL_ADMIN) {
    return next(new ApiError(403, 'Acceso denegado: Se requieren permisos de administrador'));
  }
  next();
};
