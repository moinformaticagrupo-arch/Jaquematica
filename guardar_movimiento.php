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

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$partidaId =
    intval($data["partida_id"] ?? 0);

$numero =
    intval($data["numero"] ?? 0);

$color =
    $data["color"] ?? "white";

$movimiento =
    $data["movimiento"] ?? "";

$pieza =
    $data["pieza"] ?? "";

$desde =
    $data["desde"] ?? "";

$hasta =
    $data["hasta"] ?? "";

$captura =
    !empty($data["captura"]) ? 1 : 0;

$jaque =
    !empty($data["jaque"]) ? 1 : 0;

$jaqueMate =
    !empty($data["jaque_mate"]) ? 1 : 0;

if (!$partidaId || !$movimiento) {

    echo json_encode([
        "success" => false,
        "message" => "Datos incompletos."
    ]);

    exit;
}

$stmt = $pdo->prepare("
    INSERT INTO movimientos
    (
        partida_id,
        numero,
        color,
        movimiento,
        pieza,
        desde,
        hasta,
        captura,
        jaque,
        jaque_mate
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->execute([
    $partidaId,
    $numero,
    $color,
    $movimiento,
    $pieza,
    $desde,
    $hasta,
    $captura,
    $jaque,
    $jaqueMate
]);

echo json_encode([
    "success" => true,
    "message" => "Movimiento guardado."
]);