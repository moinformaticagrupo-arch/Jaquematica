<?php

session_start();

header("Content-Type: application/json");

require_once "../config/database.php";

if (!isset($_SESSION["usuario_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "Tenés que iniciar sesión."
    ]);

    exit;
}

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$usuarioId =
    $_SESSION["usuario_id"];

$rivalTipo =
    $data["rival_tipo"] ?? "ia";

$dificultad =
    $data["dificultad"] ?? "medium";

$resultado =
    $data["resultado"] ?? "empate";

$color =
    $data["color"] ?? "white";

$movimientos =
    intval($data["movimientos"] ?? 0);

$puntos =
    intval($data["puntos_ganados"] ?? 0);

$stmt = $pdo->prepare("
    INSERT INTO partidas
    (
        usuario_id,
        rival_tipo,
        dificultad,
        resultado,
        color,
        movimientos,
        puntos_ganados
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
");

$stmt->execute([
    $usuarioId,
    $rivalTipo,
    $dificultad,
    $resultado,
    $color,
    $movimientos,
    $puntos
]);

$partidaId =
    $pdo->lastInsertId();

/*
   Actualizar estadísticas
*/

if ($resultado === "victoria") {

    $pdo->prepare("
        UPDATE usuarios
        SET
            partidas = partidas + 1,
            victorias = victorias + 1,
            puntos = puntos + ?
        WHERE id = ?
    ")->execute([
        $puntos,
        $usuarioId
    ]);

} elseif ($resultado === "derrota") {

    $pdo->prepare("
        UPDATE usuarios
        SET
            partidas = partidas + 1,
            derrotas = derrotas + 1
        WHERE id = ?
    ")->execute([
        $usuarioId
    ]);

} else {

    $pdo->prepare("
        UPDATE usuarios
        SET
            partidas = partidas + 1,
            empates = empates + 1,
            puntos = puntos + ?
        WHERE id = ?
    ")->execute([
        $puntos,
        $usuarioId
    ]);
}

echo json_encode([
    "success" => true,
    "partida_id" => $partidaId
]);