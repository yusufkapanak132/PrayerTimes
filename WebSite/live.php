<?php
include 'includes/config.php';
include 'includes/functions.php';

// Пълен списък с всички поддържани градове (за да е бързо зареждането)
$cities = [
    "Айтос", "Балчик", "Благоевград", "Бургас", "Бяла", "Варна", "Велики Преслав", 
    "Велико Търново", "Велинград", "Горна Оряховица", "Гоце Делчев", "Добрич", 
    "Исперих", "Каварна", "Каолиново", "Карлово", "Карнобат", "Кнежа", "Котел", 
    "Крумовград", "Кубрат", "Кърджали", "Ловеч", "Мадан", "Монтана", "Никопол", 
    "Нова Загора", "Нови пазар", "Пазарджик", "Плевен", "Пловдив", "Провадия", 
    "Разград", "Русе", "Свищов", "Силистра", "Ситово", "Сливен", "Смолян", 
    "София", "Стара Загора", "Твърдица", "Търговище", "Харманли", "Хасково", 
    "Шумен", "Якоруда", "Ямбол"
];

// Вземаме града
$selectedCity = 'София';
if (isset($_GET['city']) && in_array(trim($_GET['city']), $cities)) {
    $selectedCity = trim($_GET['city']);
}

// Текуща дата
$today = date('Y-m-d'); // По-надежден начин за PHP
?>
<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Времена за Намаз</title>
    <link rel="stylesheet" href="css/live.css">
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
    <div class="background-overlay"></div>
    
    <div class="container">
        <!-- Header -->
        <div class="header">
            <button class="nav-button" onclick="toggleMenu()">
                <i class="fas fa-bars"></i>
            </button>
            <div class="header-center">
                <h1 class="city-title"><?php echo $selectedCity; ?></h1>
                <div class="current-time" id="currentTime">--:--</div>
            </div>
            <button class="location-button" onclick="openCityModal()">
                <i class="fas fa-map-marker-alt"></i>
            </button>
        </div>

        <!-- Remaining Time Section -->
        <div class="remaining-container" id="remainingContainer">
            <div class="remaining-row">
                <div class="remaining-big" id="remainingHours">--:--</div>
                <div class="remaining-small" id="remainingSeconds">:--</div>
                <div class="remaining-label">Ч.</div>
            </div>
            <div class="until-text">до</div>
            <div class="next-prayer-text" id="nextPrayerName">--</div>
        </div>

        <!-- Elapsed Prayer Section -->
        <div class="elapsed-container" id="elapsedContainer">
            <div class="elapsed-row">
                <div class="elapsed-info">
                    <i class="fas fa-clock elapsed-icon"></i>
                    <span class="elapsed-name" id="prevPrayerName">--</span>
                </div>
                <div class="elapsed-time-box">
                    <span class="elapsed-time-text" id="elapsedTime">+--:--</span>
                </div>
            </div>
            <!-- Progress Bar -->
            <div class="elapsed-progress-container">
                <div class="elapsed-progress-background">
                    <div class="elapsed-progress-fill" id="progressBar"></div>
                </div>
            </div>
        </div>

        <!-- Date Navigation -->
        <div class="date-navigation">
            <button class="date-button" id="prevDayBtn">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="date-container">
                <i class="fas fa-calendar-alt date-icon"></i>
                <span class="date-text" id="currentDateText"><?php echo $today; ?></span>
            </div>
            <button class="date-button" id="nextDayBtn">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>

        <!-- Prayer Times Table -->
        <div class="times-container">
            <div class="table-header">
                <i class="fas fa-clock table-icon"></i>
                <h2 class="table-day-title" id="weekdayTitle">--</h2>
            </div>
            
            <div class="times-grid" id="prayerTimesGrid">
                <!-- Prayer times will be populated by JavaScript -->
            </div>
        </div>

        <!-- City Selection Modal -->
        <div class="modal-overlay" id="cityModal">
            <div class="modal-container">
                <div class="modal-header">
                    <i class="fas fa-city"></i>
                    <h2 class="modal-title">Избери град</h2>
                    <button class="modal-close-button" onclick="closeCityModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="search-container">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" class="search-input" id="citySearch" placeholder="Търси град...">
                </div>

                <div class="city-list-container">
                    <div class="city-list" id="cityList">
                        <?php foreach ($cities as $city): ?>
                            <div class="city-item <?php echo ($city == $selectedCity) ? 'selected' : ''; ?>" 
                                 onclick="selectCity('<?php echo $city; ?>')">
                                <div class="city-item-content">
                                    <i class="fas fa-map-marker-alt city-icon"></i>
                                    <div class="city-text-container">
                                        <div class="city-text"><?php echo $city; ?></div>
                                        <?php if ($city == $selectedCity): ?>
                                            <div class="selected-label">Избран</div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                                <?php if ($city == $selectedCity): ?>
                                    <i class="fas fa-check-circle check-icon"></i>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- Side Menu -->
        <div class="menu-overlay" id="menuOverlay">
            <div class="menu-background" onclick="toggleMenu()"></div>
            <div class="side-menu">
                <div class="menu-header">
                    <i class="fas fa-mosque"></i>
                    <h2 class="menu-title">Времена за Намаз</h2>
                </div>
                
                <div class="menu-items">
                    <a href="index.php" class="menu-btn">
                        <i class="fas fa-calendar-alt"></i>
                        <span class="menu-text">Месечен Преглед</span>
                    </a>
                    
                    <a href="live.php" class="menu-btn">
                        <i class="fas fa-clock"></i>
                        <span class="menu-text">Живо Отброяване</span>
                    </a>
                    <a href="users.php" class="menu-btn">
                        <i class="fas fa-clock"></i>
                        <span class="menu-text">Потребители</span>
                    </a>
                    
            
                </div>
                
                <div class="menu-footer">
                    <button class="menu-close-btn" onclick="toggleMenu()">
                        Затвори
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="js/live.js"></script>
</body>
</html>