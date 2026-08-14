CREATE DATABASE IF NOT EXISTS escuela_ajedrez
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE escuela_ajedrez;

-- =====================================================
-- USUARIOS
-- =====================================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nivel ENUM(
        'principiante',
        'intermedio',
        'avanzado',
        'experto'
    ) DEFAULT 'principiante',
    puntos INT DEFAULT 0,
    partidas INT DEFAULT 0,
    victorias INT DEFAULT 0,
    derrotas INT DEFAULT 0,
    empates INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PARTIDAS
-- =====================================================

CREATE TABLE partidas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,

    rival_tipo ENUM(
        'ia',
        'jugador'
    ) DEFAULT 'ia',

    dificultad ENUM(
        'easy',
        'medium',
        'hard',
        'expert'
    ) DEFAULT 'medium',

    resultado ENUM(
        'victoria',
        'derrota',
        'empate',
        'abandono'
    ) NOT NULL,

    color ENUM(
        'white',
        'black'
    ) DEFAULT 'white',

    movimientos INT DEFAULT 0,

    puntos_ganados INT DEFAULT 0,

    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =====================================================
-- MOVIMIENTOS
-- =====================================================

CREATE TABLE movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    partida_id INT NOT NULL,

    numero INT NOT NULL,

    color ENUM(
        'white',
        'black'
    ) NOT NULL,

    movimiento VARCHAR(30) NOT NULL,

    pieza VARCHAR(30),

    desde VARCHAR(5),

    hasta VARCHAR(5),

    captura BOOLEAN DEFAULT FALSE,

    jaque BOOLEAN DEFAULT FALSE,

    jaque_mate BOOLEAN DEFAULT FALSE,

    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (partida_id)
        REFERENCES partidas(id)
        ON DELETE CASCADE
);

-- =====================================================
-- PROGRESO DEL ALUMNO
-- =====================================================

CREATE TABLE progreso (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL UNIQUE,

    ejercicios_resueltos INT DEFAULT 0,

    ejercicios_correctos INT DEFAULT 0,

    porcentaje INT DEFAULT 0,

    racha INT DEFAULT 0,

    mejor_racha INT DEFAULT 0,

    ultima_actividad DATETIME NULL,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =====================================================
-- EJERCICIOS
-- =====================================================

CREATE TABLE ejercicios (
    id INT AUTO_INCREMENT PRIMARY KEY,

    titulo VARCHAR(200) NOT NULL,

    descripcion TEXT,

    dificultad ENUM(
        'facil',
        'medio',
        'dificil',
        'experto'
    ) DEFAULT 'facil',

    respuesta VARCHAR(100),

    puntos INT DEFAULT 10,

    activo BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- INSERTAR EJERCICIOS DE EJEMPLO
-- =====================================================

INSERT INTO ejercicios
(titulo, descripcion, dificultad, respuesta, puntos)
VALUES

(
    'Mate en una',
    'Encontrá la jugada que permite dar jaque mate.',
    'facil',
    'Qh7',
    10
),

(
    'Ataque doble',
    'Encontrá la mejor jugada para atacar dos piezas.',
    'medio',
    'Nc7',
    20
),

(
    'Defensa del rey',
    'Encontrá la jugada que evita el jaque mate.',
    'dificil',
    'Kg8',
    30
),

(
    'Combinación táctica',
    'Encontrá la mejor combinación para obtener ventaja.',
    'experto',
    'Rxd8',
    50
);