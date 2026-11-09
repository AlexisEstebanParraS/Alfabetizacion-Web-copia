import { ApiError } from '../middlewares/error.js';
import { ROL_ADMIN } from '../middlewares/auth.js';
import { contieneHtml, validarCamposPermitidos } from '../util/validacion.js';
import { leerId, leerPaginacion } from '../util/parametros.js';
import * as modulosService from '../services/modulos_service.js';

const DIFICULTADES = ['Facil', 'Media', 'Alta'];
const ESTADOS = ['Habilitado', 'Borrador', 'Deshabilitado'];
const CAMPOS_EDITABLES = ['titulo', 'descripcion', 'dificultad', 'total_pasos', 'estado'];

const esAdministrador = (req) => req.usuario.rol_id === ROL_ADMIN;

const validarCuerpo = (body, completo) => {
  // Contrato de entrada: solo se aceptan los campos editables (no id, creado_por, etc.)
  validarCamposPermitidos(body, CAMPOS_EDITABLES);
  const errores = [];
  const { titulo, descripcion, dificultad, total_pasos, estado } = body;

  if (completo || titulo !== undefined) {
    if (typeof titulo !== 'string' || titulo.trim() === '' || titulo.length > 150)
      errores.push('titulo es obligatorio y no puede superar los 150 caracteres');
    else if (contieneHtml(titulo))
      errores.push('titulo no puede contener los caracteres < o >');
  }
  if (completo || descripcion !== undefined) {
    if (typeof descripcion !== 'string' || descripcion.trim() === '')
      errores.push('descripcion es obligatoria');
    else if (contieneHtml(descripcion))
      errores.push('descripcion no puede contener los caracteres < o >');
  }
  if (dificultad !== undefined && !DIFICULTADES.includes(dificultad))
    errores.push(`dificultad debe ser una de: ${DIFICULTADES.join(', ')}`);
  if (total_pasos !== undefined && (!Number.isInteger(total_pasos) || total_pasos <= 0))
    errores.push('total_pasos debe ser un entero mayor a 0');
  if (estado !== undefined && !ESTADOS.includes(estado))
    errores.push(`estado debe ser uno de: ${ESTADOS.join(', ')}`);

  if (errores.length > 0) throw new ApiError(400, 'Datos inválidos', errores);
};

// Valores con espacios recortados y valores por defecto (para POST y PUT)
const normalizarCompleto = (body) => ({
  titulo: body.titulo.trim(),
  descripcion: body.descripcion.trim(),
  dificultad: body.dificultad ?? 'Facil',
  total_pasos: body.total_pasos ?? 4,
  estado: body.estado ?? 'Habilitado',
});

// GET /api/modulos -> el ciudadano solo ve módulos habilitados; el admin ve todos
export const listarModulos = async (req, res) => {
  const { estado, dificultad } = req.query;

  if (estado !== undefined && !ESTADOS.includes(estado))
    throw new ApiError(400, `estado debe ser uno de: ${ESTADOS.join(', ')}`);
  if (dificultad !== undefined && !DIFICULTADES.includes(dificultad))
    throw new ApiError(400, `dificultad debe ser una de: ${DIFICULTADES.join(', ')}`);

  const paginacion = leerPaginacion(req.query);
  const { total, modulos } = await modulosService.listarModulos({
    soloHabilitados: !esAdministrador(req),
    estado,
    dificultad,
    paginacion,
  });

  res.status(200).json({
    ok: true,
    total,
    ...(paginacion && { page: paginacion.page, limit: paginacion.limit }),
    data: modulos,
  });
};

// GET /api/modulos/:id
export const obtenerModulo = async (req, res) => {
  const id = leerId(req.params.id);
  const modulo = await modulosService.obtenerModulo(id, !esAdministrador(req));
  if (!modulo) throw new ApiError(404, `No existe el módulo con id ${id}`);
  res.status(200).json({ ok: true, data: modulo });
};

// POST /api/modulos (admin) -> guarda qué administrador lo creó
export const crearModulo = async (req, res) => {
  const body = req.body;
  validarCuerpo(body, true);
  const modulo = await modulosService.crearModulo(normalizarCompleto(body), req.usuario.id);
  res.status(201).json({ ok: true, message: 'Módulo creado', data: modulo });
};

// PUT /api/modulos/:id (admin) -> reemplaza todos los campos editables
export const reemplazarModulo = async (req, res) => {
  const id = leerId(req.params.id);
  const body = req.body;
  validarCuerpo(body, true);
  const modulo = await modulosService.reemplazarModulo(id, normalizarCompleto(body));
  if (!modulo) throw new ApiError(404, `No existe el módulo con id ${id}`);
  res.status(200).json({ ok: true, message: 'Módulo actualizado', data: modulo });
};

// PATCH /api/modulos/:id (admin) -> solo cambia los campos enviados
export const modificarModulo = async (req, res) => {
  const id = leerId(req.params.id);
  const body = req.body;
  validarCuerpo(body, false);

  const campos = {};
  for (const c of CAMPOS_EDITABLES) {
    if (body[c] !== undefined) campos[c] = typeof body[c] === 'string' ? body[c].trim() : body[c];
  }
  if (Object.keys(campos).length === 0)
    throw new ApiError(400, `Debes enviar al menos un campo: ${CAMPOS_EDITABLES.join(', ')}`);

  const modulo = await modulosService.modificarModulo(id, campos);
  if (!modulo) throw new ApiError(404, `No existe el módulo con id ${id}`);
  res.status(200).json({ ok: true, message: 'Módulo modificado', data: modulo });
};

// DELETE /api/modulos/:id (admin) -> también borra el progreso asociado (ON DELETE CASCADE)
export const eliminarModulo = async (req, res) => {
  const id = leerId(req.params.id);
  const modulo = await modulosService.eliminarModulo(id);
  if (!modulo) throw new ApiError(404, `No existe el módulo con id ${id}`);
  res.status(200).json({ ok: true, message: 'Módulo eliminado', data: modulo });
};
