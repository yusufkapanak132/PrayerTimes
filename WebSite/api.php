<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *"); // публичен API

// Зареждаме JSON файла
$jsonFile = __DIR__ . '/assets/all_prayer_times_2026.json';

if (!file_exists($jsonFile)) {
    http_response_code(500);
    echo json_encode(["error" => "JSON file not found"]);
    exit;
}

$data = json_decode(file_get_contents($jsonFile), true);

// Вземаме параметрите
$city   = $_GET['city']   ?? null;
$date   = $_GET['date']   ?? null;
$prayer = $_GET['prayer'] ?? null;

// Вземаме града от URL, но ако е празен низ (''), автоматично слагаме 'София'
if (isset($_GET['city']) && trim($_GET['city']) !== '') {
    $selectedCity = trim($_GET['city']);
} else {
    $selectedCity = 'София';
}

// Подаваме сигурния параметър към API
$_GET['city'] = $selectedCity; 
// Ако няма подаден град → връщаме всички налични градове
if (!$city) {
    echo json_encode([
        "available_cities" => array_keys($data)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Проверка дали градът съществува
if (!isset($data[$city])) {
    http_response_code(404);
    echo json_encode(["error" => "City not found"], JSON_UNESCAPED_UNICODE);
    exit;
}

// Ако няма дата → връщаме всички дати за града
if (!$date) {
    echo json_encode([
        "city" => $city,
        "data" => $data[$city]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Проверка дали датата съществува
if (!isset($data[$city][$date])) {
    http_response_code(404);
    echo json_encode(["error" => "Date not found"], JSON_UNESCAPED_UNICODE);
    exit;
}

// Ако няма молитва → връщаме всички молитви за датата
if (!$prayer) {
    echo json_encode([
        "city" => $city,
        "date" => $date,
        "prayers" => $data[$city][$date]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Проверка дали молитвата съществува
if (!isset($data[$city][$date][$prayer])) {
    http_response_code(404);
    echo json_encode(["error" => "Prayer not found"], JSON_UNESCAPED_UNICODE);
    exit;
}

// Връщаме конкретната молитва
echo json_encode([
    "city" => $city,
    "date" => $date,
    "prayer" => $prayer,
    "time" => $data[$city][$date][$prayer]
], JSON_UNESCAPED_UNICODE);