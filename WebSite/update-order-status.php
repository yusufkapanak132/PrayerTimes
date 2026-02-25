<?php
// update-order-status.php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once 'includes/config.php'; 

header('Content-Type: application/json');

// --- СИГУРНОСТ ---
$allowed_roles = ['admin', 'Admin', 'Administrator'];
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || !in_array($_SESSION['role'], $allowed_roles)) {
    echo json_encode(['success' => false, 'message' => 'Достъп отказан.']);
    exit;
}
// -----------------

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $order_id = isset($_POST['order_id']) ? intval($_POST['order_id']) : 0;
    $new_status = isset($_POST['new_status']) ? trim($_POST['new_status']) : '';
    
    if ($order_id <= 0 || empty($new_status)) {
        echo json_encode(['success' => false, 'message' => 'Невалидни данни.']);
        exit;
    }

    // --- ОБНОВЕНИ ВАЛИДНИ СТАТУСИ ---
    $valid_statuses = ['Порвърдена', 'Изпратена', 'Доставена', 'Получена', 'Анулирана'];
    // ---------------------------------
    if (!in_array($new_status, $valid_statuses)) {
        echo json_encode(['success' => false, 'message' => 'Невалидна стойност за статус.']);
        exit;
    }

    try {
        $stmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $success = $stmt->execute([$new_status, $order_id]);
        
        if ($success) {
            echo json_encode(['success' => true, 'message' => 'Статусът е актуализиран успешно.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Актуализацията не успя.']);
        }
        
    } catch (PDOException $e) {
        error_log("DB Error updating order status: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Грешка в базата данни.']);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Невалиден метод на заявка.']);
}
?>