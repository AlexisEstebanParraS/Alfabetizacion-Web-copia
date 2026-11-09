import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApiError } from '../middlewares/error.js';
import { ROL_CIUDADANO } from '../middlewares/auth.js';
import { validarCamposPermitidos, validarLogin, validarRegistro } from '../util/validacion.js';
import { crearUsuario, buscarUsuarioActivoPorEmail } from '../services/auth_service.js';
import { enviarCorreoBienvenida } from '../services/correo_service.js';

const SALT_ROUNDS = 10;

// El secreto y la duración vienen del .env (sin valores por defecto inseguros)
const firmarToken = (usuario) => jwt.sign(
  { id: usuario.id, email: usuario.email, rol_id: usuario.rol_id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
);

// POST /api/auth/registro
export const registrarUsuario = async (req, res) => {
  validarCamposPermitidos(req.body, ['nombre', 'email', 'password', 'telefono']);
  const { nombre, email, password, telefono } = req.body;

  validarRegistro(nombre, email, password, telefono);

  // Hashear contraseña con bcrypt
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const nuevoUsuario = await crearUsuario({
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    telefono: telefono?.trim() || null,
    rolId: ROL_CIUDADANO,
  });

  // Servicio externo: no se espera la respuesta para no demorar el registro
  void enviarCorreoBienvenida(nuevoUsuario);

  res.status(201).json({
    ok: true,
    message: 'Usuario registrado con éxito',
    data: {
      usuario: nuevoUsuario,
      token: firmarToken(nuevoUsuario),
    },
  });
};

// POST /api/auth/login
export const iniciarSesion = async (req, res) => {
  validarCamposPermitidos(req.body, ['email', 'password']);
  const { email, password } = req.body;

  validarLogin(email, password);

  const usuario = await buscarUsuarioActivoPorEmail(email.trim().toLowerCase());

  // Mismo mensaje si el email no existe o la contraseña es incorrecta
  // (así no se revela qué correos están registrados)
  const esPasswordCorrecto = usuario && await bcrypt.compare(password, usuario.password_hash);
  if (!esPasswordCorrecto) {
    throw new ApiError(401, 'Credenciales inválidas (email o contraseña incorrectos)');
  }

  // Omitir el hash de la contraseña en la respuesta
  const { password_hash, ...datosUsuario } = usuario;

  res.status(200).json({
    ok: true,
    message: 'Inicio de sesión exitoso',
    data: {
      usuario: datosUsuario,
      token: firmarToken(usuario),
    },
  });
};
