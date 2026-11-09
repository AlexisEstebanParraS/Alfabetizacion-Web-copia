import { ApiError } from '../middlewares/error.js';
import { ROL_ADMIN } from '../middlewares/auth.js';
import { leerId } from '../util/parametros.js';
import { validarCamposPermitidos } from '../util/validacion.js';
import * as progresoService from '../services/progreso_service.js';

const CAMPOS_EDITABLES = ['paso_actual', 'completado', 'errores_cometidos', 'tiempo_segundos'];

/**
 * Dueño del recurso: el ciudadano solo puede tocar SU progreso (el id sale del token,
 * nunca del body). El administrador ve todo (null = sin restricción).
 */
const duenoPermitido = (req) => (req.usuario.rol_id === ROL_ADMIN ? null : req.usuario.id);

/**
 * Autorización sobre el recurso: un token válido no permite acceder a cualquier progreso.
 * 404 si el progreso no existe; 403 si existe pero pertenece a otro usuario.
 */
const buscarProgresoAutorizado = async (req, id) => {
  const progreso = await progresoService.obtenerProgreso(id, null);
  if (!progreso) throw new ApiError(404, `No existe el progreso con id ${id}`);
  if (req.usuario.rol_id !== ROL_ADMIN && progreso.usuario_id !== req.usuario.id) {
    throw new ApiError(403, 'No puedes acceder al progreso de otro usuario');
  }
  return progreso;
};

// GET /api/progreso -> ciudadano: solo el suyo | admin: todos o ?usuario_id=
export const listarProgreso = async (req, res) => {
  let usuarioId = duenoPermitido(req);
  if (usuarioId === null && req.query.usuario_id !== undefined) {
    usuarioId = leerId(req.query.usuario_id, 'usuario_id');
  }
  const progresos = await progresoService.listarProgreso(usuarioId);
  res.status(200).json({ ok: true, total: progresos.length, data: progresos });
};

// GET /api/progreso/:id -> 403 si es de otro usuario
export const obtenerProgreso = async (req, res) => {
  const id = leerId(req.params.id);
  const progreso = await buscarProgresoAutorizado(req, id);
  res.status(200).json({ ok: true, data: progreso });
};

// POST /api/progreso -> body: { modulo_id }. El usuario sale del token:
// si el cliente envía usuario_id, se rechaza con 400 (campo no permitido).
export const iniciarProgreso = async (req, res) => {
  validarCamposPermitidos(req.body, ['modulo_id']);
  const moduloId = leerId(req.body.modulo_id, 'modulo_id');

  if (!(await progresoService.moduloHabilitado(moduloId))) {
    throw new ApiError(404, `No existe un módulo habilitado con id ${moduloId}`);
  }

  // Si ya lo había iniciado, la restricción UNIQUE hace que el errorHandler responda 409
  const progreso = await progresoService.crearProgreso(req.usuario.id, moduloId);
  res.status(201).json({ ok: true, message: 'Progreso iniciado', data: progreso });
};

// PATCH /api/progreso/:id
export const actualizarProgreso = async (req, res) => {
  const id = leerId(req.params.id);
  validarCamposPermitidos(req.body, CAMPOS_EDITABLES);
  const body = req.body;
  const errores = [];

  if (body.paso_actual !== undefined && (!Number.isInteger(body.paso_actual) || body.paso_actual < 1))
    errores.push('paso_actual debe ser un entero >= 1');
  if (body.completado !== undefined && typeof body.completado !== 'boolean')
    errores.push('completado debe ser true o false');
  for (const c of ['errores_cometidos', 'tiempo_segundos']) {
    if (body[c] !== undefined && (!Number.isInteger(body[c]) || body[c] < 0))
      errores.push(`${c} debe ser un entero >= 0`);
  }
  if (errores.length) throw new ApiError(400, 'Datos inválidos', errores);

  const campos = {};
  for (const c of CAMPOS_EDITABLES) if (body[c] !== undefined) campos[c] = body[c];
  if (Object.keys(campos).length === 0)
    throw new ApiError(400, `Debes enviar al menos un campo: ${CAMPOS_EDITABLES.join(', ')}`);

  const dueno = duenoPermitido(req);
  const actual = await buscarProgresoAutorizado(req, id);

  // El paso no puede superar la cantidad de pasos del módulo
  if (campos.paso_actual !== undefined && campos.paso_actual > actual.total_pasos) {
    throw new ApiError(400, `paso_actual no puede ser mayor que ${actual.total_pasos} (total de pasos del módulo)`);
  }

  const progreso = await progresoService.actualizarProgreso(id, dueno, campos);
  if (!progreso) throw new ApiError(404, `No existe el progreso con id ${id}`);
  res.status(200).json({ ok: true, message: 'Progreso actualizado', data: progreso });
};

// DELETE /api/progreso/:id
export const eliminarProgreso = async (req, res) => {
  const id = leerId(req.params.id);
  await buscarProgresoAutorizado(req, id);
  const progreso = await progresoService.eliminarProgreso(id, duenoPermitido(req));
  if (!progreso) throw new ApiError(404, `No existe el progreso con id ${id}`);
  res.status(200).json({ ok: true, message: 'Progreso eliminado', data: progreso });
};
