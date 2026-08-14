<?php

session_start();

header("Content-Type: application/json");

require_once "../config/database.php";

if (!isset($_SESSION["usuario_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "Sesión no iniciada."
    ]);

    exit;
}

$stmt = $pdo->prepare("
    SELECT
        nombre,
        apellido,
        nivel,
        puntos,
        partidas,
        victorias,
        derrotas,
        empates
    FROM usuarios
    WHERE id = ?
");

$stmt->execute([
    $_SESSION["usuario_id"]
]);

$usuario =
    $stmt->fetch();

if (!$usuario) {

    echo json_encode([
        "success" => false,
        "message" => "Usuario no encontrado."
    ]);

    exit;
}

$porcentajeVictorias = 0;

if ($usuario["partidas"] > 0) {

    $porcentajeVictorias =
        round(
            (
                $usuario["victorias"] /
                $usuario["partidas"]
            ) * 100
        );

}

echo json_encode([
    "success" => true,

    "estadisticas" => [

        "nombre" =>
            $usuario["nombre"],

        "apellido" =>
            $usuario["apellido"],

        "nivel" =>
            $usuario["nivel"],

        "puntos" =>
            $usuario["puntos"],

        "partidas" =>
            $usuario["partidas"],

        "victorias" =>
            $usuario["victorias"],

        "derrotas" =>
            $usuario["derrotas"],

        "empates" =>
            $usuario["empates"],

        "porcentaje_victorias" =>
            $porcentajeVictorias
    ]
]);