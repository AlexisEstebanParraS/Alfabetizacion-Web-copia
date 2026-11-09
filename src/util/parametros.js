import { ApiError } from '../middlewares/error.js';

/** Lee un id (de la URL, query o body) y exige un entero positivo. */
export const leerId = (valor, nombre = 'id') => {
  const id = Number(valor);
  if (typeof valor === 'boolean' || valor === '' || !Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, `${nombre} debe ser un número entero positivo`);
  }
  return id;
};

const LIMITE_MAXIMO = 100;

/**
 * Paginación opcional con query params: ?page=1&limit=10.
 * La query no identifica un recurso: cambia la forma de consultar la colección.
 * Llegan como texto, así que se convierten con Number() y se valida el rango.
 * Si no se envía ninguno de los dos, devuelve null y se listan todos los registros.
 */
export const leerPaginacion = (query = {}) => {
  if (query.page === undefined && query.limit === undefined) return null;

  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);

  if (!Number.isInteger(page) || page < 1) {
    throw new ApiError(400, 'page debe ser un entero mayor o igual a 1');
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > LIMITE_MAXIMO) {
    throw new ApiError(400, `limit debe ser un entero entre 1 y ${LIMITE_MAXIMO}`);
  }
  return { page, limit, offset: (page - 1) * limit };
};
