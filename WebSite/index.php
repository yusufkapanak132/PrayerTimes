<?php
if (isset($_SERVER['REQUEST_URI'])) {
    $uri = $_SERVER['REQUEST_URI'];
    
    if (strpos($uri, '&') !== false && strpos($uri, '?') === false) {
        $new_uri = preg_replace('/^([^&]+)&/', '$1?', $uri);
        
        if ($new_uri !== $uri) {
            header("Location: " . $new_uri);
            exit;
        }
    }
}
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
if (isset($_SESSION['user_id'])) {
    header("Cache-Control: no-cache, no-store, must-revalidate");
    header("Pragma: no-cache");
    header("Expires: 0");
}

include 'includes/config.php';
include 'includes/functions.php';
include 'hijri_calculator.php';

$isLoggedIn = isset($_SESSION['user_id']) && $_SESSION['user_id'] > 0;
$user_id = $_SESSION['user_id'] ?? null;

$settings = ['contrast' => 0, 'large_text' => 0, 'daltonism' => 0];

if ($user_id) {
    $settings = [
        'contrast' => $_SESSION['contrast'] ?? 0,
        'large_text' => $_SESSION['large_text'] ?? 0,
        'daltonism' => $_SESSION['daltonism'] ?? 0
    ];
}

$selectedCity = $_SESSION['city'] ?? 'София';

if (isset($_SESSION['user_data']['language'])) {
    $user_language = $_SESSION['user_data']['language'];
} else {
    $user_language = $_GET['lang'] ?? 'bg';
}

$currentMonth = $_GET['month'] ?? date('n');
$currentYear = $_GET['year'] ?? date('Y');
$currentHijri = HijriCalendar::getCurrentHijriDate('bg');

$body_classes_array = [];
$static_classes = 'main-body-class dark-mode';

if (isset($settings['contrast']) && $settings['contrast'] == 1) {
    $body_classes_array[] = 'contrast-mode';
}
if (isset($settings['large_text']) && $settings['large_text'] == 1) {
    $body_classes_array[] = 'large-text-mode';
}
if (isset($settings['daltonism']) && $settings['daltonism'] == 1) {
    $body_classes_array[] = 'daltonism-mode';
}
$body_class_string = $static_classes . ' ' . implode(' ', $body_classes_array);
$body_class_string = trim($body_class_string);


// Избран град
$selectedCity = $_GET['city'] ?? 'София';

// 1. Изграждаме пълния URL към api.php за XAMPP
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
$host = $_SERVER['HTTP_HOST'];
$base_dir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
$apiUrl = $protocol . "://" . $host . $base_dir . "/api.php?city=" . urlencode($selectedCity);

// 2. Правим HTTP заявка чрез cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

// ЗА XAMPP: Изключваме проверката за SSL сертификат (много важно за локална среда)
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$json = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Проверка за cURL грешки (ако XAMPP няма активиран cURL)
if (curl_errno($ch)) {
    die("cURL Грешка (XAMPP): " . curl_error($ch) . " - Увери се, че extension=curl е размаркиран в php.ini");
}
curl_close($ch);

// 3. Декодираме данните
if ($httpCode == 200 && $json) {
    $apiData = json_decode($json, true);
    
    // API-то връща ['city' => ..., 'data' => ...], така че проверяваме дали 'data' съществува
    if (!$apiData || !isset($apiData['data'])) {
        die("Грешка: Невалидна структура на данните от API. Отговор: " . htmlspecialchars($json));
    }
} else {
    die("Грешка при връзка с API. HTTP Код: " . $httpCode . "<br>Опит за връзка с: " . htmlspecialchars($apiUrl));
}

// Подготвяме данните за таблицата
$prayerData = [
    $selectedCity => $apiData['data']
];

if (isset($_SESSION['user_id']) && isset($_SESSION['city'])) {
    $selectedCity = $_SESSION['city'];
} else {
    $selectedCity = $_GET['city'] ?? 'София';
}
$_SESSION['selected_city'] = $selectedCity;

$monthsInBulgarian = [
    1 => 'Януари', 2 => 'Февруари', 3 => 'Март', 4 => 'Април',
    5 => 'Май', 6 => 'Юни', 7 => 'Юли', 8 => 'Август',
    9 => 'Септември', 10 => 'Октомври', 11 => 'Ноември', 12 => 'Декември'
];
$currentMonthName = $monthsInBulgarian[(int)$currentMonth];
$currentYear = $_GET['year'] ?? date('Y');
$cities = array_keys($prayerData);
$monthDates = getMonthDates($currentYear, $currentMonth);
$cart = $_SESSION['cart'] ?? [];
// Пълен списък с всички поддържани градове
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

// Вземаме избрания град от URL (както направихме в предишната стъпка)
if (isset($_GET['city']) && trim($_GET['city']) !== '') {
    $selectedCity = trim($_GET['city']);
} else {
    $selectedCity = 'София';
}

// Защита: Ако някой въведе невалиден град в URL-а, връщаме го към София
if (!in_array($selectedCity, $cities)) {
    $selectedCity = 'София';
}
?>
<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-translate="pageTitle">Времена за Намаз</title>
    <link rel="stylesheet" href="css/style.css?v=<?php echo filemtime('css/style.css'); ?>">
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
    
    <script>
if ('serviceWorker' in navigator) {
    document.addEventListener('DOMContentLoaded', function() {
        navigator.serviceWorker.register('./sw.js')
            .then(function(registration) {
                console.log('✅ Service Worker регистриран успешно с обхват:', registration.scope);
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 Нов Service Worker се инсталира...');
                    newWorker.addEventListener('statechange', () => {
                        console.log('Service Worker статус:', newWorker.state);
                    });
                });
                if (navigator.serviceWorker.controller) {
                    console.log('📱 Страницата се контролира от Service Worker');
                }
            })
            .catch(function(error) {
                console.error('❌ ServiceWorker регистрация грешка:', error);
            });

        navigator.serviceWorker.addEventListener('controllerchange', function() {
            console.log('🔄 Service Worker контролер се променя, презареждане...');
            window.location.reload();
        });
    });
} else {
    console.warn('⚠️ Service Worker не се поддържа от този браузър');
}
</script>
</head>
<body class="<?php echo $body_class_string; ?>">
    <!-- Header -->
    <header class="header container">
        <a href="index.php" class="logo">
            <i class="fas fa-mosque"></i>
            <span data-translate="appName">Времена за Намаз</span>
        </a>
        
        <!-- Езиков селектор -->
        <div class="header-language">
            <?php $lang = $_SESSION['language'] ?? 'bg'; ?>
            <button class="lang-btn <?php echo ($lang == 'bg') ? 'active' : ''; ?>" data-lang="bg">
                <span class="flag">🇧🇬</span>
                <span class="lang-text">Български</span>
            </button>
            <button class="lang-btn <?php echo ($lang == 'en') ? 'active' : ''; ?>" data-lang="en">
                <span class="flag">🇺🇸</span>
                <span class="lang-text">English</span>
            </button>
            <button class="lang-btn <?php echo ($lang == 'tr') ? 'active' : ''; ?>" data-lang="tr">
                <span class="flag">🇹🇷</span>
                <span class="lang-text">Türkçe</span>
            </button>
            <button class="lang-btn <?php echo ($lang == 'ar') ? 'active' : ''; ?>" data-lang="ar">
                <span class="flag">🇸🇦</span>
                <span class="lang-text">العربية</span>
            </button>
        </div>
        
        <nav class="nav-links">
            <a href="index.php" class="nav-link active">
                <i class="fas fa-calendar-alt"></i> <span data-translate="calendar">Месечен Преглед</span>
            </a>
            <a href="live.php" class="nav-link">
                <i class="fas fa-clock"></i> <span data-translate="live">Живо Отброяване</span>
            </a>
            <?php if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true): ?>
                <a href="users.php" class="nav-link">
                    <i class="fa-solid fa-user"></i> <span data-translate="users">Потребители</span>
                </a>
            <?php endif; ?>
            <a href="#" class="nav-link" id="cartBtn">
                <i class="fas fa-shopping-cart"></i>
                <span data-translate="cart">Количка</span>
                <?php if (!empty($cart)): ?>
                    <span class="cart-count"><?php echo count($cart); ?></span>
                <?php endif; ?>
            </a>
        </nav>
    </header>

    <main class="container">
        <!-- Избор на град -->
        <div class="city-selector">
            <label for="citySelect"><i class="fas fa-city"></i> <span data-translate="selectCity">Изберете град:</span></label>
            <select id="citySelect" class="city-select">
                <?php foreach ($cities as $city): ?>
                    <option value="<?php echo $city; ?>" <?php echo ($city == $selectedCity) ? 'selected' : ''; ?>>
                        <?php echo $city; ?>
                    </option>
                <?php endforeach; ?>
            </select>
            
            <div class="city-actions">
                <button class="city-action-btn" onclick="useMyLocation()">
                    <i class="fas fa-location-arrow"></i> <span data-translate="myLocation">Моята локация</span>
                </button>
            </div>
        </div>

        <div class="main-content">
            <!-- Лява страна -->
            <aside class="side-panel">
                <h2 class="panel-title"><i class="fab fa-android"></i> <span data-translate="androidApp">Android Приложение</span></h2>
                <div class="download-card">
                    <i class="fab fa-android"></i>
                    <h3 data-translate="appName">Времена за Намаз</h3>
                    <p data-translate="fullAccess">Пълен достъп до всички функции</p>
                    <div class="app-features">
                        <span class="feature-tag" data-translate="accurateTimes">Точни Времена</span>
                        <span class="feature-tag" data-translate="offlineSupport">Офлайн</span>
                        <span class="feature-tag" data-translate="notifications">Известия</span>
                        <span class="feature-tag" data-translate="voiceReading">Гласово четене</span>
                        <span class="feature-tag" data-translate="multilingual">Многоезичност</span>
                    </div>
                    <a href="assets/Времена за Намаз.apk" class="download-btn" download>
                        <i class="fas fa-download"></i> <span data-translate="downloadAPK">Изтегли APK (80MB)</span>
                    </a>
                </div>
                
                <!-- Настройки за достъпност -->
                <div class="accessibility-options">
                    <button class="acc-btn <?php echo (isset($_SESSION['contrast']) && $_SESSION['contrast'] == 1) ? 'active' : ''; ?>" data-action="contrast">
                        <i class="fas fa-adjust"></i> <span data-translate="highContrast">Висок контраст</span>
                    </button>
                    <button class="acc-btn <?php echo (isset($_SESSION['large_text']) && $_SESSION['large_text'] == 1) ? 'active' : ''; ?>" data-action="large-text">
                        <i class="fas fa-text-height"></i> <span data-translate="largeText">Голям текст</span>
                    </button>
                    <button class="acc-btn" data-action="read-aloud">
                        <i class="fas fa-volume-up"></i> <span data-translate="voiceReading">Гласово четене</span>
                    </button>
                    <button class="acc-btn <?php echo (isset($_SESSION['daltonism']) && $_SESSION['daltonism'] == 1) ? 'active' : ''; ?>" data-action="simulate-colorblind">
                        <i class="fas fa-eye"></i> <span data-translate="colorBlind">Далтонизъм</span>
                    </button>
                </div>
                
                <!-- Бърза статистика -->
                <div class="quick-stats-panel">
                    <h4><i class="fas fa-chart-pie"></i> <span data-translate="dailyStats">Дневна статистика</span></h4>
                    <div class="quick-stats-grid">
                        <div class="quick-stat">
                            <div class="quick-stat-value" id="quickFastingHours">--</div>
                            <div class="quick-stat-label" data-translate="fastingHours">часа постинг</div>
                        </div>
                        <div class="quick-stat">
                            <div class="quick-stat-value" id="quickDaylightHours">--</div>
                            <div class="quick-stat-label" data-translate="daylightHours">продължителност на деня</div>
                        </div>
                        <div class="quick-stat">
                            <div class="quick-stat-value" id="quickTimeToNext">--</div>
                            <div class="quick-stat-label" data-translate="nextPrayerTime">до следваща молитва</div>
                        </div>
                    </div>
                    <button class="view-full-stats-btn" onclick="showFullAnalytics()">
                        <i class="fas fa-chart-line"></i> <span data-translate="fullAnalytics">Пълна аналитика</span>
                    </button>
                    <div class="desktop-app-card">
                        <h4><i class="fas fa-desktop"></i> <span data-translate="desktopVersion">Desktop версия</span></h4>
                        <span><i class="fab fa-windows"></i></span>
                        <p data-translate="desktopDescription">Пълна версия за Windows 10/11</p>
                        <div class="desktop-features"></div>
                        <a href="assets/PrayerTimesApp_Setup.exe" class="download-btn desktop" download>
                            <i class="fas fa-download"></i> <span data-translate="downloadWindows">Изтегли за Windows</span>
                        </a>
                    </div>
                    <div class="desktop-app-card">
                        <h4><i class="fas fa-android"></i> <span data-translate="GooglePlayVersion">Google Play изтегляне</span></h4>
                        <span><i class="fab fa-android"></i></span>
                        <p data-translate="GooglePlayDescription">AAB версия</p>
                        <div class="desktop-features"></div>
                        <a href="https://play.google.com/store/apps/details?id=com.thedevil131.PrayerTimes" class="download-btn desktop" download>
                            <i class="fas fa-download"></i> <span data-translate="downloadGooglePlay">Изтегли от Google Play</span>
                        </a>
                    </div>
                </div>
            </aside>

            <!-- Център: Таблица -->
            <div class="prayer-table-container">
                <div class="month-header">
                    <div class="month-nav">
                        <a href="?city=<?php echo $selectedCity; ?>&month=<?php echo ($currentMonth == 1) ? 12 : $currentMonth - 1; ?>&year=<?php echo ($currentMonth == 1) ? $currentYear - 1 : $currentYear; ?>" class="month-btn">
                            <i class="fas fa-chevron-left"></i>
                        </a>
                        <span class="current-month">
                            <?php echo $monthsInBulgarian[$currentMonth] . " " . $currentYear; ?>
                        </span>
                        <a href="?city=<?php echo $selectedCity; ?>&month=<?php echo ($currentMonth == 12) ? 1 : $currentMonth + 1; ?>&year=<?php echo ($currentMonth == 12) ? $currentYear + 1 : $currentYear; ?>" class="month-btn">
                            <i class="fas fa-chevron-right"></i>
                        </a>
                    </div>

                    <div class="current-date">
                        <i class="fas fa-calendar-day"></i>
                        <span data-translate="today">Днес:</span> <?php echo date('d.m.Y'); ?>
                        <span class="today-hijri" id="todayHijri">
                            <?php if (isset($currentHijri) && is_array($currentHijri) && isset($currentHijri['formatted'])) {
                                echo '(' . htmlspecialchars($currentHijri['formatted']) . ')';
                            } else {
                                echo '(' . htmlspecialchars($currentHijri['formatted'] ?? 'Изчислява се...') . ')';
                            } ?>
                        </span>
                    </div>
                    
                    <div class="table-actions">
                        <button class="table-action-btn" onclick="printTable()" data-translate-title="printTable" title="Принтирай таблицата">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="table-action-btn" onclick="exportToExcel()" data-translate-title="printTable" title="Експортиране на таблица">
                            <i class="fas fa-file-excel"></i>
                        </button>
                        <button class="table-action-btn" onclick="readMonthAloud()" data-translate-title="voiceReading" title="Гласово четене">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                </div>

                <table class="prayer-table">
                    <thead>
                        <tr>
                            <th data-translate="date">Дата</th>
                            <th data-translate="day">Ден</th>
                            <th><i class="fa-regular fa-moon" title="Фаджр"></i> <span data-translate="fajr">Зора</span></th>
                            <th><i class="fa-regular fa-sun" title="Изгрев слънце"></i> <span data-translate="sunrise">Изгрев</span></th>
                            <th><i class="fas fa-sun" title="Зухр/Джума"></i> <span data-translate="dhuhr">Обяд</span></th>
                            <th><i class="fas fa-cloud-sun" title="Аср"></i> <span data-translate="asr">Следобяд</span></th>
                            <th><i class="fa-regular fa-moon" title="Магриб"></i> <span data-translate="maghrib">Залез</span></th>
                            <th><i class="fas fa-moon" title="Иша"></i> <span data-translate="isha">Нощ</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $order = ["Зора", "Изгрев", "Обяд", "Следобяд", "Залез", "Нощ"];
                        $today = getCurrentDate();
                        
                        foreach ($monthDates as $date): 
                            $isToday = ($date == $today);
                            $cityTimes = $prayerData[$selectedCity][$date] ?? null;
                            $weekday = getWeekday($date);
                            $isFriday = (date('N', strtotime($date)) == 5);
                        ?>
                        <tr class="<?php echo $isToday ? 'current-day' : ''; ?>">
                            <td class="date-cell">
                                <?php echo date('d.m', strtotime($date)); ?>
                                <?php if ($isToday): ?>
                                    <span class="today-badge" data-translate="today">ДНЕС</span>
                                <?php endif; ?>
                            </td>
                            <td class="day-cell <?php echo $isFriday ? 'friday' : ''; ?>">
                                <span data-translate="<?php echo strtolower($weekday); ?>"><?php echo ucfirst($weekday); ?></span>
                                <?php if ($isFriday): ?>
                                    <i class="fas fa-star" title="Джума ден"></i>
                                <?php endif; ?>
                            </td>
                            <?php foreach ($order as $prayer): ?>
                                <?php
                                $prayerTime = '';
                                $prayerClass = '';
                                
                                if ($cityTimes && isset($cityTimes[$prayer])) {
                                    $prayerTime = formatTime($cityTimes[$prayer]);
                                    
                                    if ($prayer == 'Обяд' && $isFriday) {
                                        $prayerClass = 'friday-prayer';
                                    } elseif ($prayer == 'Зора') {
                                        $prayerClass = 'fajr-time';
                                    } elseif ($prayer == 'Нощ') {
                                        $prayerClass = 'isha-time';
                                    }
                                } else {
                                    $prayerTime = '--:--';
                                }
                                ?>
                                <td class="prayer-time <?php echo $prayerClass; ?>" 
                                    data-prayer="<?php echo $prayer; ?>"
                                    data-date="<?php echo $date; ?>"
                                    data-time="<?php echo $prayerTime; ?>">
                                    <?php echo $prayerTime; ?>
                                    
                                    <?php if ($isToday && $prayerTime != '--:--'): ?>
                                        <?php
                                        $prayerDateTime = new DateTime($date . ' ' . $prayerTime);
                                        $now = new DateTime();
                                        if ($prayerDateTime < $now) {
                                            echo '<span class="passed-indicator" title="Минала молитва"><i class="fas fa-check-circle"></i></span>';
                                        } elseif (($prayerDateTime->getTimestamp() - $now->getTimestamp()) < 3600) {
                                            echo '<span class="upcoming-indicator" title="Скоро"><i class="fas fa-clock"></i></span>';
                                        }
                                        ?>
                                    <?php endif; ?>
                                </td>
                            <?php endforeach; ?>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                
                <div class="table-footer">
                    <div class="legend">
                        <div class="legend-item">
                            <span class="legend-color current-day"></span>
                            <span data-translate="todayDay">Днешен ден</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color friday-prayer"></span>
                            <span data-translate="fridayPrayer">Джума (петък)</span>
                        </div>
                        <div class="legend-item">
                            <i class="fas fa-check-circle" style="color:#38b000"></i>
                            <span data-translate="passedPrayer">Минала молитва</span>
                        </div>
                        <div class="legend-item">
                            <i class="fas fa-clock" style="color:#ffa726"></i>
                            <span data-translate="upcomingPrayer">Скоро ще дойде</span>
                        </div>
                    </div>
                    
                    <div class="summary-stats">
                        <div class="summary-stat">
                            <strong data-translate="totalRecords">Общо записи:</strong> <?php echo count($monthDates); ?> <span data-translate="days">дни</span>
                        </div>
                        <div class="summary-stat">
                            <strong data-translate="fridayCountTable">Джума дни:</strong> 
                            <?php
                            $fridayCount = 0;
                            foreach ($monthDates as $date) {
                                if (date('N', strtotime($date)) == 5) $fridayCount++;
                            }
                            echo $fridayCount;
                            ?>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Дясна страна -->
            <aside class="side-panel">
                <h2 class="panel-title"><i class="fab fa-apple"></i> <span data-translate="iosApp">iOS Приложение</span></h2>
                <div class="download-card">
                    <i class="fab fa-apple"></i>
                    <h3 data-translate="appName">Времена за Намаз</h3>
                    <p data-translate="forDevices">За iPhone & iPad</p>
                    <div class="app-features">
                        <span class="feature-tag" data-translate="accurateTimes">Точни Времена</span>
                        <span class="feature-tag" data-translate="offlineSupport">Офлайн</span>
                        <span class="feature-tag" data-translate="notifications">Известия</span>
                        <span class="feature-tag" data-translate="voiceReading">Гласово четене</span>
                        <span class="feature-tag" data-translate="multilingual">Многоезичност</span>
                    </div>
                    <a href="assets/Времена за Намаз.apk" class="download-btn" download>
                        <i class="fas fa-download"></i> <span data-translate="downloadIPA">Изтегли IPA (80MB)</span>
                    </a>
                </div>

                <div class="product-showcase">
                    <h2 class="panel-title"><i class="fas fa-smartwatch"></i> <span data-translate="smartWatch">Намаз часовник</span></h2>
                    <div class="product-image-container">
                        <img src="assets/watch.jpg" alt="Умен часовник за намаз" class="product-image">
                        <div class="product-badge" data-translate="new">НОВО</div>
                    </div>
                    <h3 class="product-title" data-translate="smartWatch">Часовник за Намази</h3>
                    <div class="product-rating">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                        <span class="rating-text">4.7/5 (128 <span data-translate="reviews">ревюта</span>)</span>
                    </div>
                    <div class="product-description">
                        <p><strong data-translate="speciallyDesigned">Специално разработен за мюсюлмани</strong> <span data-translate="withFeatures">с интелигентни функции:</span></p>
                        <ul>
                            <li><i class="fas fa-bell"></i> <strong data-translate="autoNotifications">Автоматични известия</strong></li>
                            <li><i class="fas fa-compass"></i> <strong data-translate="builtInCompass">Вграден компас</strong></li>
                            <li><i class="fas fa-sun"></i> <strong data-translate="autoUpdate">Автоматично актуализиране</strong></li>
                            <li><i class="fas fa-battery-full"></i> <strong data-translate="batteryLife">7 дни батерия</strong></li>
                            <li><i class="fas fa-tint"></i> <strong data-translate="waterResistant">Водоустойчив</strong></li>
                            <li><i class="fas fa-heartbeat"></i> <strong data-translate="monitor">Монитор</strong></li>
                            <li><i class="fas fa-wifi"></i> <strong>Wi-Fi</strong></li>
                            <li><i class="fas fa-bluetooth"></i> <strong>Bluetooth</strong></li>
                        </ul>
                    </div>
                    <div class="product-price-container">
                        <div class="old-price">130 <span data-translate="currency">евро</span></div>
                        <div class="product-price">
                            <span class="price-amount">80</span>
                            <span class="price-currency" data-translate="currency">евро</span>
                        </div>
                        <div class="price-save" data-translate="saveAmount">Спестявате 50 евро!</div>
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="addToCart('watch')">
                            <i class="fas fa-cart-plus"></i>
                            <span data-translate="addToCart">Добави в количка</span>
                        </button>
                    </div>
                    
                    <div class="product-details">
                        <div class="detail-item">
                            <i class="fas fa-shipping-fast"></i>
                            <span data-translate="freeShipping">Безплатна доставка за България</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-undo"></i>
                            <span data-translate="returnPolicy">14-дневна гаранция за връщане</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-shield-alt"></i>
                            <span data-translate="warranty">2 години гаранция</span>
                        </div>
                    </div>
                </div>
                <br>
                <div class="advanced-features-row">
                    <div class="gps-widget">
                        <div class="gps-header">
                            <i class="fas fa-map-marker-alt"></i>
                            <h4 data-translate="gpsTitle">GPS Локация & Кибла Компас</h4>
                        </div>
                        <div class="gps-content">
                            <div class="location-info">
                                <div class="location-status">
                                    <i class="fas fa-satellite"></i>
                                    <span id="locationText" data-translate="gpsClick">Кликнете за локация</span>
                                </div>
                                <div class="detected-city" id="detectedCity"></div>
                            </div>
                            
                            <div class="compass-container">
                                <div class="compass-info">
                                    <div class="qibla-direction">
                                        <i class="fas fa-kaaba"></i>
                                        <span data-translate="qibla">Кибла:</span> <span id="qiblaDegrees">135°</span> <span data-translate="southeast">ЮИ</span>
                                    </div>
                                    <div class="distance-to-makkah">
                                        <i class="fas fa-road"></i>
                                        <span data-translate="distanceToMakkah">До Мека:</span> <span id="distanceMakkah">~2500 км</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button class="btn-gps" id="refreshLocation">
                                <i class="fas fa-sync-alt"></i> <span data-translate="getLocation">Определи моята локация</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
        
        <!-- АНАЛИТИКА СЕКЦИЯ -->
        <div class="analytics-section" id="analyticsSection" style="display: none;">
            <div class="section-header">
                <i class="fas fa-chart-line"></i>
                <h2 data-translate="analytics">Аналитика и Статистика</h2>
                <button class="close-analytics" onclick="hideFullAnalytics()">&times;</button>
            </div>
            
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h4><i class="fas fa-clock"></i> <span data-translate="dayDistribution">Разпределение на деня</span></h4>
                    <div class="chart-container">
                        <canvas id="dayDistributionChart" width="400" height="300"></canvas>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4><i class="fas fa-sun"></i> <span data-translate="daylightDuration">Продължителност на деня</span></h4>
                    <div class="chart-container">
                        <canvas id="daylightChart" width="400" height="300"></canvas>
                    </div>
                    <div class="chart-stats">
                        <div class="chart-stat">
                            <div class="stat-label" data-translate="longestDay">Най-дълъг ден:</div>
                            <div class="stat-value" id="longestDay">16ч 30м</div>
                        </div>
                        <div class="chart-stat">
                            <div class="stat-label" data-translate="shortestDay">Най-къс ден:</div>
                            <div class="stat-value" id="shortestDay">9ч 05м</div>
                        </div>
                        <div class="chart-stat">
                            <div class="stat-label" data-translate="longestFasting">Най-дълъг постинг:</div>
                            <div class="stat-value" id="longestFasting">--</div>
                        </div>
                        <div class="chart-stat">
                            <div class="stat-label" data-translate="shortestFasting">Най-къс постинг:</div>
                            <div class="stat-value" id="shortestFasting">--</div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4><i class="fas fa-moon"></i> <span data-translate="fastingTime">Време за постинг</span></h4>
                    <div class="fasting-analytics">
                        <div class="fasting-stat">
                            <div class="stat-icon"><i class="fas fa-clock"></i></div>
                            <div class="stat-content">
                                <div class="stat-value" id="analyticsFastingHours">--</div>
                                <div class="stat-label" data-translate="fastingHoursToday">часа постинг днес</div>
                            </div>
                        </div>
                        <div class="fasting-stat">
                            <div class="stat-icon"><i class="fas fa-utensils"></i></div>
                            <div class="stat-content">
                                <div class="stat-value" id="analyticsEatingWindow">--</div>
                                <div class="stat-label" data-translate="eatingWindow">часа за хранене</div>
                            </div>
                        </div>
                        <div class="fasting-progress">
                            <div class="progress-label" data-translate="dayProgress">Прогрес на деня:</div>
                            <div class="progress-bar">
                                <div class="progress-fill" id="fastingProgress" style="width: 50%"></div>
                            </div>
                            <div class="progress-text" id="fastingProgressText">50%</div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4><i class="fas fa-calendar-alt"></i> <span data-translate="monthlyStats">Месечна статистика</span></h4>
                    <div class="monthly-stats">
                        <div class="stat-row">
                            <div class="stat-label" data-translate="earliestFajr">Най-ранна зора:</div>
                            <div class="stat-value" id="earliestFajr">--:--</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label" data-translate="latestIsha">Най-късна нощна:</div>
                            <div class="stat-value" id="latestIsha">--:--</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label" data-translate="avgDayLength">Средна продължителност:</div>
                            <div class="stat-value" id="avgDayLength">--ч</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label" data-translate="fridayCount">Джума дни:</div>
                            <div class="stat-value" id="fridayCount">--</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label" data-translate="monthChange">Промяна от миналия месец:</div>
                            <div class="stat-value" id="monthChange">+0.5ч</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Сравнение между градове -->
        <div class="analytics-card" style="margin-top: 20px;">
            <h4><i class="fas fa-city"></i> <span data-translate="cityComparison">Сравнение между градове</span></h4>
            <div class="city-comparison-controls">
                <div class="form-group">
                    <label for="compareCity1" data-translate="firstCity">Първи град:</label>
                    <select id="compareCity1" class="form-control">
                        <?php foreach ($cities as $city): ?>
                            <option value="<?php echo $city; ?>" <?php echo ($city == 'София') ? 'selected' : ''; ?>>
                                <?php echo $city; ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label for="compareCity2" data-translate="secondCity">Втори град:</label>
                    <select id="compareCity2" class="form-control">
                        <?php foreach ($cities as $city): ?>
                            <option value="<?php echo $city; ?>" <?php echo ($city == 'Пловдив') ? 'selected' : ''; ?>>
                                <?php echo $city; ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <button class="compare-btn" onclick="window.analyticsModule?.updateCityComparison()">
                    <i class="fas fa-sync-alt"></i> <span data-translate="updateComparison">Актуализирай сравнението</span>
                </button>
            </div>
            <div class="chart-container">
                <canvas id="cityComparisonChart" width="400" height="300"></canvas>
            </div>
        </div>
    </main>

    <!-- PWA инсталационен бутон -->
    <div class="pwa-install-container" id="pwaInstallContainer">
        <button id="installPWA" class="pwa-install-btn">
            <i class="fas fa-download"></i> <span data-translate="installApp">Инсталирай приложението</span>
        </button>
    </div>
    
    <!-- Количка -->
    <div class="cart-container" id="cartContainer">
        <div class="cart-header">
            <h2 class="cart-title"><i class="fas fa-shopping-cart"></i> <span data-translate="cart">Количка</span></h2>
            <button class="close-cart" onclick="closeCart()">&times;</button>
        </div>
        <div class="cart-items" id="cartItems"></div>
        <div class="cart-summary">
            <div class="cart-summary-row">
                <span data-translate="subtotal">Междинна сума:</span>
                <span id="cartSubtotal">0.00 <span data-translate="currency">лв.</span></span>
            </div>
            <div class="cart-summary-row">
                <span data-translate="shipping">Доставка:</span>
                <span id="cartShipping">0.00 <span data-translate="currency">лв.</span></span>
            </div>
            <div class="cart-summary-row total">
                <span data-translate="total">Общо:</span>
                <span id="cartTotal">0.00 <span data-translate="currency">лв.</span></span>
            </div>
        </div>
        <button class="checkout-btn" onclick="openCheckout()">
            <i class="fas fa-lock"></i> <span data-translate="proceedToCheckout">Продължи към плащане</span>
        </button>
    </div>

    <!-- Поръчка форма -->
    <div class="modal-overlay" id="checkoutModal" style="display: none;">
        <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
            <div style="text-align: right;">
                <button onclick="closeCheckout()" style="background: none; border: none; color: #fff; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            <h2 class="modal-title" data-translate="completeOrder">Завършване на поръчката</h2>
            <form id="orderForm">
                <div class="form-group">
                    <label for="name" data-translate="fullName">Име и Фамилия:</label>
                    <input type="text" id="name" class="form-control" required 
                           data-translate-placeholder="fullName" placeholder="Име и Фамилия">
                </div>
                <div class="form-group">
                    <label for="email" data-translate="emailAddress">Имейл адрес:</label>
                    <input type="email" id="email" class="form-control" required 
                           data-translate-placeholder="emailAddress" placeholder="Имейл адрес">
                </div>
                <div class="form-group">
                    <label for="phone" data-translate="phoneNumber">Телефонен номер:</label>
                    <input type="tel" id="phone" class="form-control" required 
                           data-translate-placeholder="phoneNumber" placeholder="Телефонен номер">
                </div>
                
                <div class="form-group">
                    <label for="deliveryMethod" data-translate="deliveryMethod">Начин на доставка:</label>
                    <select id="deliveryMethod" class="form-control" required>
                        <option value="" data-translate="chooseDelivery">Изберете начин на доставка</option>
                        <option value="Адрес" data-translate="toAddress">До адрес</option>
                        <option value="Офис" data-translate="toOffice">До офис</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="address" id="addressLabel" data-translate="deliveryAddress">Адрес за доставка:</label>
                    <textarea id="address" class="form-control" rows="3" required 
                        data-translate-placeholder="deliveryAddress" placeholder="Въведете пълен адрес за доставка"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="city" data-translate="city">Град:</label>
                    <input type="text" id="city" class="form-control" required 
                        data-translate-placeholder="city" placeholder="Въведете град">
                </div>
                
                <div class="order-summary">
                    <h4><i class="fas fa-receipt"></i> <span data-translate="orderDetails">Детайли на поръчката:</span></h4>
                    <div id="checkoutItems"></div>
                    <div class="order-total">
                        <div data-translate="totalAmount">Обща сума:</div>
                        <div class="total-amount">
                            <span id="checkoutTotal">0.00</span> <span data-translate="currency">лв.</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="checkout-btn">
                        <i class="fas fa-paper-plane"></i> <span data-translate="submitOrder">Изпрати поръчка</span>
                    </button>
                    <button type="button" class="cancel-btn" onclick="closeCheckout()">
                        <i class="fas fa-times"></i> <span data-translate="cancel">Отказ</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <footer class="footer container">
        <div class="footer-content">
            <div class="footer-section">
                <h4><i class="fas fa-info-circle"></i> <span data-translate="aboutProject">За проекта</span></h4>
                <p data-translate="projectDescription">Времена за Намаз е интелигентна платформа за молитвени времена с GPS локация, пълна аналитика и офлайн поддръжка.</p>
            </div>
            <div class="footer-section">
                <h4><i class="fas fa-code"></i> <span data-translate="technologies">Технологии</span></h4>
                <p data-translate="techStack">HTML5, CSS3, JavaScript (ES6+), PHP 8, MySQL, Chart.js, PWA, Service Workers, Geolocation API, RESTful API, HTTP Requests</p>
            </div>
            <div class="footer-section">
                <h4><i class="fas fa-medal"></i> <span data-translate="olympiad">Олимпиада</span></h4>
                <p data-translate="olympiadDescription">Проект за Национална олимпиада по информатика 2026.</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 Времена за Намаз <span data-translate="allRights">Всички права запазени.</span> | 
            <span data-translate="developer">Свържете се с разработчика: yusuf.kapanak@pmggd.bg - Юсуф Капанък</span> |
                <a href="https://docs.google.com/document/d/1IP9SFPunf5mMkrU9MulNHinxVWTEGEqcK4jEKPp0_XY/edit?usp=sharing" data-translate="projectDetails">Детайли за проекта</a> | 
                <a href="https://docs.google.com/document/d/1rR8ywwAEUOpzkNSarWPvbBWo1VllVKtNR4NBRvD0iA8/edit?usp=sharing" data-translate="techDocs">Техническа документация</a>
            </p>
        </div>
    </footer>
    
    <script>
function updateAccessibilityButtonsState() {
    const bodyClassList = document.body.classList;
    document.querySelectorAll(".acc-btn").forEach(btn => {
        const action = btn.dataset.action;
        let className = "";
        switch(action) {
            case "contrast": className = "contrast-mode"; break;
            case "large-text": className = "large-text-mode"; break;
            case "simulate-colorblind": className = "daltonism-mode"; break;
            default: return;
        }
        if (bodyClassList.contains(className)) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

function showUserMenu() {
 
    const style = document.createElement('style');
    style.textContent = `
        .user-menu { position: relative; display: inline-block; }
        .user-name { background: rgba(56,176,0,0.2); border: 1px solid #38b000; border-radius: 30px; padding: 8px 20px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; transition: all 0.3s ease; }
        .user-name:hover { background: #38b000; }
        .user-dropdown { position: absolute; top: calc(100% + 10px); right: 0; background: #1a1a1a; border: 2px solid #38b000; border-radius: 15px; min-width: 200px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); opacity: 0; visibility: hidden; transform: translateY(-10px); transition: all 0.3s ease; z-index: 1000; overflow: hidden; }
        .user-menu:hover .user-dropdown { opacity: 1; visibility: visible; transform: translateY(0); }
        .dropdown-item { display: flex; align-items: center; gap: 12px; padding: 15px 20px; color: white; text-decoration: none; transition: all 0.3s ease; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 500; }
        .dropdown-item:last-child { border-bottom: none; }
        .dropdown-item:hover { background: rgba(56,176,0,0.2); padding-left: 25px; }
        .dropdown-item i { color: #38b000; font-size: 16px; width: 20px; text-align: center; }
        .dropdown-item:last-child i { color: #ff6b6b; }
        body.rtl-layout .user-dropdown { right: auto; left: 0; }
        body.rtl-layout .dropdown-item { flex-direction: row-reverse; }
        @media (max-width: 768px) { 
            .user-menu { width: 100%; } 
            .user-name { justify-content: center; } 
            .user-dropdown { position: static; width: 100%; margin-top: 10px; opacity: 1; visibility: visible; transform: none; display: none; } 
            .user-menu:hover .user-dropdown { display: block; } 
        }
    `;
    document.head.appendChild(style);
    
    // След това добавяме HTML менюто
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks || document.querySelector('.user-menu')) return; 
    
    const userName = "<?php echo isset($_SESSION['user_name']) ? addslashes($_SESSION['user_name']) : 'Потребител'; ?>";
    const user_id_string = "<?php echo $_SESSION['user_id'] ?? ''; ?>";
    const loggedIn = user_id_string.length > 0;
    
    if (loggedIn) {
        const userMenuHTML = `
            <div class="user-menu">
                <span class="nav-link user-name">
                    <i class="fas fa-user"></i> ${userName}
                </span>
                <div class="user-dropdown">
                
                    <a href="admin-dashboard.php" class="dropdown-item">
                        <i class="fas fa-cog"></i> <span data-translate="settings">Настройки</span>
                    </a>
                    <a href="logout.php" class="dropdown-item">
                        <i class="fas fa-sign-out-alt"></i> <span data-translate="logout">Изход</span>
                    </a>
                </div>
            </div>
        `;
        navLinks.insertAdjacentHTML('beforeend', userMenuHTML);
    }
}

function readMonthAloud() {
    if (window.readPrayerTimes) {
        window.readPrayerTimes();
    } else {
        console.error('readPrayerTimes функцията не е налична');
    }
}

function buildUrl(paramsToUpdate) {
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams;

    for (const [key, value] of Object.entries(paramsToUpdate)) {
        searchParams.set(key, value);
    }

    if (!paramsToUpdate.hasOwnProperty('city')) {
        const citySelect = document.getElementById('citySelect');
        if (citySelect) searchParams.set('city', citySelect.value);
    }
    if (!paramsToUpdate.hasOwnProperty('lang') && !searchParams.has('lang')) {
        searchParams.set('lang', '<?php echo $lang; ?>'); 
    }
    if (!searchParams.has('month')) searchParams.set('month', '<?php echo $currentMonth; ?>');
    if (!searchParams.has('year')) searchParams.set('year', '<?php echo $currentYear; ?>');

    return currentUrl.pathname + '?' + searchParams.toString();
}

async function saveSetting(setting, value) {
    try {
        const response = await fetch("update_settings.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `setting=${setting}&value=${value}`
        });
        const data = await response.json();
        return data.success; 
    } catch (err) {
        console.error("[DB] Error updating setting:", err);
        return false;
    }
}

function initializeNavigationEvents() {
    const citySelect = document.getElementById('citySelect');
    if (citySelect) {
        const newCitySelect = citySelect.cloneNode(true);
        citySelect.parentNode.replaceChild(newCitySelect, citySelect);

        newCitySelect.addEventListener('change', async function() {
            const selectedCity = this.value;
            const userIsLoggedIn = "<?php echo isset($_SESSION['user_id']) ? 'true' : 'false'; ?>" === 'true';
            
            if (userIsLoggedIn) {
                await saveSetting('city', selectedCity);
            }
            window.location.href = buildUrl({ 'city': selectedCity });
        });
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.onclick = async function(e) { 
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            const userIsLoggedIn = "<?php echo isset($_SESSION['user_id']) ? 'true' : 'false'; ?>" === 'true';
            
            if (userIsLoggedIn) {
                await saveSetting('language', lang);
            }
            window.location.href = buildUrl({ 'lang': lang });
        };
    });

    document.querySelectorAll(".acc-btn").forEach(btn => {
        btn.onclick = async function(e) {
            const action = this.dataset.action;
            if (action === "read-aloud") {
                readMonthAloud();
                return;
            }

            let className = "", dbSetting = "";
            switch(action) {
                case "contrast": className = "contrast-mode"; dbSetting = "contrast"; break; 
                case "large-text": className = "large-text-mode"; dbSetting = "large_text"; break;
                case "simulate-colorblind": className = "daltonism-mode"; dbSetting = "daltonism"; break;
            }

            if (className) {
                const enabled = document.body.classList.toggle(className) ? 1 : 0;
                this.classList.toggle("active", enabled === 1); 

                const userIsLoggedIn = "<?php echo isset($_SESSION['user_id']) ? 'true' : 'false'; ?>" === 'true';
                if (userIsLoggedIn) {
                    await saveSetting(dbSetting, enabled);
                }
            }
        };
    });
}

document.addEventListener("DOMContentLoaded", function() {
    initializeNavigationEvents();
    showUserMenu();
    updateAccessibilityButtonsState();

    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const cartContainer = document.getElementById('cartContainer');
            if(cartContainer) cartContainer.classList.add('active');
        });
    }
});
window.isUserLoggedIn = <?php echo $isLoggedIn ? 'true' : 'false'; ?>;
</script>

    <!-- JavaScript файлове -->
   
    <script src="js/main.js"></script>
 
    <script src="js/analytics-charts.js"></script>
    <script src="js/ai-assistant.js"></script>
    <script src="js/init.js"></script>
    <script src="js/advanced-features.js"></script>
    <script src="js/multilingual.js"></script>
</body>
</html>