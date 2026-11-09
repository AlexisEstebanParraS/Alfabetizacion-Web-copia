import { pool } from '../config/db.js';
import { ROL_CIUDADANO } from '../middlewares/auth.js';

const COLUMNAS_USUARIO = 'u.id, u.nombre, u.email, u.telefono, u.creado_en, u.activo, u.rol_id, r.nombre AS rol';

export const listarUsuarios = async (paginacion) => {
  const conteo = await pool.query('SELECT COUNT(*) AS total FROM usuarios');

  const valores = [];
  let limite = '';
  if (paginacion) {
    valores.push(paginacion.limit, paginacion.offset);
    limite = 'LIMIT $1 OFFSET $2';
  }
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS_USUARIO}
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
      ORDER BY u.creado_en DESC ${limite}`,
    valores
  );
  return { total: Number(conteo.rows[0].total), usuarios: rows };
};

/** campos: { activo?, rol_id? } ya validados. */
export const actualizarUsuario = async (id, campos) => {
  const columnas = Object.keys(campos);
  const sets = columnas.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE usuarios SET ${sets} WHERE id = $${columnas.length + 1}
     RETURNING id, nombre, email, telefono, creado_en, activo, rol_id`,
    [...Object.values(campos), id]
  );
  return rows[0] ?? null;
};

/** Métricas del panel: las mismas consultas de la versión anterior, ahora en la capa de servicios. */
export const obtenerMetricas = async () => {
  // 1. Resumen general
  const usuariosRes = await pool.query('SELECT COUNT(*) FROM usuarios WHERE rol_id = $1', [ROL_CIUDADANO]);
  const sesionesRes = await pool.query(`
    SELECT COUNT(*) AS total,
           AVG(tiempo_segundos) AS tiempo,
           SUM(CASE WHEN errores_cometidos > 0 THEN 1 ELSE 0 END) AS con_errores,
           SUM(CASE WHEN completado = false THEN 1 ELSE 0 END) AS abandonos
      FROM progreso_usuarios
  `);

  const porcentaje = (parte, total) => (total > 0 ? Math.round((parte / total) * 100) : 0);
  const totalSesiones = parseInt(sesionesRes.rows[0].total) || 0;
  const resumen = {
    usuarios: parseInt(usuariosRes.rows[0].count) || 0,
    sesiones: totalSesiones,
    tiempo_promedio: parseInt(sesionesRes.rows[0].tiempo) || 0,
    tasa_error: porcentaje(parseInt(sesionesRes.rows[0].con_errores) || 0, totalSesiones),
    tasa_abandono: porcentaje(parseInt(sesionesRes.rows[0].abandonos) || 0, totalSesiones),
  };

  // 2. Desempeño por módulo
  const modulosRes = await pool.query(`
    SELECT m.id, m.titulo, m.total_pasos,
           COUNT(p.id) AS sesiones,
           SUM(CASE WHEN p.completado = true THEN 1 ELSE 0 END) AS completadas,
           SUM(CASE WHEN p.errores_cometidos > 0 THEN 1 ELSE 0 END) AS con_errores
      FROM modulos_tutoriales m
      LEFT JOIN progreso_usuarios p ON m.id = p.modulo_id
     GROUP BY m.id, m.titulo, m.total_pasos
     ORDER BY m.id
  `);
  const modulos = modulosRes.rows.map((m) => {
    const sesiones = parseInt(m.sesiones) || 0;
    return {
      id: m.id,
      titulo: m.titulo,
      total_pasos: m.total_pasos,
      sesiones,
      completadas: parseInt(m.completadas) || 0,
      tasa_error: porcentaje(parseInt(m.con_errores) || 0, sesiones),
    };
  });

  // 3. Abandonos por módulo
  const abandonosRes = await pool.query(`
    SELECT m.titulo, COUNT(p.id) AS abandonos
      FROM progreso_usuarios p
      JOIN modulos_tutoriales m ON p.modulo_id = m.id
     WHERE p.completado = false
     GROUP BY m.titulo
     ORDER BY abandonos DESC
  `);

  return {
    resumen,
    modulos,
    abandonos: abandonosRes.rows.map((a) => ({ titulo: a.titulo, abandonos: parseInt(a.abandonos) })),
  };
};
