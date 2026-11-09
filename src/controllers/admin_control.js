import { ApiError } from '../middlewares/error.js';
import { validarCamposPermitidos } from '../util/validacion.js';
import { ROL_ADMIN, ROL_CIUDADANO } from '../middlewares/auth.js';
import { leerId, leerPaginacion } from '../util/parametros.js';
import * as adminService from '../services/admin_service.js';

// Sin try/catch: Express 5 envía los errores al errorHandler,
// así todas las respuestas de error tienen el mismo formato.

// GET /api/admin/usuarios
export const obtenerUsuarios = async (req, res) => {
  const paginacion = leerPaginacion(req.query);
  const { total, usuarios } = await adminService.listarUsuarios(paginacion);
  res.status(200).json({
    ok: true,
    message: 'Usuarios obtenidos con éxito',
    total,
    ...(paginacion && { page: paginacion.page, limit: paginacion.limit }),
    data: usuarios,
  });
};

// PATCH /api/admin/usuarios/:id -> activar/desactivar o cambiar rol
export const actualizarUsuario = async (req, res) => {
  const id = leerId(req.params.id);
  validarCamposPermitidos(req.body, ['activo', 'rol_id']);
  const { activo, rol_id } = req.body;

  if (id === req.usuario.id)
    throw new ApiError(400, 'No puedes desactivar ni cambiar el rol de tu propia cuenta');

  const errores = [];
  const campos = {};
  if (activo !== undefined) {
    if (typeof activo !== 'boolean') errores.push('activo debe ser true o false');
    else campos.activo = activo;
  }
  if (rol_id !== undefined) {
    if (![ROL_CIUDADANO, ROL_ADMIN].includes(rol_id)) errores.push(`rol_id debe ser ${ROL_CIUDADANO} o ${ROL_ADMIN}`);
    else campos.rol_id = rol_id;
  }
  if (errores.length) throw new ApiError(400, 'Datos inválidos', errores);
  if (Object.keys(campos).length === 0)
    throw new ApiError(400, 'Debes enviar al menos un campo: activo, rol_id');

  const usuario = await adminService.actualizarUsuario(id, campos);
  if (!usuario) throw new ApiError(404, `No existe el usuario con id ${id}`);
  res.status(200).json({ ok: true, message: 'Usuario actualizado', data: usuario });
};

// GET /api/admin/metricas
export const obtenerMetricas = async (req, res) => {
  const metricas = await adminService.obtenerMetricas();
  res.status(200).json({ ok: true, data: metricas });
};
