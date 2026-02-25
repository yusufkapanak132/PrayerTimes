<?php
// save_order.php

// 1. Включваме буфериране (за защита от грешки, чупещи JSON-а)
ob_start();
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');

// 2. Стартиране на сесия
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'includes/config.php'; 

$response = ['success' => false, 'message' => 'Неизвестна грешка.'];

try {
    // 3. Проверка дали $db (PDO) е налична
    if (!isset($db) || !$db instanceof PDO) {
        throw new Exception('Грешка при връзка с БД: Променливата $db не е дефинирана.');
    }

    // 4. Проверка на метода
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Невалиден метод (изисква се POST).');
    }

    // 5. Взимане на данните
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    // 6. Валидация
    $required_fields = ['name', 'email', 'phone', 'deliveryMethod', 'address', 'city', 'total', 'items'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || (is_string($input[$field]) && empty(trim($input[$field])))) {
            http_response_code(400); 
            throw new Exception("Липсва задължително поле: {$field}");
        }
    }

    // Саниране
    $full_name = htmlspecialchars(strip_tags(trim($input['name'])));
    $email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
    $phone = htmlspecialchars(strip_tags(trim($input['phone'])));
    $delivery_method = htmlspecialchars(strip_tags(trim($input['deliveryMethod'])));
    $address = htmlspecialchars(strip_tags(trim($input['address'])));
    $city = htmlspecialchars(strip_tags(trim($input['city'])));
    $total_amount = floatval($input['total']);

    // --- ПРОМЯНА: Форматиране на продуктите като текст ---
    $items_formatted = '';
    
    if (is_array($input['items'])) {
        $parts = [];
        foreach ($input['items'] as $item) {
            $p_name = $item['name'] ?? 'Продукт';
            $p_qty = $item['quantity'] ?? 1;
            // Формат: "Име на продукт x1"
            $parts[] = "{$p_name} x{$p_qty}";
        }
        // Свързваме ги със запетая и интервал
        $items_formatted = implode('; ', $parts);
    } else {
        // Ако по някаква причина не е масив, запазваме както е
        $items_formatted = htmlspecialchars(strip_tags((string)$input['items']));
    }
    // -----------------------------------------------------

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Невалиден имейл адрес.');
    }

    // 7. Подготовка на данните
    $order_number = 'ORD-' . date('ymd') . '-' . rand(1000, 9999);
    $status = 'Изчаква одобрение'; 
    $order_date = date('Y-m-d H:i:s');
    
    // Ако таблицата има user_id, добавете го в SQL. Тук следвам структурата от вашия пример.
    
    // 8. Запис в DB
    $sql = "INSERT INTO orders 
            (customer_name, email, phone, delivery_method, address, city, items, total, status, order_date, order_number) 
            VALUES 
            (:name, :email, :phone, :method, :addr, :city, :items, :total, :status, :date, :ord_num)";
            
    $stmt = $db->prepare($sql); // Използваме $db
    
    $stmt->execute([
        ':name' => $full_name,
        ':email' => $email,
        ':phone' => $phone,
        ':method' => $delivery_method,
        ':addr' => $address,
        ':city' => $city,
        ':items' => $items_formatted, // Записваме форматирания стринг
        ':total' => $total_amount,
        ':status' => $status,
        ':date' => $order_date,
        ':ord_num' => $order_number
    ]);

    $order_id = $db->lastInsertId();

    $response = [
        'success' => true, 
        'message' => 'Поръчката е записана.',
        'order_id' => $order_id,
        'order_number' => $order_number
    ];

} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
    error_log("Save Order Error: " . $e->getMessage());
}

// 9. Финално изчистване
ob_clean(); 
echo json_encode($response, JSON_UNESCAPED_UNICODE);
exit;