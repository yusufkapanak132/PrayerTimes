<?php
// finalize_order.php

// Включваме буфериране за защита на JSON отговора
ob_start();
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once 'includes/config.php'; 

$response = ['success' => false, 'message' => 'Неизвестна грешка.'];

try {
    // Проверка за $db
    if (!isset($db) || !$db instanceof PDO) {
        throw new Exception('Грешка при връзка с БД ($db липсва).');
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Невалиден метод.');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $order_id = $input['order_id'] ?? null;
    $action = $input['action'] ?? null;

    if (!$order_id || !$action) {
        throw new Exception('Липсват данни (ID или действие).');
    }

    if ($action === 'confirm') {
        // Променяме статуса на потвърдена (Използваме $db)
        $stmt = $db->prepare("UPDATE orders SET status = 'Потвърдена' WHERE id = ?");
        $stmt->execute([$order_id]);
        $message = "Поръчката е успешно потвърдена!";
        $success = true;
    } elseif ($action === 'cancel') {
        // Изтриваме поръчката (Използваме $db)
        $stmt = $db->prepare("DELETE FROM orders WHERE id = ?");
        $stmt->execute([$order_id]);
        $message = "Поръчката беше отказана и изтрита.";
        $success = true;
    } else {
        throw new Exception("Невалидно действие.");
    }

    $response = ['success' => true, 'message' => $message];

} catch (Exception $e) {
    http_response_code(500);
    $response = ['success' => false, 'message' => 'Грешка: ' . $e->getMessage()];
    error_log("Finalize Order Error: " . $e->getMessage());
}

// Изчистваме буфера и връщаме само JSON
ob_clean();
echo json_encode($response, JSON_UNESCAPED_UNICODE);
exit;