<?php

header("Content-Type: application/json");

require_once "../config/database.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$nombre = trim($data["nombre"] ?? "");
$apellido = trim($data["apellido"] ?? "");
$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if (
    !$nombre ||
    !$apellido ||
    !$email ||
    !$password
) {

    echo json_encode([
        "success" => false,
        "message" => "Completá todos los campos."
    ]);

    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    echo json_encode([
        "success" => false,
        "message" => "El correo electrónico no es válido."
    ]);

    exit;
}

if (strlen($password) < 6) {

    echo json_encode([
        "success" => false,
        "message" => "La contraseña debe tener al menos 6 caracteres."
    ]);

    exit;
}

try {

    $check = $pdo->prepare(
        "SELECT id FROM usuarios WHERE email = ?"
    );

    $check->execute([$email]);

    if ($check->fetch()) {

        echo json_encode([
            "success" => false,
            "message" => "Ese correo ya está registrado."
        ]);

        exit;
    }

    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    $stmt = $pdo->prepare("
        INSERT INTO usuarios
        (nombre, apellido, email, password)
        VALUES (?, ?, ?, ?)
    ");

    $stmt->execute([
        $nombre,
        $apellido,
        $email,
        $passwordHash
    ]);

    $usuarioId = $pdo->lastInsertId();

    $stmt = $pdo->prepare("
        INSERT INTO progreso
        (usuario_id)
        VALUES (?)
    ");

    $stmt->execute([
        $usuarioId
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Usuario registrado correctamente.",
        "usuario_id" => $usuarioId
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" => "No se pudo registrar el usuario."
    ]);
}