import { ApiError } from '../middlewares/error.js';
import { contieneHtml, validarCamposPermitidos } from '../util/validacion.js';
import * as usuariosService from '../services/usuarios_service.js';

const TELEFONO_REGEX = /^\+?[0-9\s()-]{7,20}$/;

// GET /api/usuarios/me -> datos del usuario autenticado (sin contraseña)
export const obtenerMiPerfil = async (req, res) => {
  const perfil = await usuariosService.obtenerPerfil(req.usuario.id);
  if (!perfil) throw new ApiError(404, 'No se encontró tu cuenta');
  res.status(200).json({ ok: true, data: perfil });
};

// PUT /api/usuarios/me -> body: { nombre, telefono } (telefono puede ser vacío o null)
export const actualizarMiPerfil = async (req, res) => {
  validarCamposPermitidos(req.body, ['nombre', 'telefono']);
  const { nombre, telefono } = req.body;
  const errores = [];

  if (typeof nombre !== 'string' || nombre.trim() === '' || nombre.trim().length > 100)
    errores.push('nombre es obligatorio y no puede superar los 100 caracteres');
  else if (contieneHtml(nombre))
    errores.push('nombre no puede contener los caracteres < o >');

  const telefonoLimpio = typeof telefono === 'string' ? telefono.trim() : telefono;
  if (telefonoLimpio !== undefined && telefonoLimpio !== null && telefonoLimpio !== '') {
    if (typeof telefonoLimpio !== 'string' || !TELEFONO_REGEX.test(telefonoLimpio))
      errores.push('telefono no tiene un formato válido');
  }
  if (errores.length) throw new ApiError(400, 'Datos inválidos', errores);

  const perfil = await usuariosService.actualizarPerfil(req.usuario.id, {
    nombre: nombre.trim(),
    telefono: telefonoLimpio || null,
  });
  if (!perfil) throw new ApiError(404, 'No se encontró tu cuenta');
  res.status(200).json({ ok: true, message: 'Perfil actualizado', data: perfil });
};
