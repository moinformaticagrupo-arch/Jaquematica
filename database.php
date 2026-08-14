<?php

$host = "localhost";
$dbname = "escuela_ajedrez";
$username = "root";
$password = "";

try {

    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

} catch (PDOException $e) {

    http_response_code(500);

    die(
        json_encode([
            "success" => false,
            "message" => "Error de conexión con la base de datos."
        ])
    );

}