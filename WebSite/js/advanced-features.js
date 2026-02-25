if (!window.app) {
    console.warn('app обектът не е инициализиран. Зареждане на init.js...');
   
}
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Зареждане на разширените функционалности...');
    
    // Зареждане на данни за молитвени времена
    await loadPrayerData();
    
    // 1. Инициализиране на GPS функцията
    initGPS();
    
    // 2. Инициализиране на езиковия селектор
    initLanguageSelector();
    
    // 3. Инициализиране на достъпността
    initAccessibility();
    
    // 4. Инициализиране на табличните действия
    initTableActions();
    
    // 6. Инициализиране на PWA
    initPWA();
    

    
    console.log('Всички разширени функционалности са заредени!');
});

// Глобални данни
let prayerData = {};
let currentCity = 'София';
let today = new Date().toISOString().split('T')[0];

async function loadPrayerData() {
    try {
            const response = await fetch('assets/all_prayer_times_2026.json');
            prayerData = await response.json();
            currentCity = document.getElementById('citySelect')?.value || 'София';
            console.log('Данните за молитвени времена са заредени');
    } catch (error) {
            console.error('Грешка при зареждане на данни:', error);
    }
}

// =========== GPS ФУНКЦИОНАЛНОСТ ===========
function initGPS() {
    const refreshBtn = document.getElementById('refreshLocation');
    if (refreshBtn) {
            refreshBtn.addEventListener('click', getLocation);
    }
    
    // Зареждане на координатите на градовете
    loadCitiesCoordinates();
    
    // Инициализиране на компаса
    initCompass();
}


let citiesCoordinates = {};

async function loadCitiesCoordinates() {
    try {
            const response = await fetch('assets/bg_cities_coordinates.json');
            citiesCoordinates = await response.json();
            console.log('Координатите на градовете са заредени:', citiesCoordinates);
            const citySelect = document.getElementById("citySelect");

    if (citySelect && citySelect.value && citiesCoordinates[citySelect.value]) {
            const selectedCity = citySelect.value;
            const lat = citiesCoordinates[selectedCity].lat;
            const lon = citiesCoordinates[selectedCity].lon;

            

            document.getElementById("detectedCity").innerHTML =
                `<strong>${selectedCity}</strong>`;

            // Изчисляваме Кибла + разстояние
            calculateQiblaDirection(lat, lon);
            calculateDistanceToMakkah(lat, lon);
    }
    } catch (error) {
            console.error('Грешка при зареждане на координатите:', error);
            // Използваме дефолтни координати за основни градове
            citiesCoordinates = {
                "София": { "lat": 42.6977, "lon": 23.3219 },
                "Пловдив": { "lat": 42.1354, "lon": 24.7453 },
                "Варна": { "lat": 43.2141, "lon": 27.9147 },
                "Бургас": { "lat": 42.5048, "lon": 27.4626 }
            };
    }
}

function getLocation() {
const locationText = document.getElementById('locationText');
const detectedCity = document.getElementById('detectedCity');

if (!navigator.geolocation) {
    locationText.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Геолокацията не се поддържа';
    return;
}

locationText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Определяне на локация...';

navigator.geolocation.getCurrentPosition(
    function(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy;
       
        // Намиране на най-близкия град
        const nearestCity = findNearestCity(lat, lon);
        currentCity = nearestCity;
       
        // Актуализиране на интерфейса
        locationText.innerHTML = '<i class="fas fa-check-circle" style="color:#38b000"></i> Локацията е намерена';
        detectedCity.innerHTML = `
            <strong>${nearestCity}</strong><br>
            <small>Точност: ${Math.round(accuracy)} метра</small>
        `;
       
        // Автоматично избиране на града в dropdown
// Изграждаме новия URL с правилния град, запазвайки останалите параметри
const urlParams = new URLSearchParams(window.location.search);
urlParams.set('city', nearestCity); // Слагаме намереното име (напр. "София")

// Презареждаме страницата с новия URL след кратка пауза (за да се види success съобщението)
setTimeout(() => {
    window.location.search = urlParams.toString();
}, 50);
       
        // Изчисляване на кибла посока
        calculateQiblaDirection(lat, lon);
       
        // Изчисляване на разстояние до Мека
        calculateDistanceToMakkah(lat, lon);
       
        
    },
    function(error) {
        console.error('GPS грешка:', error);
        let message = 'Грешка при определяне на локация';
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message = 'Потребителят отказа достъп до геолокация';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Информация за местоположението е недостъпна';
                break;
            case error.TIMEOUT:
                message = 'Времето за заявка изтече';
                break;
        }
        locationText.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        showNotification(message, 'error');
    },
    {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    }
);
} 

function findNearestCity(userLat, userLon) {
    let nearestCity = 'София';
    let minDistance = Infinity;
    
    for (const [city, coords] of Object.entries(citiesCoordinates)) {
            const distance = calculateDistance(userLat, userLon, coords.lat, coords.lon);
            if (distance < minDistance) {
                minDistance = distance;
                nearestCity = city;
            }
    }
    
    return nearestCity;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Земен радиус в км
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function calculateQiblaDirection(lat, lon) {
    const userLat = lat * Math.PI / 180;
    const userLon = lon * Math.PI / 180;
    const makkahLat = 21.4225 * Math.PI / 180;
    const makkahLon = 39.8262 * Math.PI / 180;
    
    const y = Math.sin(makkahLon - userLon);
    const x = Math.cos(userLat) * Math.tan(makkahLat) - Math.sin(userLat) * Math.cos(makkahLon - userLon);
    
    let qibla = Math.atan2(y, x) * 180 / Math.PI;
    const qiblaDirection = (qibla + 360) % 360;
    
    // Актуализиране на интерфейса
    const qiblaDegrees = document.getElementById('qiblaDegrees');
    const qiblaIndicator = document.getElementById('qiblaIndicator');
    
    if (qiblaDegrees) {
            qiblaDegrees.textContent = Math.round(qiblaDirection) + '°';
    }
    
    if (qiblaIndicator) {
            qiblaIndicator.style.transform = `rotate(${qiblaDirection}deg)`;
    }
    
    return qiblaDirection;
}

function initCompass() {
    if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleDeviceOrientation, true);
    } else {
            console.log('DeviceOrientation не се поддържа');
    }
}

function handleDeviceOrientation(event) {
    const compassArrow = document.getElementById('compassArrow');
    if (compassArrow && event.alpha !== null) {
            // alpha: компасно завъртане 0-360 градуса
            const heading = event.alpha;
            compassArrow.style.transform = `translateX(-50%) rotate(${heading}deg)`;
            
            // Можем също да покажем посоката като текст
            const directions = ['Север', 'Североизток', 'Изток', 'Югоизток', 'Юг', 'Югозапад', 'Запад', 'Северозапад'];
            const index = Math.round(heading / 45) % 8;
            // document.getElementById('compassDirection').textContent = directions[index];
    }
}

function calculateDistanceToMakkah(lat, lon) {
    const makkah = { lat: 21.4225, lon: 39.8262 };
    const distance = calculateDistance(lat, lon, makkah.lat, makkah.lon);
    
    const distanceElement = document.getElementById('distanceMakkah');
    if (distanceElement) {
            distanceElement.textContent = Math.round(distance) + ' км';
    }
    
    return distance;
}

// =========== ЕЗИКОВ СЕЛЕКТОР ===========
function initLanguageSelector() {
    // Header language buttons
    document.querySelectorAll('.header-language .lang-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const lang = this.dataset.lang;
                switchLanguage(lang);
                
                // Актуализиране на активния бутон
                document.querySelectorAll('.header-language .lang-btn').forEach(b => {
                    b.classList.remove('active');
                });
                this.classList.add('active');
            });
    });
    
    // Panel language buttons
    document.querySelectorAll('.lang-btn-panel').forEach(btn => {
            btn.addEventListener('click', function() {
                const lang = this.dataset.lang;
                switchLanguage(lang);
                
                // Актуализиране на активния бутон
                document.querySelectorAll('.lang-btn-panel').forEach(b => {
                    b.classList.remove('active');
                });
                this.classList.add('active');
            });
    });
}

function switchLanguage(lang) {
    console.log('Превключване на език:', lang);
    
    // Запазване на избора
    localStorage.setItem('preferredLanguage', lang);
    
    // Промяна на текст в реално време
    translateInterface(lang);
    
    showNotification(`Езикът е променен на ${getLanguageName(lang)}`, 'success');
}

function getLanguageName(code) {
    const languages = {
            'bg': 'Български',
            'en': 'English',
            'tr': 'Türkçe',
            'ar': 'العربية'
    };
    return languages[code] || code;
}

function translateInterface(lang) {
    // Това е опростена версия. В реален проект ще имаме JSON файл с преводи.
    const translations = {
            'bg': {
                'citySelect': 'Изберете град:',
                'gpsTitle': 'GPS Локация & Кибла Компас',
                'androidApp': 'Android Приложение',
                'iosApp': 'iOS Приложение',
                'desktopApp': 'Desktop версия',
                'accessibility': 'Достъпност',
                'analytics': 'Аналитика и Статистика'
            },
            'en': {
                'citySelect': 'Select city:',
                'gpsTitle': 'GPS Location & Qibla Compass',
                'androidApp': 'Android Application',
                'iosApp': 'iOS Application',
                'desktopApp': 'Desktop Version',
                'accessibility': 'Accessibility',
                'analytics': 'Analytics & Statistics'
            },
            'tr': {
                'citySelect': 'Şehir seçin:',
                'gpsTitle': 'GPS Konumu & Kıble Pusulası',
                'androidApp': 'Android Uygulaması',
                'iosApp': 'iOS Uygulaması',
                'desktopApp': 'Masaüstü Sürümü',
                'accessibility': 'Erişilebilirlik',
                'analytics': 'Analitik ve İstatistikler'
            },
            'ar': {
                'citySelect': 'اختر مدينة:',
                'gpsTitle': 'موقع GPS وبوصلة القبلة',
                'androidApp': 'تطبيق أندرويد',
                'iosApp': 'تطبيق iOS',
                'desktopApp': 'إصدار سطح المكتب',
                'accessibility': 'إمكانية الوصول',
                'analytics': 'التحليلات والإحصائيات'
            }
    };
    
    const dict = translations[lang] || translations['bg'];
    
    // Прилагане на преводите
    document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.dataset.translate;
            if (dict[key]) {
                element.textContent = dict[key];
            }
    });
}

// ===========================================
// === НОВА ЛОГИКА ЗА ДОСТЪПНОСТ И ЗАПАЗВАНЕ ===
// ===========================================

/**
* Изпраща AJAX заявка към PHP, за да обнови настройка в БД.
* @param {string} settingName - Име на настройката ('contrast', 'large_text', 'daltonism').
* @param {number} value - Стойност (1 за активно, 0 за неактивно).
*/
function updateSetting(settingName, value) {
// Проверка дали потребителят е логнат (понеже PHP логиката трябва да го знае)
if (!window.userAccessibilitySettings) return; // Не записваме, ако няма подадени настройки (не е логнат)

const formData = new FormData();
formData.append('setting', settingName);
formData.append('value', value);

// ПРЕДПОЛАГАМЕ, че update_accessibility.php обработва тази заявка
fetch('update_accessibility.php', { 
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log(`Настройката ${settingName} успешно обновена.`);
    } else {
        console.error(`Грешка при обновяване на ${settingName}:`, data.error || data.message);
    }
})
.catch(error => {
    console.error('Грешка при AJAX заявка:', error);
});
}

function initAccessibility() {

const settings = window.userAccessibilitySettings || {};

const contrastBtn = document.querySelector('[data-action="contrast"]');
const largeTextBtn = document.querySelector('[data-action="large-text"]');
const colorblindBtn = document.querySelector('[data-action="simulate-colorblind"]');

// --- ПРИЛАГАНЕ НА НАСТРОЙКИТЕ ПРИ ЗАРЕЖДАНЕ (ВЪЗСТАНОВЯВАНЕ НА СЪСТОЯНИЕТО) ---

// Висок контраст
if (settings.contrast == 1) {
    document.body.classList.add('high-contrast');
    if (contrastBtn) contrastBtn.classList.add('active');
}

// Голям текст
if (settings.large_text == 1) {
    document.body.classList.add('large-text');
    if (largeTextBtn) largeTextBtn.classList.add('active');
}

// Симулация на далтонизъм
if (settings.daltonism == 1) {
    document.body.classList.add('colorblind-simulation');
    if (colorblindBtn) colorblindBtn.classList.add('active');
}

// --- ДОБАВЯНЕ НА СЛУШАТЕЛИ ЗА КЛИК (С АВТОМАТИЧНО ЗАПАЗВАНЕ) ---

// Висок контраст
contrastBtn?.addEventListener('click', function() {
    document.body.classList.toggle('high-contrast');
    this.classList.toggle('active');
    const isActive = document.body.classList.contains('high-contrast');
    updateSetting('contrast', isActive ? 1 : 0); // <-- AJAX запазване
    showNotification(
        isActive ? 'Висок контраст активиран' : 'Висок контраст деактивиран',
        'success'
    );
});

// Голям текст
largeTextBtn?.addEventListener('click', function() {
    document.body.classList.toggle('large-text');
    this.classList.toggle('active');
    const isActive = document.body.classList.contains('large-text');
    updateSetting('large_text', isActive ? 1 : 0); // <-- AJAX запазване
    showNotification(
        isActive ? 'Големият текст е активиран' : 'Големият текст е деактивиран',
        'success'
    );
});

// Гласово четене (няма запазване на състояние)
document.querySelector('[data-action="read-aloud"]')?.addEventListener('click', function() {
    readPrayerTimes();
});

// Симулация на далтонизъм
colorblindBtn?.addEventListener('click', function() {
    document.body.classList.toggle('colorblind-simulation');
    this.classList.toggle('active');
    const isActive = document.body.classList.contains('colorblind-simulation');
    updateSetting('daltonism', isActive ? 1 : 0); // <-- AJAX запазване
    showNotification(
        isActive ? 'Симулация на далтонизъм активирана' : 'Симулация на далтонизъм деактивирана',
        'success'
    );
});
}
// =========== КРАЙ НА НОВАТА ЛОГИКА ===========

/**
* Връща езиковия код за гласов синтез според избрания език в приложението
*/
function getSpeechLanguageCode() {
// Вземаме текущия език от localStorage или от атрибута на активния бутон
const activeLangBtn = document.querySelector('.header-language .lang-btn.active, .lang-btn-panel.active');
let currentLang = 'bg'; // По подразбиране български

if (activeLangBtn) {
    currentLang = activeLangBtn.dataset.lang;
} else {
    // Ако няма активен бутон, пробваме да вземем от localStorage
    currentLang = localStorage.getItem('preferredLanguage') || 'bg';
}

// Мапване на езиците към кодове за гласов синтез
const speechCodes = {
    'bg': 'bg-BG',
    'en': 'en-US',
    'tr': 'tr-TR',
    'ar': 'ar-SA'
};

return speechCodes[currentLang] || 'bg-BG';
}

/**
* Връща имената на молитвите на съответния език
*/
function getPrayerNamesInCurrentLanguage() {
const activeLangBtn = document.querySelector('.header-language .lang-btn.active, .lang-btn-panel.active');
let currentLang = 'bg';

if (activeLangBtn) {
    currentLang = activeLangBtn.dataset.lang;
} else {
    currentLang = localStorage.getItem('preferredLanguage') || 'bg';
}

const prayerNames = {
    'bg': {
        'Зора': 'Зора',
        'Изгрев': 'Изгрев на слънцето',
        'Обяд': 'Обяд',
        'Следобяд': 'Следобяд',
        'Залез': 'Залез',
        'Нощ': 'Нощна молитва'
    },
    'en': {
        'Зора': 'Fajr',
        'Изгрев': 'Sunrise',
        'Обяд': 'Dhuhr',
        'Следобяд': 'Asr',
        'Залез': 'Maghrib',
        'Нощ': 'Isha'
    },
    'tr': {
        'Зора': 'İmsak',
        'Изгрев': 'Güneş',
        'Обяд': 'Öğle',
        'Следобяд': 'İkindi',
        'Залез': 'Akşam',
        'Нощ': 'Yatsı'
    },
    'ar': {
        'Зора': 'الفجر',
        'Изгрев': 'الشروق',
        'Обяд': 'الظهر',
        'Следобяд': 'العصر',
        'Залез': 'المغرب',
        'Нощ': 'العشاء'
    }
};

return prayerNames[currentLang] || prayerNames['bg'];
}

function readPrayerTimes() {
    if (!('speechSynthesis' in window)) {
            showNotification('Гласовото четене не се поддържа от вашия браузър', 'error');
            return;
    }
    
    const selectedCity = document.getElementById('citySelect')?.value || 'София';
    const today = new Date().toISOString().split('T')[0];
    
    // Взимаме реални данни от JSON
    const cityData = prayerData[selectedCity];
    if (!cityData || !cityData[today]) {
            showNotification('Няма данни за днес за този град', 'error');
            return;
    }
    
    const todayPrayers = cityData[today];
    
    // Вземаме имената на молитвите според текущия език
    const prayerNames = getPrayerNamesInCurrentLanguage();
    
    // Вземаме езиковия код за гласов синтез
    const speechLangCode = getSpeechLanguageCode();
    
    // Формираме текста според избрания език
    let speechText = '';
    
    const activeLangBtn = document.querySelector('.header-language .lang-btn.active, .lang-btn-panel.active');
    let currentLang = 'bg';
    if (activeLangBtn) {
        currentLang = activeLangBtn.dataset.lang;
    } else {
        currentLang = localStorage.getItem('preferredLanguage') || 'bg';
    }
    
    switch(currentLang) {
        case 'bg':
            speechText = `Молитвени времена за ${selectedCity} днес: `;
            break;
        case 'en':
            speechText = `Prayer times for ${selectedCity} today: `;
            break;
        case 'tr':
            speechText = `Bugün ${selectedCity} için namaz vakitleri: `;
            break;
        case 'ar':
            speechText = `أوقات الصلاة لـ ${selectedCity} اليوم: `;
            break;
        default:
            speechText = `Молитвени времена за ${selectedCity} днес: `;
    }
    
    for (const [prayer, time] of Object.entries(todayPrayers)) {
            // Използваме преведените имена на молитвите
            const prayerName = prayerNames[prayer] || prayer;
            speechText += `${prayerName} в ${time}, `;
    }
    
    // Премахваме последната запетая
    speechText = speechText.slice(0, -2);
    
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = speechLangCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Опитваме да изберем подходящ глас за избрания език
    window.speechSynthesis.onvoiceschanged = function() {
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.lang === speechLangCode);
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
    };
    
    window.speechSynthesis.speak(utterance);
    
    // Показваме известие на съответния език
    let notificationMessage = '';
    switch(currentLang) {
        case 'bg': notificationMessage = 'Гласовото четене започна'; break;
        case 'en': notificationMessage = 'Voice reading started'; break;
        case 'tr': notificationMessage = 'Sesli okuma başladı'; break;
        case 'ar': notificationMessage = 'بدأت القراءة الصوتية'; break;
        default: notificationMessage = 'Гласовото четене започна';
    }
    
    showNotification(notificationMessage, 'success');
}

// =========== ТАБЛИЧНИ ДЕЙСТВИЯ ===========
function initTableActions() {
    // Добавяне на обръщане при клик върху молитвено време
    document.querySelectorAll('.prayer-time').forEach(cell => {
            cell.addEventListener('click', function() {
                const prayer = this.dataset.prayer;
                const date = this.dataset.date;
                const time = this.dataset.time;
                
                if (time && time !== '--:--') {
                    const now = new Date();
                    const prayerTime = new Date(date + ' ' + time);
                    const diffMs = prayerTime - now;
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    
                    if (diffMs > 0) {
                        showNotification(`Молитвата ${prayer} ще бъде след ${diffHours} часа и ${diffMinutes} минути`, 'info');
                    } else {
                        showNotification(`Молитвата ${prayer} е била преди ${Math.abs(diffHours)} часа и ${Math.abs(diffMinutes)} минути`, 'info');
                    }
                }
            });
    });
}

function printTable() {
    window.print();
    showNotification('Таблицата се подготвя за печат...', 'info');
}

function exportToExcel() {
    // Реален експорт към CSV
    const table = document.querySelector('.prayer-table');
    const rows = table.querySelectorAll('tr');
    let csvContent = "data:text/csv;charset=utf-8,";
    
    rows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            const rowData = Array.from(cells).map(cell => cell.textContent.trim()).join(",");
            csvContent += rowData + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "vremena_za_namaz.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Данните са експортирани в CSV файл', 'success');
}

// =========== АНАЛИТИКА ===========
function showFullAnalytics() {
    if (window.analyticsModule) {
            window.analyticsModule.showFullAnalytics();
    }
}

function hideFullAnalytics() {
    if (window.analyticsModule) {
            window.analyticsModule.hideFullAnalytics();
    }
}

function updateCityComparison() {
    if (window.analyticsModule) {
            window.analyticsModule.updateCityComparison();
    }
}

// =========== PWA ===========
function initPWA() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            const installBtn = document.getElementById('installPWA');
            if (installBtn) {
                installBtn.style.display = 'block';
                
                installBtn.addEventListener('click', async () => {
                    installBtn.style.display = 'none';
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                 
                    deferredPrompt = null;
                });
            }
    });
    
    window.addEventListener('appinstalled', () => {
            const installBtn = document.getElementById('installPWA');
            if (installBtn) installBtn.style.display = 'none';
            showNotification('Благодарим ви, че инсталирахте нашето приложение!', 'success');
    });
}



// =========== ПОМОЩНИ ФУНКЦИИ ===========
function showNotification(message, type = 'info') {
    // Проверяваме дали вече има нотификация
    let notification = document.querySelector('.notification');
    if (notification) notification.remove();
    
    notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Стилове
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            max-width: 300px;
            word-wrap: break-word;
    `;
    
    // Цветове според типа
    const colors = {
            'success': '#38b000',
            'error': '#ff6b6b',
            'warning': '#ffa726',
            'info': '#4d96ff'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Добавяне на CSS анимация
    if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
    }
    
    // Автоматично премахване след 3 секунди
    setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// =========== ГЛОБАЛНИ ФУНКЦИИ ЗА HTML ОБАЖДАНИЯ ===========
// Тези функции се извикват директно от HTML onclick атрибутите

window.showFullAnalytics = showFullAnalytics;
window.hideFullAnalytics = hideFullAnalytics;
window.useMyLocation = getLocation;
window.showCitiesMap = function() { 
    showNotification('Картата на градовете ще бъде добавена в следващата версия', 'info');
};
window.printTable = printTable;
window.exportToExcel = exportToExcel;
window.readMonthAloud = readPrayerTimes;


window.updateCityComparison = function() {
    initCityComparisonChart();
    showNotification('Сравнението между градовете е актуализирано', 'success');
};


// Функция за обработка на промяна на града
function handleCityChange() {
    const citySelect = document.getElementById('citySelect');
    if (citySelect) {
            citySelect.addEventListener('change', function() {
                // Презареждаме аналитиката с нови данни
                calculateDailyStats();
                if (document.getElementById('analyticsSection').style.display === 'block') {
                    initCharts();
                    updateMonthlyStats();
                }
                
                // Обновяваме таблицата чрез PHP заявка
                window.location.href = `index.php?city=${encodeURIComponent(this.value)}`;
            });
    }
}

// Инициализиране при зареждане
document.addEventListener('DOMContentLoaded', function() {
    handleCityChange();
});

console.log('Advanced features initialized successfully!');