<?php
// includes/get-stats.php
session_start();

// Проверка за администраторски достъп
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'Administrator') {
    header('HTTP/1.1 403 Forbidden');
    echo json_encode(['error' => 'Access denied']);
    exit;
}

include 'config.php';

try {
    $total_users = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    
    $today = date('Y-m-d');
    $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE DATE(created_at) = ?");
    $stmt->execute([$today]);
    $users_today = $stmt->fetchColumn();
    
    $active_users = $db->query("SELECT COUNT(DISTINCT user_id) FROM settings")->fetchColumn();
    
    echo json_encode([
        'total_users' => $total_users,
        'users_today' => $users_today,
        'active_users' => $active_users,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} catch (PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}
?>