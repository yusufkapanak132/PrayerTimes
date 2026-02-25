<?php
// admin-dashboard.php
session_start();

// Проверка дали потребителят е влязъл
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Location: users.php');
    exit;
}

// Проверка дали потребителят е администратор
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'Administrator') {
    include 'includes/config.php';
    
    try {
        // Взимаме настройките на потребителя от базата данни
        $stmt = $db->prepare("SELECT city, language FROM settings WHERE user_id = ? LIMIT 1");
        $stmt->execute([$_SESSION['user_id']]);
        $user_settings = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user_settings) {
            $lang = $user_settings['language'];
            $city = $user_settings['city'];
        } else {
            // Ако няма настройки, ползваме default стойности
            $lang = 'bg';
            $city = 'София';
        }
        
        // Кодираме града за URL
        $city_encoded = urlencode($city);
        
        // Пренасочваме към основната страница с настройките на потребителя
        $redirect_url = "index.php?access_denied=1&lang={$lang}&city={$city_encoded}";
        header("Location: " . $redirect_url);
        exit;
}
catch (PDOException $e) {
    // При грешка, пренасочваме с default стойности
    $redirect_url = "index.php?access_denied=1&lang=bg&city=" . urlencode('София');
    header("Location: " . $redirect_url);
    exit;
}
}

include 'includes/config.php';

// Взимане на реални данни за последно регистрираните потребители
try {
    $stmt = $db->prepare("SELECT name, created_at FROM users WHERE role = 'User' ORDER BY created_at DESC LIMIT 3");
    $stmt->execute();
    $recent_users = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $recent_users = [];
    $error = $e->getMessage();
}

// Взимане на последни системни промени (от логове или настройки)
try {
    // Може да създадете таблица logs в базата данни за това
    // Засега ще взимаме последно променените настройки
    $stmt = $db->prepare("SELECT user_id, updated_at FROM settings WHERE updated_at IS NOT NULL ORDER BY updated_at DESC LIMIT 1");
    $stmt->execute();
    $last_config_update = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Ако има последна промяна, взимаме името на потребителя
    if ($last_config_update) {
        $stmt2 = $db->prepare("SELECT name FROM users WHERE user_id = ?");
        $stmt2->execute([$last_config_update['user_id']]);
        $user_who_updated = $stmt2->fetch(PDO::FETCH_ASSOC);
    }
} catch (PDOException $e) {
    $last_config_update = null;
    $user_who_updated = null;
}
?>

<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Администраторски Панел - Молитвени Времена</title>
    <link rel="stylesheet" href="css/admin-dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="admin-container">
        <div class="admin-header">
            <div class="admin-welcome">
                <h1><i class="fas fa-user-shield"></i> Администраторски Панел</h1>
                <p>Добре дошли, <?php echo htmlspecialchars($_SESSION['user_name']); ?>!</p>
                <p class="admin-status"><i class="fas fa-circle" style="color: #27ae60; font-size: 12px;"></i> Статус: Администратор</p>
            </div>
            <div class="admin-actions">
                <a href="index.php?login=successful" class="admin-btn">
                    <i class="fas fa-home"></i> Начало
                </a>
                <a href="logout.php" class="admin-logout">
                    <i class="fas fa-sign-out-alt"></i> Изход
                </a>
            </div>
        </div>
        
        <div class="admin-stats">
            <?php
            // Get real statistics
            try {
                $users_count = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
                $admins_count = $db->query("SELECT COUNT(*) FROM users WHERE role = 'Administrator'")->fetchColumn();
                $active_users = $db->query("SELECT COUNT(DISTINCT user_id) FROM settings")->fetchColumn();
                
                // Потребители регистрирани днес
                $today = date('Y-m-d');
                $users_today = $db->prepare("SELECT COUNT(*) FROM users WHERE DATE(created_at) = ?")->execute([$today]);
                $users_today = $stmt->fetchColumn();
            } catch (PDOException $e) {
                $users_count = 0;
                $admins_count = 0;
                $active_users = 0;
                $users_today = 0;
            }
            ?>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: #e3f2fd;">
                    <i class="fas fa-users" style="color: #1976d2;"></i>
                </div>
                <div class="stat-info">
                    <h3>Общо Потребители</h3>
                    <div class="number"><?php echo $users_count; ?></div>
                    <div class="stat-change">
                        <i class="fas fa-user-plus" style="color: #27ae60;"></i>
                        <span>+<?php echo $users_today; ?> днес</span>
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: #f3e5f5;">
                    <i class="fas fa-user-shield" style="color: #7b1fa2;"></i>
                </div>
                <div class="stat-info">
                    <h3>Администратори</h3>
                    <div class="number"><?php echo $admins_count; ?></div>
                    <div class="stat-change">
                        <i class="fas fa-shield-alt"></i>
                        <span>Системни администратори</span>
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: #e8f5e9;">
                    <i class="fas fa-chart-line" style="color: #388e3c;"></i>
                </div>
                <div class="stat-info">
                    <h3>Активни Потребители</h3>
                    <div class="number"><?php echo $active_users; ?></div>
                    <div class="stat-change">
                        <i class="fas fa-check-circle" style="color: #388e3c;"></i>
                        <span>С въведени настройки</span>
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: #fff3e0;">
                    <i class="fas fa-calendar-alt" style="color: #f57c00;"></i>
                </div>
                <div class="stat-info">
                    <h3>Днес</h3>
                    <div class="number"><?php echo date('d.m.Y'); ?></div>
                    <div class="stat-change">
                        <i class="fas fa-clock" style="color: #f57c00;"></i>
                        <span><?php echo date('H:i'); ?></span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="admin-content">
            <h2 class="content-title">Бързи Действия</h2>
            
            <div class="quick-actions">
                <a href="manage-users.php" class="action-btn">
                    <i class="fas fa-user-cog"></i>
                    <span>Управление на потребители</span>
                    <small>Добавяне, редакция, изтриване</small>
                </a>
                
                <a href="manage-orders.php" class="action-btn">
                    <i class="fas fa-shopping-cart"></i>
                    <span>Управление на поръчки</span>
                    <small>Преглед и обработка</small>
                </a>
                
              
            </div>
            
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3><i class="fas fa-history"></i> Последна активност</h3>
                    <ul class="recent-activity">
                        <li>
                            <div class="activity-icon" style="background: #e3f2fd;">
                                <i class="fas fa-sign-in-alt" style="color: #1976d2;"></i>
                            </div>
                            <div>
                                <strong>Вие влязохте в системата</strong>
                                <div class="activity-time"><?php echo date('d.m.Y H:i:s'); ?></div>
                            </div>
                        </li>
                        
                        <?php if (!empty($recent_users)): ?>
                            <?php foreach($recent_users as $user): ?>
                            <li>
                                <div class="activity-icon" style="background: #e8f5e9;">
                                    <i class="fas fa-user-plus" style="color: #388e3c;"></i>
                                </div>
                                <div>
                                    <strong>Нов потребител: <?php echo htmlspecialchars($user['name']); ?></strong>
                                    <div class="activity-time">
                                        <?php 
                                        $created_date = new DateTime($user['created_at']);
                                        echo $created_date->format('d.m.Y');
                                        ?>
                                    </div>
                                </div>
                            </li>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <li>
                                <div class="activity-icon" style="background: #ffebee;">
                                    <i class="fas fa-info-circle" style="color: #d32f2f;"></i>
                                </div>
                                <div>
                                    <strong>Няма нови потребители</strong>
                                    <div class="activity-time">Последните 24 часа</div>
                                </div>
                            </li>
                        <?php endif; ?>
                        
                        <?php if ($last_config_update && $user_who_updated): ?>
                        <li>
                            <div class="activity-icon" style="background: #fff3e0;">
                                <i class="fas fa-cog" style="color: #f57c00;"></i>
                            </div>
                            <div>
                                <strong>Обновени настройки</strong>
                                <div class="activity-time">
                                    Потребител: <?php echo htmlspecialchars($user_who_updated['name']); ?> | 
                                    <?php 
                                    $update_date = new DateTime($last_config_update['updated_at']);
                                    echo $update_date->format('d.m.Y H:i');
                                    ?>
                                </div>
                            </div>
                        </li>
                        <?php endif; ?>
                    </ul>
                </div>
                
                <div class="dashboard-card">
                    <h3><i class="fas fa-info-circle"></i> Системна информация</h3>
                    <div class="system-info">
                        <div class="info-item">
                            <i class="fas fa-server"></i>
                            <div>
                                <strong>Версия на системата:</strong>
                                <span>2.0.1</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-code"></i>
                            <div>
                                <strong>PHP версия:</strong>
                                <span><?php echo phpversion(); ?></span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-server"></i>
                            <div>
                                <strong>Сървър:</strong>
                                <span><?php echo htmlspecialchars($_SERVER['SERVER_SOFTWARE']); ?></span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-database"></i>
                            <div>
                                <strong>База данни:</strong>
                                <span>MySQL</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar-check"></i>
                            <div>
                                <strong>Последно обновяване:</strong>
                                <span>10.01.2024</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="system-status">
                        <h4><i class="fas fa-heartbeat"></i> Статус на системата</h4>
                        <div class="status-indicator active">
                            <i class="fas fa-circle"></i>
                            <span>Системата работи нормално</span>
                        </div>
                        <div class="status-metrics">
                            <div class="metric">
                                <span>Зареденост:</span>
                                <span class="metric-value low">23%</span>
                            </div>
                            <div class="metric">
                                <span>Свободна памет:</span>
                                <span class="metric-value good">1.2 GB</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="admin-footer">
            <p>© 2026 Времена за Намаз | Администраторски панел | Последен достъп: <?php echo date('d.m.Y H:i:s'); ?></p>
        </div>
    </div>
    
    <script src="js/admin-dashboard.js"></script>
</body>
</html>