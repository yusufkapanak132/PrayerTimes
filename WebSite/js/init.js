// =========== ГЛАВЕН ИНИЦИАЛИЗАЦИОНЕН ФАЙЛ ===========

// Глобално приложение
window.app = {
    prayerData: {},
    currentCity: 'София',
    today: new Date().toISOString().split('T')[0],
    
    // Методи
    showNotification: function(message, type = 'info') {
        this._showNotification(message, type);
    },
    
    getPrayerTimes: function(city, date) {
        return this.prayerData[city]?.[date] || null;
    },
    
    calculateNextPrayer: function(city) {
        const today = this.today;
        const prayers = this.getPrayerTimes(city, today);
        if (!prayers) return null;
        
        const now = new Date();
        const prayerOrder = ['Зора', 'Изгрев', 'Обяд', 'Следобяд', 'Залез', 'Нощ'];
        
        for (const prayer of prayerOrder) {
            if (prayers[prayer]) {
                const prayerTime = new Date(today + ' ' + prayers[prayer]);
                if (prayerTime > now) {
                    return {
                        name: prayer,
                        time: prayers[prayer],
                        remaining: prayerTime - now
                    };
                }
            }
        }
        return null;
    },
    
    // Приватни методи
    _showNotification: function(message, type) {
        const notification = document.createElement('div');
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
        
        // Автоматично премахване
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Добавяне на CSS анимации за известията
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

// Основна инициализационна функция
async function initializeApp() {
    console.log('🚀 Молитвени Времена Pro - Инициализация...');
    
    try {
        // 1. Зареждане на данните
        await loadPrayerData();
        
        // 2. Инициализиране на количката
        initializeCart();
        
        // 3. Инициализиране на GPS
        initializeGPS();
        
        // 4. Инициализиране на AI помощника
        initializeAI();
        
        // 5. Инициализиране на аналитиката
        initializeAnalytics();
        
        // 6. Инициализиране на многоезичност
        initializeMultilingual();
        
        // 7. Инициализиране на достъпността
        initializeAccessibility();
        
        // 8. Инициализиране на PWA
        initializePWA();
        
        // 9. Добавяне на клавишни комбинации
        addKeyboardShortcuts();
        
        // 10. Следваща молитва таймер
        startNextPrayerTimer();
        
        console.log('✅ Приложението е успешно инициализирано!');
        
    } catch (error) {
        console.error('❌ Грешка при инициализация:', error);
        app.showNotification('Грешка при зареждане на приложението', 'error');
    }
}

// Функция за зареждане на данните
async function loadPrayerData() {
    try {
        const response = await fetch('assets/all_prayer_times_2026.json');
        app.prayerData = await response.json();
        console.log('📊 Данните за молитвени времена са заредени');
        
        // Инициализиране на текущия град
        const citySelect = document.getElementById('citySelect');
        if (citySelect) {
            app.currentCity = citySelect.value;
            
            // Добавяне на event listener за промяна на града
            //citySelect.addEventListener('change', function() {
              // app.currentCity = this.value;
               // updateAllCityDependentFeatures();
           // });
        }
    } catch (error) {
        console.error('Грешка при зареждане на данните:', error);
        throw error;
    }
}

function initializeCart() {
    // Количката се инициализира от main.js
    console.log('🛒 Количката е инициализирана');
}

function initializeGPS() {
    // GPS се инициализира от gps-compass.js
    console.log('📍 GPS модулът е инициализиран');
    
    // Добавяме бутон за гласово четене на GPS информация
    addVoiceGPSButton();
}

function addVoiceGPSButton() {
    const gpsWidget = document.querySelector('.gps-widget');
    if (!gpsWidget) return;
    
    const voiceBtn = document.createElement('button');
    voiceBtn.className = 'voice-gps-btn';
    voiceBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    voiceBtn.title = 'Прочети GPS информация';
    voiceBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(56, 176, 0, 0.2);
        border: 1px solid #38b000;
        color: #38b000;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    voiceBtn.addEventListener('click', readGPSInfo);
    gpsWidget.style.position = 'relative';
    gpsWidget.appendChild(voiceBtn);
}

function readGPSInfo() {
    if (!('speechSynthesis' in window)) {
        if (typeof app !== 'undefined' && app.showNotification) {
            app.showNotification('Гласовото четене не се поддържа', 'error');
        } else {
            showNotification('Гласовото четене не се поддържа', 'error');
        }
        return;
    }
    
    // Вземане на града
    const citySelect = document.getElementById('citySelect');
    let city = 'неизвестен град';
    
    if (citySelect) {
        city = citySelect.value || city; 
    } else if (typeof app !== 'undefined' && app.currentCity) {
        city = app.currentCity;
    }
    
    const qiblaDeg = document.getElementById('qiblaDegrees')?.textContent || '135';
    const distance = document.getElementById('distanceMakkah')?.textContent || '2500';
    
    // Премахваме всички символи, освен цифри и запетаи
    const cleanQibla = qiblaDeg.replace(/[^\d.]/g, ''); 
    const cleanDistance = distance.replace(/[^\d.,]/g, '');

    // 1. Вземаме текущия език (същата логика като в readPrayerTimes)
    const activeLangBtn = document.querySelector('.header-language .lang-btn.active, .lang-btn-panel.active');
    let currentLang = 'bg';
    if (activeLangBtn) {
        currentLang = activeLangBtn.dataset.lang;
    } else {
        currentLang = localStorage.getItem('preferredLanguage') || 'bg';
    }

    // 2. Вземаме езиковия код за синтеза (предполагам, че имаш функцията getSpeechLanguageCode глобално)
    // Ако случайно я няма в този обхват, слагаме fallback логика
    let speechLangCode = 'bg-BG';
    if (typeof getSpeechLanguageCode === 'function') {
        speechLangCode = getSpeechLanguageCode();
    } else {
        switch(currentLang) {
            case 'en': speechLangCode = 'en-US'; break;
            case 'tr': speechLangCode = 'tr-TR'; break;
            case 'ar': speechLangCode = 'ar-SA'; break;
        }
    }

    // 3. Формираме текста според избрания език
    let speechText = '';
    switch(currentLang) {
        case 'en':
            speechText = `Your city is ${city}. Qibla direction is ${cleanQibla} degrees. Distance to Mecca is ${cleanDistance} kilometers.`;
            break;
        case 'tr':
            speechText = `Şehriniz ${city}. Kıble yönü ${cleanQibla} derece. Mekke'ye uzaklık ${cleanDistance} kilometre.`;
            break;
        case 'ar':
            speechText = `مدينتك هي ${city}. اتجاه القبلة هو ${cleanQibla} درجة. المسافة إلى مكة هي ${cleanDistance} كيلومتر.`;
            break;
        case 'bg':
        default:
            speechText = `Вашият град е ${city}. Кибла посоката е ${cleanQibla} градуса. Разстоянието до Мека е ${cleanDistance} километра.`;
            break;
    }
    
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = speechLangCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // 4. Опитваме да изберем подходящ глас
    window.speechSynthesis.onvoiceschanged = function() {
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.lang.includes(speechLangCode.split('-')[0]));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
    };
    
    window.speechSynthesis.speak(utterance);
    
    // 5. Показваме известие на съответния език
    let notificationMessage = '';
    switch(currentLang) {
        case 'en': notificationMessage = 'Voice reading of GPS info started'; break;
        case 'tr': notificationMessage = 'GPS bilgisi sesli okuması başladı'; break;
        case 'ar': notificationMessage = 'بدأت القراءة الصوتية لمعلومات GPS'; break;
        case 'bg':
        default: notificationMessage = 'Гласово четене на GPS информация';
    }
    
    // Подсигуряваме се, че се вика правилната функция за нотификация (понякога ползваш app.showNotification, понякога директно showNotification)
    if (typeof app !== 'undefined' && typeof app.showNotification === 'function') {
        app.showNotification(notificationMessage, 'info');
    } else if (typeof showNotification === 'function') {
        showNotification(notificationMessage, 'info');
    }
}

function initializeAI() {
    // AI се инициализира от ai-assistant.js
    console.log('🤖 AI помощникът е инициализиран');
    
    // Добавяме бутон за гласово въвеждане
    addVoiceInputToAI();
}

function addVoiceInputToAI() {
    // Това ще се добави при създаването на AI асистента
    console.log('🎤 Гласово въвеждане за AI е готово');
}

function initializeAnalytics() {
    // Аналитиката се инициализира от analytics-charts.js
    console.log('📈 Аналитичният модул е инициализиран');
    
    // Добавяне на автоматично актуализиране на статистиката
    setInterval(updateLiveStats, 60000); // Всеки минута
}

function updateLiveStats() {
    const quickStats = document.querySelector('.quick-stats-grid');
    if (!quickStats) return;
    
    const nextPrayer = app.calculateNextPrayer(app.currentCity);
    if (nextPrayer) {
        const minutes = Math.floor(nextPrayer.remaining / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        const timeElement = document.getElementById('quickTimeToNext');
        if (timeElement) {
            timeElement.textContent = `${hours}:${remainingMinutes.toString().padStart(2, '0')}`;
        }
    }
}

function initializeMultilingual() {
    // Многоезичността се инициализира от multilingual.js
    console.log('🌍 Многоезичният модул е инициализиран');
}

function initializeAccessibility() {
    console.log('♿ Достъпността е инициализирана');
    
    // Добавяне на бутон за текстово описание на изображения
    addImageDescriptions();
}

function addImageDescriptions() {
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
        if (!img.alt) {
            // Генерираме автоматично описание
            const src = img.src.toLowerCase();
            if (src.includes('watch')) img.alt = 'Умният часовник за намаз';
            else if (src.includes('mosque')) img.alt = 'Изображение на джамия';
            else img.alt = 'Илюстрация';
        }
    });
}

function initializePWA() {
    console.log('📱 PWA функциите са инициализирани');
    
    // Проверка за офлайн статус
    window.addEventListener('online', () => {
        app.showNotification('Връзката е възстановена! Синхронизираме данните...', 'success');
    });
    
    window.addEventListener('offline', () => {
        app.showNotification('Вие сте офлайн. Работиме с кеширани данни.', 'warning');
    });
}

function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl + S - Запазване на настройки
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveUserSettings();
        }
        
        // Ctrl + P - Принтиране
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            printPrayerTable();
        }
        
        // F1 - Помощ (отваря AI помощника)
        if (e.key === 'F1') {
            e.preventDefault();
            window.openAIAssistant?.();
        }
        
        // F2 - Бърз избор на град
        if (e.key === 'F2') {
            e.preventDefault();
            const citySelect = document.getElementById('citySelect');
            if (citySelect) citySelect.focus();
        }
        
        // F5 - Обновяване на данните
        if (e.key === 'F5') {
            e.preventDefault();
            location.reload();
        }
    });
}

function saveUserSettings() {
    const settings = {
        city: app.currentCity,
        language: localStorage.getItem('preferredLanguage') || 'bg',
        accessibility: {
            highContrast: document.body.classList.contains('high-contrast'),
            largeText: document.body.classList.contains('large-text')
        }
    };
    
    localStorage.setItem('prayerAppSettings', JSON.stringify(settings));
    app.showNotification('Настройките са запазени!', 'success');
}

function printPrayerTable() {
    const printContent = document.querySelector('.prayer-table-container').cloneNode(true);
    
    // Премахваме ненужни елементи
    printContent.querySelectorAll('.table-actions, .today-badge, .passed-indicator, .upcoming-indicator').forEach(el => el.remove());
    
    // Създаваме нов прозорец за печат
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Времена за Намаз - ${app.currentCity}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
                th { background: #f5f5f5; font-weight: bold; }
                .current-day { background: #e8f5e9; }
                .friday { color: #d32f2f; font-weight: bold; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #38b000; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Времена за Намаз - ${app.currentCity}</h1>
                <p>Генерирано на: ${new Date().toLocaleString('bg-BG')}</p>
            </div>
            ${printContent.innerHTML}
            <div class="footer">
                <p>www.prayertimessite.bg | Времена за Намаз © 2026</p>
            </div>
            <div class="no-print" style="margin-top: 20px;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #38b000; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Принтирай
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                    Затвори
                </button>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function startNextPrayerTimer() {
    function updateTimer() {
        const nextPrayer = app.calculateNextPrayer(app.currentCity);
        if (!nextPrayer) return;
        
        const now = new Date();
        const prayerTime = new Date(app.today + ' ' + nextPrayer.time);
        const diffMs = prayerTime - now;
        
        if (diffMs <= 0) {
            // Молитвата е минала
            return;
        }
        
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        // Ако остават по-малко от 5 минути, показваме известие
        if (diffMinutes <= 5 && diffMinutes > 0) {
            showPrayerReminder(nextPrayer.name, diffMinutes);
        }
        
        // Ако остават по-малко от 1 минута, пускаме звуков сигнал
        if (diffMinutes <= 1 && diffMinutes > 0) {
            playAdhanSound();
        }
    }
    
    // Проверяваме всеки 30 секунди
    setInterval(updateTimer, 30000);
    updateTimer(); // Първоначална проверка
}

function showPrayerReminder(prayerName, minutes) {
    // Проверяваме дали вече сме показвали известие за тази молитва
    const reminderKey = `reminder_${prayerName}_${app.today}`;
    if (localStorage.getItem(reminderKey)) return;
    
    app.showNotification(`⏰ Молитвата ${prayerName} след ${minutes} минути!`, 'warning');
    
    // Запазваме, че сме показали известие
    localStorage.setItem(reminderKey, 'shown');
    
    // След 1 час изчистваме записа
    setTimeout(() => {
        localStorage.removeItem(reminderKey);
    }, 60 * 60 * 1000);
}

function playAdhanSound() {
    // Това е опростена версия - в реален проект ще имаме реални звуци
    const audio = document.getElementById('adhanSound');
    if (audio) {
        audio.play().catch(e => console.log('Неуспешно възпроизвеждане на звук:', e));
    }
}

function updateAllCityDependentFeatures() {
    // Обновяваме всичко, което зависи от града
    updateLiveStats();
    
    // Ако аналитиката е отворена, я обновяваме
    if (document.getElementById('analyticsSection').style.display === 'block') {
        window.initCharts?.();
        window.updateMonthlyStats?.();
    }
    
    // Обновяваме AI помощника
    if (window.aiAssistant) {
        window.aiAssistant.currentCity = app.currentCity;
    }
    
    app.showNotification(`Градът е променен на ${app.currentCity}`, 'success');
}

// Функция за зареждане на потребителски настройки
function loadUserSettings() {
    const savedSettings = localStorage.getItem('prayerAppSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            // Зареждане на град
            const citySelect = document.getElementById('citySelect');
            if (citySelect && settings.city) {
                citySelect.value = settings.city;
                app.currentCity = settings.city;
            }
            
            // Зареждане на език
            if (settings.language) {
                window.switchLanguage?.(settings.language);
            }
            
            // Зареждане на достъпност
            if (settings.accessibility) {
                if (settings.accessibility.highContrast) {
                    document.body.classList.add('high-contrast');
                }
                if (settings.accessibility.largeText) {
                    document.body.classList.add('large-text');
                }
            }
            
            console.log('⚙️ Потребителските настройки са заредени');
        } catch (e) {
            console.error('Грешка при зареждане на настройки:', e);
        }
    }
}

// Главно инициализиране
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📄 DOM е зареден, започвам инициализация...');
    
    // Зареждаме първо потребителските настройки
   // loadUserSettings();
    
    // Инициализираме приложението
    await initializeApp();
    
    // Добавяме звуков елемент за азан
    const adhanAudio = document.createElement('audio');
    adhanAudio.id = 'adhanSound';
    
    adhanAudio.preload = 'auto';
    document.body.appendChild(adhanAudio);
    

    
    
    // Показваме начално съобщение
    setTimeout(() => {
        app.showNotification('Добре дошли във Времена за Намаз 🕌', 'info');
    }, 1000);
});

// Глобални помощни функции
window.getPrayerTimes = (city, date) => app.getPrayerTimes(city, date);
window.getNextPrayer = (city) => app.calculateNextPrayer(city);
window.showAppNotification = (message, type) => app.showNotification(message, type);

// Експорт на функции за HTML onclick атрибути
window.saveSettings = saveUserSettings;
window.printPrayerTable = printPrayerTable;

console.log('🎯 init.js е зареден и готов за работа!');