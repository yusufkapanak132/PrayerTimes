<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include 'includes/config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "not_logged"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Получаваме POST данните
$setting = $_POST['setting'] ?? null;
$value = $_POST['value'] ?? null;

if (!$setting || $value === null) {
    echo json_encode(["success" => false, "error" => "missing_parameters"]);
    exit;
}

// За безопасност, позволени колони
$allowedSettings = ['contrast', 'large_text', 'daltonism', 'city', 'language'];
if (!in_array($setting, $allowedSettings)) {
    echo json_encode(["success" => false, "error" => "invalid_setting"]);
    exit;
}

// Логване за дебъг
error_log("Updating setting: $setting = $value for user: $user_id");

try {
    // Подготвяме и изпълняваме заявката
    $stmt = $db->prepare("UPDATE settings SET $setting = :value WHERE user_id = :user_id");
    $result = $stmt->execute([':value' => $value, ':user_id' => $user_id]);
    
    if ($result) {
        // АКТУАЛИЗИРАМЕ СЕСИЯТА ВЕДНАГА
        $_SESSION[$setting] = $value;
        error_log("Setting updated successfully in session: $setting = $value");
        
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => "database_error"]);
    }
} catch (Exception $e) {
    error_log("Error updating setting: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => "exception", "message" => $e->getMessage()]);
}
?>