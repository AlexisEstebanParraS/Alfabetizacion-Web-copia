-- Script de Creación de Base de Datos: Municipio Fácil (PostgreSQL)
-- Ejecutar con psql (usa los comandos \gexec y \connect de psql):
--   psql -U postgres -f database.sql
-- Es idempotente: se puede ejecutar varias veces sin duplicar datos.

-- 0. Crear la base de datos solo si no existe y conectarse a ella
SELECT 'CREATE DATABASE "municipio-facil"'
 WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'municipio-facil')\gexec
\connect municipio-facil
-- El archivo está en UTF-8: así las tildes se guardan bien aunque psql corra en Windows
SET client_encoding = 'UTF8';

-- 1. Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

-- 2. Tabla de Usuarios (con FK a roles y contraseña hasheada)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol_id INT NOT NULL DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- 3. Tabla de Módulos / Tutoriales (RF01, RF06)
CREATE TABLE IF NOT EXISTS modulos_tutoriales (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    dificultad VARCHAR(20) DEFAULT 'Facil' CHECK (dificultad IN ('Facil', 'Media', 'Alta')),
    total_pasos INT NOT NULL DEFAULT 4 CHECK (total_pasos > 0),
    estado VARCHAR(20) DEFAULT 'Habilitado' CHECK (estado IN ('Habilitado', 'Borrador', 'Deshabilitado')),
    creado_por INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_modulo_admin FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 4. Tabla de Progreso y Métricas de Aprendizaje (RF05, RF07)
CREATE TABLE IF NOT EXISTS progreso_usuarios (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    modulo_id INT NOT NULL,
    completado BOOLEAN DEFAULT FALSE,
    paso_actual INT DEFAULT 1,
    errores_cometidos INT DEFAULT 0,
    tiempo_segundos INT DEFAULT 0,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_progreso_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_progreso_modulo FOREIGN KEY (modulo_id) REFERENCES modulos_tutoriales(id) ON DELETE CASCADE,
    CONSTRAINT UQprogreso_usuario_modulo UNIQUE (usuario_id, modulo_id) -- para que un usuario no inicie dos veces el mismo módulo.
);

-- DATOS INICIALES Y DE PRUEBA
INSERT INTO roles (id, nombre, descripcion) VALUES
(1, 'ciudadano', 'Usuario aprendiz que accede a simuladores y capacitaciones'),
(2, 'admin', 'Funcionario municipal que administra contenidos y monitorea métricas')
ON CONFLICT (id) DO NOTHING;

INSERT INTO modulos_tutoriales (id, titulo, descripcion, dificultad, total_pasos, estado) VALUES
(1, 'Solicitar Trámite', 'Aprende a ingresar al portal municipal y solicitar patentes sin errores.', 'Facil', 3, 'Habilitado'),
(2, 'Consultar estado de solicitud', 'Aprende a revisar los avances de tus documentos ingresados.', 'Facil', 3, 'Habilitado'),
(3, 'Descarga un certificado', 'Guía para descargar certificados de residencia y actas.', 'Media', 3, 'Habilitado'),
(4, 'Pagar servicios básicos', 'Simulador seguro para el pago en línea de derechos de aseo.', 'Alta', 4, 'Deshabilitado')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT MAX(id) FROM roles));
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), (SELECT MAX(id) FROM usuarios));
SELECT setval(pg_get_serial_sequence('modulos_tutoriales', 'id'), (SELECT MAX(id) FROM modulos_tutoriales));

-- El primer administrador NO se crea aquí (no se guardan contraseñas en el repositorio).
-- Se crea con: npm run crear-admin  (lee ADMIN_NOMBRE, ADMIN_EMAIL y ADMIN_PASSWORD del .env)
