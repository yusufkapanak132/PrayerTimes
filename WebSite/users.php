<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
include 'includes/config.php';
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    
    // Ако е администратор, пренасочваме в админ панела
    if (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'Administrator') {
        header('Location: admin-dashboard.php');
        exit;
    }
    
}
include 'includes/functions.php';

$message = "";
$is_register = isset($_GET['register']) ? true : false;

// ----- LOGIN -----
if (isset($_POST['login'])) {
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    // 1. Извличаме потребителя
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Проверка на потребител и парола
    if ($user && password_verify($password, $user["password"])) {
        
        // --- ЗАПИС НА ОСНОВНИ ДАННИ В СЕСИЯТА ---
        $_SESSION["user_id"] = $user["user_id"];
        $_SESSION["user_name"] = $user["name"];
        $_SESSION["user_role"] = $user["role"]; // Добавяме ролята
        $_SESSION["logged_in"] = true;
        $_SESSION["login_time"] = time();

        // 2. ИЗВЛИЧАНЕ И ЗАПИС НА НАСТРОЙКИ
        $stmt2 = $db->prepare("SELECT * FROM settings WHERE user_id = ? LIMIT 1");
        $stmt2->execute([$user["user_id"]]); 
        $settings = $stmt2->fetch(PDO::FETCH_ASSOC);

        $default_city = 'София';
        $default_lang = 'bg';

        if ($settings) {
            // Записваме всички настройки в сесията
            $_SESSION["contrast"] = $settings["contrast"];
            $_SESSION["large_text"] = $settings["large_text"];
            $_SESSION["daltonism"] = $settings["daltonism"];
            $_SESSION["city"] = $settings["city"];
            $_SESSION["language"] = $settings["language"];
            
            $lang_to_redirect = $settings["language"];
            $city_to_redirect = $settings["city"];

        } else {
            // Default настройки
            $_SESSION["contrast"] = 0;
            $_SESSION["large_text"] = 0;
            $_SESSION["daltonism"] = 0;
            $_SESSION["city"] = $default_city;
            $_SESSION["language"] = $default_lang;
            
            $lang_to_redirect = $default_lang;
            $city_to_redirect = $default_city;
        }

        // --- ПРЕНАСОЧВАНЕ СПОРЕД РОЛЯ ---
        if ($user["role"] === "Administrator") {
            $_SESSION['role'] = $user['role'];
            // Пренасочваме администраторите към админ панела
            header("Location: admin-dashboard.php");
            exit;
        } else {
            // Обикновените потребители се пренасочват към основната страница
            $city_url_encoded = urlencode($city_to_redirect); 
            $redirect_url = "index.php?login=success&t=" . time() . "&lang={$lang_to_redirect}&city={$city_url_encoded}";
            header("Location: " . $redirect_url, true, 303);
            exit;
        }
        
    } else {
        $message = "Невалиден имейл или парола.";
    }
}

// ----- REGISTER -----
if (isset($_POST['register'])) {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $confirm_password = trim($_POST['confirm_password']);
    $created_at = date('Y-m-d H:i:s');
    
    // Валидация
    if (empty($name) || empty($email) || empty($password)) {
        $message = "Моля, попълнете всички полета.";
        $is_register = true;
    } elseif ($password !== $confirm_password) {
        $message = "Паролите не съвпадат.";
        $is_register = true;
    } elseif (strlen($password) < 6) {
        $message = "Паролата трябва да бъде поне 6 символа.";
        $is_register = true;
    } else {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $user_id = "USR_" . uniqid() . "_" . time(); // По-уникален user_id

        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);

        if ($stmt->rowCount() > 0) {
            $message = "Имейлът вече е регистриран.";
            $is_register = true;
        } else {
            // Създаване user с роля "User" по подразбиране
            $stmt = $db->prepare("INSERT INTO users (user_id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, 'User', ?)");
            $stmt->execute([$user_id, $name, $email, $hashed_password, $created_at]);

            // Създаване на default settings
            $stmt = $db->prepare("INSERT INTO settings (user_id, contrast, large_text, daltonism, city, language)
                                  VALUES (?, 0, 0, 0, 'София', 'bg')");
            $stmt->execute([$user_id]);
            
            // Записваме user session
            $_SESSION["user_id"] = $user_id;
            $_SESSION["user_name"] = $name;
            $_SESSION["user_role"] = "User";
            $_SESSION["logged_in"] = true;
            $_SESSION["login_time"] = time();
            $_SESSION["contrast"] = 0;
            $_SESSION["large_text"] = 0;
            $_SESSION["daltonism"] = 0;
            $_SESSION["city"] = 'София';
            $_SESSION["language"] = 'bg';
            
            header("Location: index.php?register=success");
            exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $is_register ? 'Регистрация' : 'Вход'; ?> - Времена за Намаз</title>
  
    <link rel="stylesheet" href="css/users.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="manifest" href="./manifest.json">
    <link rel="apple-touch-icon" href="./assets/icon-512x512.png">
    <link rel="icon" href="./assets/icon-512x512.png" type="image/png">
    <link rel="apple-touch-icon" href="./assets/icon-180x180.png">
    <link rel="icon" href="./assets/icon-180x180.png" type="image/png">
    <link rel="apple-touch-icon" href="./assets/icon-192x192.png">
    <link rel="icon" href="./assets/icon-192x192.png" type="image/png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Времена за Намаз">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <div class="auth-icon">
                    <i class="fas fa-mosque"></i>
                </div>
                <h1 class="auth-title">Времена за Намаз</h1>
                <p class="auth-subtitle">
                    <?php echo $is_register ? 'Създайте нов профил' : 'Влезте в профила си'; ?>
                </p>
            </div>
            
            <?php if ($message): ?>
                <div class="message error">
                    <i class="fas fa-exclamation-circle"></i>
                    <?php echo $message; ?>
                </div>
            <?php endif; ?>
            
            <?php if (!$is_register): ?>
                <!-- Login Form -->
                <form method="POST" class="auth-form">
                    <div class="form-group">
                        <label for="email" class="form-label">
                            <i class="fas fa-envelope"></i> Имейл адрес
                        </label>
                        <input type="email" id="email" name="email" class="form-control" required
                               placeholder="вашият@имейл.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="password" class="form-label">
                            <i class="fas fa-lock"></i> Парола
                        </label>
                        <input type="password" id="password" name="password" class="form-control" required
                               placeholder="Вашата парола">
                        <div class="password-toggle">
                            <i class="fas fa-eye"></i>
                        </div>
                    </div>
                    
                    <button type="submit" name="login" class="btn btn-primary btn-block">
                        <i class="fas fa-sign-in-alt"></i> Вход
                    </button>
                </form>
                
                <div class="auth-switch">
                    Нямате профил? <a href="?register=true" class="auth-link">Регистрирайте се</a>
                </div>
            <?php else: ?>
                <!-- Register Form -->
                <form method="POST" class="auth-form">
                    <div class="form-group">
                        <label for="name" class="form-label">
                            <i class="fas fa-user"></i> Име и фамилия
                        </label>
                        <input type="text" id="name" name="name" class="form-control" required
                               placeholder="Вашето име">
                    </div>
                    
                    <div class="form-group">
                        <label for="email" class="form-label">
                            <i class="fas fa-envelope"></i> Имейл адрес
                        </label>
                        <input type="email" id="email" name="email" class="form-control" required
                               placeholder="вашият@имейл.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="password" class="form-label">
                            <i class="fas fa-lock"></i> Парола
                        </label>
                        <input type="password" id="password" name="password" class="form-control" required
                               placeholder="Поне 6 символа">
                        <div class="password-toggle">
                            <i class="fas fa-eye"></i>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirm_password" class="form-label">
                            <i class="fas fa-lock"></i> Потвърдете паролата
                        </label>
                        <input type="password" id="confirm_password" name="confirm_password" class="form-control" required
                               placeholder="Повторете паролата">
                        <div class="password-toggle">
                            <i class="fas fa-eye"></i>
                        </div>
                    </div>
                    
                    <button type="submit" name="register" class="btn btn-primary btn-block">
                        <i class="fas fa-user-plus"></i> Регистриране
                    </button>
                </form>
                
                <div class="auth-switch">
                    Вече имате профил? <a href="users.php" class="auth-link">Влезте в профила си</a>
                </div>
            <?php endif; ?>
            
            <div class="auth-footer">
                <p>© 2026 Времена за Намаз. Всички права запазени.</p>
            </div>
        </div>
    </div>
    
    <script src="js/users.js"></script>
</body>
</html>