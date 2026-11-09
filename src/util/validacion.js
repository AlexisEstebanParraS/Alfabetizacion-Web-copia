import { ApiError } from '../middlewares/error.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordSpecialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
const caracteresNoPermitidosRegex = /[<>\u0000]/;

/**
 * Protección contra XSS: los textos que se muestran en pantalla
 * (nombres, títulos, descripciones) no pueden contener < ni >.
 * Tampoco se admite el carácter NUL (\u0000).
 */
const contieneHtml = (texto) => typeof texto === 'string' && caracteresNoPermitidosRegex.test(texto);

/**
 * Contrato de entrada: el cuerpo debe ser un objeto JSON y solo puede traer los campos permitidos.
 * La lista explícita limita lo que controla el cliente (por ejemplo, no puede enviar rol_id ni usuario_id).
 * Se valida en el servidor porque las peticiones pueden enviarse sin pasar por el frontend.
 */
const validarCamposPermitidos = (body, permitidos) => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ApiError(400, 'El cuerpo de la petición debe ser un objeto JSON.');
  }
  const noPermitidos = Object.keys(body).filter((campo) => !permitidos.includes(campo));
  if (noPermitidos.length > 0) {
    throw new ApiError(400, 'La petición incluye campos no permitidos', noPermitidos.map((campo) => `${campo} no está permitido`));
  }
};

const validarEmail = (email) => {
  if (typeof email !== 'string' || email.trim() === '') {
    throw new ApiError(400, 'El correo electrónico es obligatorio.');
  }
  if (email.trim().length > 150) {
    throw new ApiError(400, 'El correo electrónico no puede superar los 150 caracteres.');
  }
  if (!emailRegex.test(email.trim())) {
    throw new ApiError(400, 'El correo electrónico no es válido.');
  }
};

const validarPassword = (password) => {
  if (typeof password !== 'string' || password.trim() === '') {
    throw new ApiError(400, 'La contraseña es obligatoria.');
  }
  if (password.length < 8) {
    throw new ApiError(400, 'La contraseña debe tener al menos 8 caracteres.');
  }
  if (!/[a-z]/.test(password)) {
    throw new ApiError(400, 'La contraseña debe contener al menos una letra minúscula.');
  }
  if (!/[A-Z]/.test(password)) {
    throw new ApiError(400, 'La contraseña debe contener al menos una letra mayúscula.');
  }
  if (!/[0-9]/.test(password)) {
    throw new ApiError(400, 'La contraseña debe contener al menos un número.');
  }
  if (!passwordSpecialCharRegex.test(password)) {
    throw new ApiError(400, 'La contraseña debe contener al menos un carácter especial.');
  }
};

const validarLogin = (email, password) => {
  if (typeof email !== 'string' || email.trim() === '') {
    throw new ApiError(400, 'El correo electrónico es obligatorio.');
  }
  if (typeof password !== 'string' || password.trim() === '') {
    throw new ApiError(400, 'La contraseña es obligatoria.');
  }
  if (!emailRegex.test(email.trim())) {
    throw new ApiError(400, 'El correo electrónico no es válido.');
  }
};

const validarRegistro = (nombre, email, password, telefono) => {
  if (typeof nombre !== 'string' || nombre.trim() === '') {
    throw new ApiError(400, 'El nombre es obligatorio.');
  }
  if (nombre.trim().length > 100) {
    throw new ApiError(400, 'El nombre no puede superar los 100 caracteres.');
  }
  if (contieneHtml(nombre)) {
    throw new ApiError(400, 'El nombre no puede contener los caracteres < o >.');
  }

  validarEmail(email);
  validarPassword(password);

  if (telefono != null && telefono !== '') {
    if (typeof telefono !== 'string' || !/^\+?[0-9\s()-]{7,20}$/.test(telefono.trim())) {
      throw new ApiError(400, 'El teléfono no tiene un formato válido.');
    }
  }
};

export { contieneHtml, validarCamposPermitidos, validarEmail, validarPassword, validarLogin, validarRegistro };
