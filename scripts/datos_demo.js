// Datos de demostración para la presentación: 8 ciudadanos con avances distintos,
// para que las métricas del administrador muestren algo interesante.
//
// Uso:
//   npm run datos-demo              -> crea los datos (se puede repetir sin duplicar)
//   npm run datos-demo -- --borrar  -> borra todo lo creado (usuarios @demo.cl y su progreso)
//
// Contraseña de las cuentas de ejemplo: DEMO_PASSWORD del .env (por defecto "Demo#2026").
// SOLO para desarrollo y presentaciones: nunca ejecutar en una base de datos real.
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from '../src/config/db.js';

const DOMINIO = '@demo.cl';
const PASSWORD = process.env.DEMO_PASSWORD || 'Demo#2026';

// [paso_actual, completado, errores, segundos] por módulo (1, 2 y 3); null = no lo inició.
// Se armó una historia para la demo:
//  - Módulo 1 (Solicitar trámite): casi todos lo completan, con algunos errores.
//  - Módulo 2 (Consultar estado): fácil, pocos errores.
//  - Módulo 3 (Descargar certificado): muchos abandonos -> el admin ve dónde mejorar.
const CIUDADANOS = [
  ['Rosa Muñoz',       [[3, true, 1, 240], [3, true, 0, 150], [2, false, 2, 300]]],
  ['Luis Soto',        [[3, true, 0, 180], [3, true, 0, 120], [1, false, 0, 60]]],
  ['Carmen Díaz',      [[3, true, 2, 420], [2, false, 1, 200], null]],
  ['Jorge Fuentes',    [[3, true, 3, 510], null, [2, false, 3, 380]]],
  ['Elena Rojas',      [[2, false, 1, 160], null, null]],
  ['Pedro Castillo',   [[3, true, 0, 200], [3, true, 0, 110], [3, true, 1, 330]]],
  ['Marta Contreras',  [[3, true, 1, 260], [3, true, 0, 140], [1, false, 1, 90]]],
  ['Héctor Valenzuela', [[3, true, 0, 190], [1, false, 0, 40], [2, false, 2, 280]]],
];

const correoDe = (nombre) => `${nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/\s+/g, '.')}${DOMINIO}`;

const borrar = async () => {
  // El progreso se borra solo por ON DELETE CASCADE
  const { rowCount } = await pool.query('DELETE FROM usuarios WHERE email LIKE $1', [`%${DOMINIO}`]);
  console.log(`🧹 Se borraron ${rowCount} ciudadanos de demostración y su progreso.`);
};

const crear = async () => {
  const hash = await bcrypt.hash(PASSWORD, 10);
  const cliente = await pool.connect();
  try {
    // Transacción: o se crea todo, o no se crea nada
    await cliente.query('BEGIN');
    let usuarios = 0;
    let progresos = 0;
    for (const [nombre, avances] of CIUDADANOS) {
      const { rows } = await cliente.query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol_id)
         VALUES ($1, $2, $3, 1)
         ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
         RETURNING id, (xmax = 0) AS nuevo`,
        [nombre, correoDe(nombre), hash]
      );
      if (rows[0].nuevo) usuarios += 1;

      for (const [indice, avance] of avances.entries()) {
        if (!avance) continue;
        const [paso, completado, errores, segundos] = avance;
        const resultado = await cliente.query(
          `INSERT INTO progreso_usuarios
             (usuario_id, modulo_id, paso_actual, completado, errores_cometidos, tiempo_segundos)
           SELECT $1, m.id, $3, $4, $5, $6 FROM modulos_tutoriales m WHERE m.id = $2
           ON CONFLICT (usuario_id, modulo_id) DO NOTHING`,
          [rows[0].id, indice + 1, paso, completado, errores, segundos]
        );
        progresos += resultado.rowCount;
      }
    }
    await cliente.query('COMMIT');
    console.log(`✅ Datos de demostración listos: ${usuarios} ciudadanos nuevos, ${progresos} registros de progreso nuevos.`);
    console.log(`   Cuentas: nombre.apellido${DOMINIO} (ej. ${correoDe(CIUDADANOS[0][0])}), contraseña: la de DEMO_PASSWORD.`);
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
};

(process.argv.includes('--borrar') ? borrar() : crear())
  .catch((error) => {
    console.error('❌ No se pudieron preparar los datos de demostración:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
