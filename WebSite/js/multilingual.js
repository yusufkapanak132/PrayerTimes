class MultilingualManager {
    constructor() {
        this.translations = {
            'bg': {
                // Основни
                'pageTitle': 'Времена за Намаз',
                'appName': 'Времена за Намаз',
                'calendar': 'Месечен Преглед',
                'live': 'Живо Отброяване',
                'cart': 'Количка',
                'ai': 'AI Помощник',
                'users': 'Потребители',
                'selectCity': 'Изберете град:',
                'myLocation': 'Моята локация',
                'citiesMap': 'Карта на градовете',
                'today': 'Днес:',
                'date': 'Дата',
                'day': 'Ден',
                'fajr': 'Зора',
                'sunrise': 'Изгрев',
                'dhuhr': 'Обяд',
                'asr': 'Следобяд',
                'maghrib': 'Залез',
                'isha': 'Нощ',
                
                // Дни от седмицата
                'понеделник': 'Понеделник',
                'вторник': 'Вторник',
                'сряда': 'Сряда',
                'четвъртък': 'Четвъртък',
                'петък': 'Петък',
                'събота': 'Събота',
                'неделя': 'Неделя',
                
                // Месеци
                'january': 'Януари',
                'february': 'Февруари',
                'march': 'Март',
                'april': 'Април',
                'may': 'Май',
                'june': 'Юни',
                'july': 'Юли',
                'august': 'Август',
                'september': 'Септември',
                'october': 'Октомври',
                'november': 'Ноември',
                'december': 'Декември',
                
                // GPS
                'gpsTitle': 'GPS Локация & Кибла Компас',
                'gpsClick': 'Кликнете за локация',
                'getLocation': 'Определи моята локация',
                'qibla': 'Кибла:',
                'southeast': 'ЮИ',
                'distanceToMakkah': 'До Мека:',
                
                // Приложения
                'androidApp': 'Android Приложение',
                'iosApp': 'iOS Приложение',
                'smartWatch': 'Часовник за Намаз',
                'fullAccess': 'Пълен достъп до всички функции',
                'downloadAPK': 'Изтегли APK (80MB)',
                'forDevices': 'За iPhone & iPad',
                'downloadIPA': 'Изтегли IPA (80MB)',
                'desktopVersion': 'Desktop версия',
                'GooglePlayVersion':'Google Play изтегляне',
                'desktopDescription': 'Пълна версия за Windows 10/11',
                'GooglePlayDescription': 'AAB версия',
                'downloadGooglePlay': 'Изтегли от Google Play',
                'downloadWindows': 'Изтегли за Windows',
                'accurateTimes': 'Точни Времена',
                'offlineSupport': 'Офлайн',
                'notifications': 'Известия',
                'voiceReading': 'Гласово четене',
                'multilingual': 'Многоезичност',
                
                // Достъпност
                'accessibility': 'Достъпност',
                'highContrast': 'Висок контраст',
                'largeText': 'Голям текст',
                'colorBlind': 'Далтонизъм',
                
                // Статистика
                'dailyStats': 'Дневна статистика',
                'fastingHours': 'часа постинг',
                'daylightHours': 'продължителност на деня',
                'nextPrayerTime': 'до следваща молитва',
                'fullAnalytics': 'Пълна аналитика',
                'analytics': 'Аналитика и Статистика',
                'dayDistribution': 'Разпределение на деня',
                'daylightDuration': 'Продължителност на деня',
                'fastingTime': 'Време за постинг',
                'fastingHoursToday': 'часа постинг днес',
                'eatingWindow': 'часа за хранене',
                'monthlyStats': 'Месечна статистика',
                'earliestFajr': 'Най-ранна зора:',
                'latestIsha': 'Най-късна нощна:',
                'avgDayLength': 'Средна продължителност:',
                'fridayCount': 'Джума дни:',
                'monthChange': 'Промяна от миналия месец:',
                'longestDay': 'Най-дълъг ден:',
                'shortestDay': 'Най-къс ден:',
                'longestFasting': 'Най-дълъг постинг:',
                'shortestFasting': 'Най-къс постинг:',
                'dayProgress': 'Прогрес на деня:',
                'totalRecords': 'Общо записи:',
                'days': 'дни',
                'fridayCountTable': 'Джума дни:',
                
                // Таблица легенда
                'todayDay': 'Днешен ден',
                'fridayPrayer': 'Джума (петък)',
                'passedPrayer': 'Минала молитва',
                'upcomingPrayer': 'Скоро ще дойде',
                'printTable': 'Принтирай таблицата',
                
                // Умен часовник - детайли
                'new': 'НОВО',
                'reviews': 'ревюта',
                'speciallyDesigned': 'Специално разработен за мюсюлмани',
                'withFeatures': 'с интелигентни функции:',
                'autoNotifications': 'Автоматични известия',
                'beforePrayer': 'преди всяка молитва',
                'builtInCompass': 'Вграден компас',
                'forQibla': 'за кибла с вибрация',
                'autoUpdate': 'Автоматично актуализиране',
                'ofTimes': 'на времената',
                'batteryLife': '7 дни батерия',
                'fastCharging': 'с бързо зареждане',
                'waterResistant': 'Водоустойчив',
                'upTo': 'до 50м',
                'monitor': 'Монитор',
                'forHeart': 'за сърдечен ритъм и сън',
                'currency': 'евро',
                'saveAmount': 'Спестявате 50 евро!',
                'addToCart': 'Добави в количка',
                'freeShipping': 'Безплатна доставка за България',
                'returnPolicy': '14-дневна гаранция за връщане',
                'warranty': '2 години гаранция',
                
                // Количка
                'subtotal': 'Междинна сума:',
                'shipping': 'Доставка:',
                'total': 'Общо:',
                'proceedToCheckout': 'Продължи към плащане',
                'installApp': 'Инсталирай приложението',
                'printTable':'Експортиране на таблица',
                
                // Поръчка
                'completeOrder': 'Завършване на поръчката',
                'fullName': 'Име и Фамилия:',
                'emailAddress': 'Имейл адрес:',
                'phoneNumber': 'Телефонен номер:',
                'deliveryMethod': 'Начин на доставка:',
                'chooseDelivery': 'Изберете начин на доставка',
                'toAddress': 'До адрес',
                'toOffice': 'До офис',
                'deliveryAddress': 'Адрес за доставка:',
                'city': 'Град:',
                'orderDetails': 'Детайли на поръчката:',
                'totalAmount': 'Обща сума:',
                'submitOrder': 'Изпрати поръчка',
                'cancel': 'Отказ',
                
                // Сравнение между градове
                'cityComparison': 'Сравнение между градове',
                'firstCity': 'Първи град:',
                'secondCity': 'Втори град:',
                'updateComparison': 'Актуализирай сравнението',
                
                // Потребителско меню
                'settings': 'Настройки',
                'logout': 'Изход',
                
                // Footer
                'aboutProject': 'За проекта',
                'projectDescription': 'Времена за Намаз е интелигентна платформа за молитвени времена с GPS локация, пълна аналитика и офлайн поддръжка.',
                'technologies': 'Технологии',
                'techStack': 'HTML5, CSS3, JavaScript (ES6+), PHP 8, MySQL, Chart.js, PWA, Service Workers, Geolocation API, RESTful API, HTTP Requests',
                'olympiad': 'Олимпиада',
                'olympiadDescription': 'Проект за Национална олимпиада по информатика 2026.',
                'allRights': 'Всички права запазени.',
                'projectDetails': 'Детайли за проекта',
                'techDocs': 'Техническа документация',
                'developer': 'Свържете се с разработчика: yusuf.kapanak@pmggd.bg - Юсуф Капанък',
                
                // Хиджри и други
                'loading': 'Зареждане...',
                
                // AI Assistant
                'aiAssistant': 'AI Помощник за намаз',
                'aiWelcome': 'Ас-саляму алейкум! Аз съм вашият AI асистент за намаз. Мога да отговарям на въпроси за молитвени времена, уду, ракати и кибла. Как мога да ви помогна?',
                'aiPlaceholder': 'Задайте въпрос за намаза...',
                'aiAskRakat': 'колко раката има фаджр',
                'aiAskWudu': 'как се прави уду',
                'aiAskQibla': 'към къде е кибла',
                'aiAskJumuah': 'кога се прави джума',
                'aiFajrRakat': '🌅 Фаджр (утрешен намаз) има 2 раката сунна и 2 раката фард. Общо 4 раката.',
                'aiWuduSteps': '💧 Уду (мало омовение) включва следните стъпки:\n\n1. 👐 Умиване на ръцете 3 пъти\n2. 👄 Изплакване на устата 3 пъти\n3. 👃 Изсмукване на вода в носа 3 пъти\n4. 😷 Умиване на лицето 3 пъти\n5. 💪 Умиване на ръцете до лактите 3 пъти\n6. 👤 Протриване на главата веднъж\n7. 🦶 Умиване на краката до глезените 3 пъти\n\n💡 Уду е задължително преди всеки намаз.',
                'aiQiblaDirection': '🕋 В България, киблата е посоката към Кааба в Мека, приблизително 135 градуса югоизток.\n📍 За точна посока използвайте вградения GPS компас в приложението.\n👉 Натиснете бутона "Определи моята локация" за точна кибла посока.',
                'aiJumuahInfo': '🕌 Джума (петъчен намаз) се извършва вместо Зухр на всеки петък в обеден час.\n📖 Има 2 раката фард и се извършва в джамия с хутба (проповед).',
                'aiRakatInfo': '📿 Ракатите по намази са:\n\n• 🌅 Фаджр: 2 сунна + 2 фард\n• 🕛 Зухр: 4 сунна + 4 фард + 2 сунна\n• ⏳ Аср: 4 сунна + 4 фард\n• 🌇 Магриб: 3 фард + 2 сунна\n• 🌙 Иша: 4 сунна + 4 фард + 2 сунна + 3 витър',
                'aiNextPrayer': 'Следващият намаз е',
                'aiAfter': 'след',
                'aiHours': 'часа и',
                'aiMinutes': 'минути',
                'aiDefault': '🤖 Благодаря за въпроса! За конкретна информация:\n\n• ⏰ За молитвени времена - питайте "кога е следващият намаз"\n• 📿 За ракати - посочете конкретен намаз\n• 💧 За уду - питайте "стъпки за уду"\n• 🕋 За кибла - използвайте GPS функцията\n\nАс-саляму алейкум!'
            },
            'en': {
                // Основни
                'pageTitle': 'Prayer Times',
                'appName': 'Prayer Times',
                'calendar': 'Monthly Overview',
                'live': 'Live Countdown',
                'cart': 'Cart',
                'ai': 'AI Assistant',
                'users': 'Users',
                'selectCity': 'Select city:',
                'myLocation': 'My Location',
                'citiesMap': 'Cities Map',
                'today': 'Today:',
                'date': 'Date',
                'day': 'Day',
                'fajr': 'Fajr',
                'sunrise': 'Sunrise',
                'dhuhr': 'Dhuhr',
                'asr': 'Asr',
                'maghrib': 'Maghrib',
                'isha': 'Isha',
                
                // Дни от седмицата
                'понеделник': 'Monday',
                'вторник': 'Tuesday',
                'сряда': 'Wednesday',
                'четвъртък': 'Thursday',
                'петък': 'Friday',
                'събота': 'Saturday',
                'неделя': 'Sunday',
                
                // Месеци
                'january': 'January',
                'february': 'February',
                'march': 'March',
                'april': 'April',
                'may': 'May',
                'june': 'June',
                'july': 'July',
                'august': 'August',
                'september': 'September',
                'october': 'October',
                'november': 'November',
                'december': 'December',
                
                // GPS
                'gpsTitle': 'GPS Location & Qibla Compass',
                'gpsClick': 'Click for location',
                'getLocation': 'Get My Location',
                'qibla': 'Qibla:',
                'southeast': 'SE',
                'distanceToMakkah': 'To Makkah:',
                
                // Приложения
                'androidApp': 'Android Application',
                'iosApp': 'iOS Application',
                'smartWatch': 'Prayer Watch',
                'fullAccess': 'Full access to all features',
                'downloadAPK': 'Download APK (80MB)',
                'forDevices': 'For iPhone & iPad',
                'downloadIPA': 'Download IPA (80MB)',
                'desktopVersion': 'Desktop Version',
                'GooglePlayVersion':'Google Play download',
                'desktopDescription': 'Full version for Windows 10/11',
                'GooglePlayDescription': 'AAB version',
                'downloadGooglePlay': 'Download from Google Play',
                'downloadWindows': 'Download for Windows',
                'accurateTimes': 'Accurate Times',
                'offlineSupport': 'Offline',
                'notifications': 'Notifications',
                'voiceReading': 'Voice Reading',
                'multilingual': 'Multilingual',
                
                // Достъпност
                'accessibility': 'Accessibility',
                'highContrast': 'High Contrast',
                'largeText': 'Large Text',
                'colorBlind': 'Color Blind',
                
                // Статистика
                'dailyStats': 'Daily Statistics',
                'fastingHours': 'hours fasting',
                'daylightHours': 'daylight duration',
                'nextPrayerTime': 'to next prayer',
                'fullAnalytics': 'Full Analytics',
                'analytics': 'Analytics & Statistics',
                'dayDistribution': 'Day Distribution',
                'daylightDuration': 'Daylight Duration',
                'fastingTime': 'Fasting Time',
                'fastingHoursToday': 'hours fasting today',
                'eatingWindow': 'hours eating window',
                'monthlyStats': 'Monthly Statistics',
                'earliestFajr': 'Earliest Fajr:',
                'latestIsha': 'Latest Isha:',
                'avgDayLength': 'Average day length:',
                'fridayCount': 'Friday prayers:',
                'monthChange': 'Change from last month:',
                'longestDay': 'Longest day:',
                'shortestDay': 'Shortest day:',
                'longestFasting': 'Longest fasting:',
                'shortestFasting': 'Shortest fasting:',
                'dayProgress': 'Day progress:',
                'totalRecords': 'Total records:',
                'days': 'days',
                'fridayCountTable': 'Friday prayers:',
                
                // Таблица легенда
                'todayDay': "Today's day",
                'fridayPrayer': 'Friday (Jumuah)',
                'passedPrayer': 'Passed prayer',
                'upcomingPrayer': 'Coming soon',
                'printTable': 'Print table',
                
                // Умен часовник - детайли
                'new': 'NEW',
                'reviews': 'reviews',
                'speciallyDesigned': 'Specially designed for Muslims',
                'withFeatures': 'with intelligent features:',
                'autoNotifications': 'Automatic notifications',
                'beforePrayer': 'before each prayer',
                'builtInCompass': 'Built-in compass',
                'forQibla': 'for qibla with vibration',
                'autoUpdate': 'Automatic update',
                'ofTimes': 'of prayer times',
                'batteryLife': '7 days battery',
                'fastCharging': 'with fast charging',
                'waterResistant': 'Water resistant',
                'upTo': 'up to 50m',
                'monitor': 'Monitor',
                'forHeart': 'for heart rate and sleep',
                'currency': 'EUR',
                'saveAmount': 'Save 50 EUR!',
                'addToCart': 'Add to Cart',
                'freeShipping': 'Free shipping for Bulgaria',
                'returnPolicy': '14-day return policy',
                'warranty': '2 years warranty',
                
                // Количка
                'subtotal': 'Subtotal:',
                'shipping': 'Shipping:',
                'total': 'Total:',
                'proceedToCheckout': 'Proceed to Checkout',
                'installApp': 'Install App',
                'printTable':'Export table',
                
                // Поръчка
                'completeOrder': 'Complete Order',
                'fullName': 'Full Name:',
                'emailAddress': 'Email Address:',
                'phoneNumber': 'Phone Number:',
                'deliveryMethod': 'Delivery Method:',
                'chooseDelivery': 'Choose delivery method',
                'toAddress': 'To address',
                'toOffice': 'To office',
                'deliveryAddress': 'Delivery Address:',
                'city': 'City:',
                'orderDetails': 'Order Details:',
                'totalAmount': 'Total Amount:',
                'submitOrder': 'Submit Order',
                'cancel': 'Cancel',
                
                // Сравнение между градове
                'cityComparison': 'City Comparison',
                'firstCity': 'First city:',
                'secondCity': 'Second city:',
                'updateComparison': 'Update Comparison',
                
                // Потребителско меню
                'settings': 'Settings',
                'logout': 'Logout',
                
                // Footer
                'aboutProject': 'About Project',
                'projectDescription': 'Prayer Times is an intelligent platform for prayer times with GPS location, full analytics and offline support.',
                'technologies': 'Technologies',
                'techStack': 'HTML5, CSS3, JavaScript (ES6+), PHP 8, MySQL, Chart.js, PWA, Service Workers, Geolocation API, RESTful API, HTTP Requests',
                'olympiad': 'Olympiad',
                'olympiadDescription': 'Project for National Informatics Olympiad 2026.',
                'allRights': 'All rights reserved.',
                'projectDetails': 'Project Details',
                'techDocs': 'Technical Documentation',
                'developer': 'Contact the developer: yusuf.kapanak@pmggd.bg - Yusuf Kapanak',
                
                // Хиджри и други
                'loading': 'Loading...',
                
                // AI Assistant
                'aiAssistant': 'AI Prayer Assistant',
                'aiWelcome': 'Assalamu alaikum! I am your AI prayer assistant. I can answer questions about prayer times, wudu, rakats, and qibla. How can I help you?',
                'aiPlaceholder': 'Ask a question about prayer...',
                'aiAskRakat': 'how many rakats in fajr',
                'aiAskWudu': 'how to do wudu',
                'aiAskQibla': 'which direction is qibla',
                'aiAskJumuah': 'when is jumuah',
                'aiFajrRakat': '🌅 Fajr (morning prayer) has 2 rakats sunnah and 2 rakats fard. Total 4 rakats.',
                'aiWuduSteps': '💧 Wudu (ablution) includes the following steps:\n\n1. 👐 Wash hands 3 times\n2. 👄 Rinse mouth 3 times\n3. 👃 Sniff water into nose 3 times\n4. 😷 Wash face 3 times\n5. 💪 Wash arms to elbows 3 times\n6. 👤 Wipe head once\n7. 🦶 Wash feet to ankles 3 times\n\n💡 Wudu is required before every prayer.',
                'aiQiblaDirection': '🕋 In Bulgaria, the qibla direction is towards the Kaaba in Mecca, approximately 135 degrees southeast.\n📍 For exact direction, use the built-in GPS compass in the app.\n👉 Click "Get My Location" button for exact qibla direction.',
                'aiJumuahInfo': '🕌 Jumuah (Friday prayer) is performed instead of Dhuhr every Friday at noon.\n📖 It has 2 rakats fard and is performed in a mosque with khutbah (sermon).',
                'aiRakatInfo': '📿 Rakats per prayer:\n\n• 🌅 Fajr: 2 sunnah + 2 fard\n• 🕛 Dhuhr: 4 sunnah + 4 fard + 2 sunnah\n• ⏳ Asr: 4 sunnah + 4 fard\n• 🌇 Maghrib: 3 fard + 2 sunnah\n• 🌙 Isha: 4 sunnah + 4 fard + 2 sunnah + 3 witr',
                'aiNextPrayer': 'Next prayer is',
                'aiAfter': 'after',
                'aiHours': 'hours and',
                'aiMinutes': 'minutes',
                'aiDefault': '🤖 Thank you for your question! For specific information:\n\n• ⏰ For prayer times - ask "when is the next prayer"\n• 📿 For rakats - specify a prayer\n• 💧 For wudu - ask "wudu steps"\n• 🕋 For qibla - use the GPS function\n\nAssalamu alaikum!'
            },
            'tr': {
                // Основни
                'pageTitle': 'Namaz Vakitleri',
                'appName': 'Namaz Vakitleri',
                'calendar': 'Aylık Görünüm',
                'live': 'Canlı Geri Sayım',
                'cart': 'Sepet',
                'ai': 'AI Asistan',
                'users': 'Kullanıcılar',
                'selectCity': 'Şehir seçin:',
                'myLocation': 'Konumum',
                'citiesMap': 'Şehir Haritası',
                'today': 'Bugün:',
                'date': 'Tarih',
                'day': 'Gün',
                'fajr': 'Sabah',
                'sunrise': 'Güneş',
                'dhuhr': 'Öğle',
                'asr': 'İkindi',
                'maghrib': 'Akşam',
                'isha': 'Yatsı',
                
                // Дни от седмицата
                'понеделник': 'Pazartesi',
                'вторник': 'Salı',
                'сряда': 'Çarşamba',
                'четвъртък': 'Perşembe',
                'петък': 'Cuma',
                'събота': 'Cumartesi',
                'неделя': 'Pazar',
                
                // Месеци
                'january': 'Ocak',
                'february': 'Şubat',
                'march': 'Mart',
                'april': 'Nisan',
                'may': 'Mayıs',
                'june': 'Haziran',
                'july': 'Temmuz',
                'august': 'Ağustos',
                'september': 'Eylül',
                'october': 'Ekim',
                'november': 'Kasım',
                'december': 'Aralık',
                
                // GPS
                'gpsTitle': 'GPS Konum & Kıble Pusulası',
                'gpsClick': 'Konum için tıklayın',
                'getLocation': 'Konumumu Belirle',
                'qibla': 'Kıble:',
                'southeast': 'GD',
                'distanceToMakkah': 'Mekke\'ye:',
                
                // Приложения
                'androidApp': 'Android Uygulama',
                'iosApp': 'iOS Uygulama',
                'smartWatch': 'Namaz Saati',
                'fullAccess': 'Tüm özelliklere tam erişim',
                'downloadAPK': 'APK İndir (80MB)',
                'forDevices': 'iPhone & iPad için',
                'downloadIPA': 'IPA İndir (80MB)',
                'desktopVersion': 'Masaüstü Versiyonu',
                'GooglePlayVersion':'Google Play için İndir',
                'desktopDescription': 'Windows 10/11 için tam sürüm',
                'GooglePlayDescription': 'AAB sürümü',
                'downloadGooglePlay': 'Google Play den indirin',
                'downloadWindows': 'Windows için İndir',
                'accurateTimes': 'Doğru Vakitler',
                'offlineSupport': 'Çevrimdışı',
                'notifications': 'Bildirimler',
                'voiceReading': 'Sesli Okuma',
                'multilingual': 'Çok Dilli',
                
                // Достъпност
                'accessibility': 'Erişilebilirlik',
                'highContrast': 'Yüksek Kontrast',
                'largeText': 'Büyük Metin',
                'colorBlind': 'Renk Körlüğü',
                
                // Статистика
                'dailyStats': 'Günlük İstatistikler',
                'fastingHours': 'saat oruç',
                'daylightHours': 'gündüz süresi',
                'nextPrayerTime': 'sonraki namaza',
                'fullAnalytics': 'Tam Analitik',
                'analytics': 'Analitik & İstatistik',
                'dayDistribution': 'Gün Dağılımı',
                'daylightDuration': 'Gündüz Süresi',
                'fastingTime': 'Oruç Süresi',
                'fastingHoursToday': 'bugün oruç saatleri',
                'eatingWindow': 'yemek saati',
                'monthlyStats': 'Aylık İstatistikler',
                'earliestFajr': 'En Erken Sabah:',
                'latestIsha': 'En Geç Yatsı:',
                'avgDayLength': 'Ortalama gün uzunluğu:',
                'fridayCount': 'Cuma namazları:',
                'monthChange': 'Geçen aya göre değişim:',
                'longestDay': 'En uzun gün:',
                'shortestDay': 'En kısa gün:',
                'longestFasting': 'En uzun oruç:',
                'shortestFasting': 'En kısa oruç:',
                'dayProgress': 'Gün ilerlemesi:',
                'totalRecords': 'Toplam kayıt:',
                'days': 'gün',
                'fridayCountTable': 'Cuma namazları:',
                
                // Таблица легенда
                'todayDay': 'Bugünün günü',
                'fridayPrayer': 'Cuma (Cuma Namazı)',
                'passedPrayer': 'Geçmiş namaz',
                'upcomingPrayer': 'Yakında gelecek',
                'printTable': 'Tabloyu yazdır',
                'printTable':'Tabloyu dışa aktar',
                
                // Умен часовник - детайли
                'new': 'YENİ',
                'reviews': 'yorum',
                'speciallyDesigned': 'Müslümanlar için özel tasarlandı',
                'withFeatures': 'akıllı özelliklerle:',
                'autoNotifications': 'Otomatik bildirimler',
                'beforePrayer': 'her namazdan önce',
                'builtInCompass': 'Yerleşik pusula',
                'forQibla': 'kıble için titreşimli',
                'autoUpdate': 'Otomatik güncelleme',
                'ofTimes': 'namaz vakitlerinin',
                'batteryLife': '7 gün pil ömrü',
                'fastCharging': 'hızlı şarj ile',
                'waterResistant': 'Su geçirmez',
                'upTo': '50m\'ye kadar',
                'monitor': 'Monitör',
                'forHeart': 'kalp atışı ve uyku için',
                'currency': 'EUR',
                'saveAmount': '50 EUR tasarruf edin!',
                'addToCart': 'Sepete Ekle',
                'freeShipping': 'Bulgaristan için ücretsiz kargo',
                'returnPolicy': '14 gün iade garantisi',
                'warranty': '2 yıl garanti',
                
                // Количка
                'subtotal': 'Ara toplam:',
                'shipping': 'Kargo:',
                'total': 'Toplam:',
                'proceedToCheckout': 'Ödemeye Geç',
                'installApp': 'Uygulamayı Yükle',
                
                // Поръчка
                'completeOrder': 'Siparişi Tamamla',
                'fullName': 'Ad Soyad:',
                'emailAddress': 'E-posta Adresi:',
                'phoneNumber': 'Telefon Numarası:',
                'deliveryMethod': 'Teslimat Yöntemi:',
                'chooseDelivery': 'Teslimat yöntemi seçin',
                'toAddress': 'Adrese',
                'toOffice': 'Ofise',
                'deliveryAddress': 'Teslimat Adresi:',
                'city': 'Şehir:',
                'orderDetails': 'Sipariş Detayları:',
                'totalAmount': 'Toplam Tutar:',
                'submitOrder': 'Siparişi Gönder',
                'cancel': 'İptal',
                
                // Сравнение между градове
                'cityComparison': 'Şehir Karşılaştırması',
                'firstCity': 'Birinci şehir:',
                'secondCity': 'İkinci şehir:',
                'updateComparison': 'Karşılaştırmayı Güncelle',
                
                // Потребителско меню
                'settings': 'Ayarlar',
                'logout': 'Çıkış',
                
                // Footer
                'aboutProject': 'Proje Hakkında',
                'projectDescription': 'Namaz Vakitleri, GPS konum, tam analitik ve çevrimdışı destek ile namaz vakitleri için akıllı bir platformdur.',
                'technologies': 'Teknolojiler',
                'techStack': 'HTML5, CSS3, JavaScript (ES6+), PHP 8, MySQL, Chart.js, PWA, Service Workers, Geolocation API, RESTful API, HTTP Requests',
                'olympiad': 'Olimpiyat',
                'olympiadDescription': '2026 Ulusal Bilişim Olimpiyatı için proje.',
                'allRights': 'Tüm hakları saklıdır.',
                'projectDetails': 'Proje Detayları',
                'techDocs': 'Teknik Dokümantasyon',
                'developer': 'Geliştiriciyle iletişime geçin: yusuf.kapanak@pmggd.bg - Yusuf Kapanak',
                
                // Хиджри и други
                'loading': 'Yükleniyor...',
                
                // AI Assistant
                'aiAssistant': 'AI Namaz Asistanı',
                'aiWelcome': 'Esselamu aleyküm! Ben sizin AI namaz asistanınızım. Namaz vakitleri, abdest, rekatlar ve kıble hakkında soruları cevaplayabilirim. Size nasıl yardımcı olabilirim?',
                'aiPlaceholder': 'Namaz hakkında soru sorun...',
                'aiAskRakat': 'sabah namazı kaç rekat',
                'aiAskWudu': 'abdest nasıl alınır',
                'aiAskQibla': 'kıble hangi yönde',
                'aiAskJumuah': 'cuma namazı ne zaman',
                'aiFajrRakat': '🌅 Sabah namazı 2 rekat sünnet ve 2 rekat farzdır. Toplam 4 rekattır.',
                'aiWuduSteps': '💧 Abdest şu adımları içerir:\n\n1. 👐 Elleri 3 kere yıkamak\n2. 👄 Ağzı 3 kere çalkalamak\n3. 👃 Burna 3 kere su çekmek\n4. 😷 Yüzü 3 kere yıkamak\n5. 💪 Kolları dirseklere kadar 3 kere yıkamak\n6. 👤 Başı mesh etmek (1 kere)\n7. 🦶 Ayakları topuklara kadar 3 kere yıkamak\n\n💡 Abdest her namazdan önce gereklidir.',
                'aiQiblaDirection': '🕋 Bulgaristan\'da kıble yönü Mekke\'deki Kabe\'ye doğrudur, yaklaşık 135 derece güneydoğu.\n📍 Tam yön için uygulamadaki GPS pusulasını kullanın.\n👉 Tam kıble yönü için "Konumumu Belirle" düğmesine tıklayın.',
                'aiJumuahInfo': '🕌 Cuma namazı, her Cuma öğle vaktinde öğle namazı yerine kılınır.\n📖 2 rekat farzdır ve hutbe ile birlikte camide kılınır.',
                'aiRakatInfo': '📿 Namaz rekatları:\n\n• 🌅 Sabah: 2 sünnet + 2 farz\n• 🕛 Öğle: 4 sünnet + 4 farz + 2 sünnet\n• ⏳ İkindi: 4 sünnet + 4 farz\n• 🌇 Akşam: 3 farz + 2 sünnet\n• 🌙 Yatsı: 4 sünnet + 4 farz + 2 sünnet + 3 vitir',
                'aiNextPrayer': 'Sıradaki namaz',
                'aiAfter': 'sonra',
                'aiHours': 'saat ve',
                'aiMinutes': 'dakika',
                'aiDefault': '🤖 Sorunuz için teşekkürler! Özel bilgi için:\n\n• ⏰ Namaz vakitleri için - "sıradaki namaz ne zaman" sorun\n• 📿 Rekatlar için - bir namaz belirtin\n• 💧 Abdest için - "abdest adımları" sorun\n• 🕋 Kıble için - GPS işlevini kullanın\n\nEsselamu aleyküm!'
            },
            'ar': {
                // Основни
                'pageTitle': 'أوقات الصلاة برو',
                'appName': 'أوقات الصلاة',
                'calendar': 'نظرة شهرية',
                'live': 'عد تنازلي مباشر',
                'cart': 'عربة التسوق',
                'ai': 'مساعد الذكاء الاصطناعي',
                'users': 'المستخدمين',
                'selectCity': 'اختر المدينة:',
                'myLocation': 'موقعي',
                'citiesMap': 'خريطة المدن',
                'today': 'اليوم:',
                'date': 'التاريخ',
                'day': 'اليوم',
                'fajr': 'الفجر',
                'sunrise': 'الشروق',
                'dhuhr': 'الظهر',
                'asr': 'العصر',
                'maghrib': 'المغرب',
                'isha': 'العشاء',
                
                // Дни от седмицата
                'понеделник': 'الاثنين',
                'вторник': 'الثلاثاء',
                'сряда': 'الأربعاء',
                'четвъртък': 'الخميس',
                'петък': 'الجمعة',
                'събота': 'السبت',
                'неделя': 'الأحد',
                
                // Месеци
                'january': 'يناير',
                'february': 'فبراير',
                'march': 'مارس',
                'april': 'أبريل',
                'may': 'مايو',
                'june': 'يونيو',
                'july': 'يوليو',
                'august': 'أغسطس',
                'september': 'سبتمبر',
                'october': 'أكتوبر',
                'november': 'نوفمبر',
                'december': 'ديسمبر',
                
                // GPS
                'gpsTitle': 'GPS الموقع & بوصلة القبلة',
                'gpsClick': 'انقر للحصول على الموقع',
                'getLocation': 'تحديد موقعي',
                'qibla': 'القبلة:',
                'southeast': 'جنوب شرق',
                'distanceToMakkah': 'إلى مكة:',
                
                // Приложения
                'androidApp': 'تطبيق أندرويد',
                'iosApp': 'تطبيق iOS',
                'smartWatch': 'ساعة الصلاة',
                'fullAccess': 'وصول كامل لجميع الميزات',
                'downloadAPK': 'تحميل APK (80MB)',
                'forDevices': 'لـ iPhone & iPad',
                'downloadIPA': 'تحميل IPA (80MB)',
                'desktopVersion': 'إصدار سطح المكتب',
                'GooglePlayVersion':'تحميل لجوجل بلاي',
                'desktopDescription': 'الإصدار الكامل لنظام Windows 10/11',
                'GooglePlayDescription': 'نسخة ايه ايه بي',
                'downloadGooglePlay': 'تحميل من جوجل بلاي',
                'downloadWindows': 'تحميل لنظام Windows',
                'accurateTimes': 'أوقات دقيقة',
                'offlineSupport': 'بدون اتصال',
                'notifications': 'إشعارات',
                'voiceReading': 'قراءة صوتية',
                'multilingual': 'متعدد اللغات',
                
                // Достъпност
                'accessibility': 'إمكانية الوصول',
                'highContrast': 'تباين عالي',
                'largeText': 'نص كبير',
                'colorBlind': 'عمى الألوان',
                
                // Статистика
                'dailyStats': 'إحصائيات يومية',
                'fastingHours': 'ساعات صيام',
                'daylightHours': 'مدة النهار',
                'nextPrayerTime': 'حتى الصلاة التالية',
                'fullAnalytics': 'تحليلات كاملة',
                'analytics': 'التحليلات والإحصاءات',
                'dayDistribution': 'توزيع اليوم',
                'daylightDuration': 'مدة النهار',
                'fastingTime': 'وقت الصيام',
                'fastingHoursToday': 'ساعات الصيام اليوم',
                'eatingWindow': 'ساعات تناول الطعام',
                'monthlyStats': 'إحصائيات شهرية',
                'earliestFajr': 'أقرب الفجر:',
                'latestIsha': 'أحدث العشاء:',
                'avgDayLength': 'متوسط طول اليوم:',
                'fridayCount': 'صلوات الجمعة:',
                'monthChange': 'التغيير عن الشهر الماضي:',
                'longestDay': 'أطول يوم:',
                'shortestDay': 'أقصر يوم:',
                'longestFasting': 'أطول صيام:',
                'shortestFasting': 'أقصر صيام:',
                'dayProgress': 'تقدم اليوم:',
                'totalRecords': 'إجمالي السجلات:',
                'days': 'أيام',
                'fridayCountTable': 'صلوات الجمعة:',
                
                // Таблица легенда
                'todayDay': 'يوم اليوم',
                'fridayPrayer': 'الجمعة (صلاة الجمعة)',
                'passedPrayer': 'صلاة ماضية',
                'upcomingPrayer': 'قريبًا',
                'printTable': 'طباعة الجدول',
                'printTable':'جدول التصدير',
                
                // Умен часовник - детайли
                'new': 'جديد',
                'reviews': 'تقييم',
                'speciallyDesigned': 'مصمم خصيصًا للمسلمين',
                'withFeatures': 'بميزات ذكية:',
                'autoNotifications': 'إشعارات تلقائية',
                'beforePrayer': 'قبل كل صلاة',
                'builtInCompass': 'بوصلة مدمجة',
                'forQibla': 'للقبلة مع الاهتزاز',
                'autoUpdate': 'تحديث تلقائي',
                'ofTimes': 'لأوقات الصلاة',
                'batteryLife': 'بطارية 7 أيام',
                'fastCharging': 'مع شحن سريع',
                'waterResistant': 'مقاوم للماء',
                'upTo': 'حتى 50م',
                'monitor': 'مراقب',
                'forHeart': 'لمعدل ضربات القلب والنوم',
                'currency': 'يورو',
                'saveAmount': 'وفر 50 يورو!',
                'addToCart': 'أضف إلى السلة',
                'freeShipping': 'شحن مجاني لبلغاريا',
                'returnPolicy': 'سياسة إرجاع 14 يومًا',
                'warranty': 'ضمان سنتين',
                
                // Количка
                'subtotal': 'المجموع الفرعي:',
                'shipping': 'الشحن:',
                'total': 'المجموع:',
                'proceedToCheckout': 'المتابعة إلى الدفع',
                'installApp': 'تثبيت التطبيق',
                
                // Поръчка
                'completeOrder': 'إكمال الطلب',
                'fullName': 'الاسم الكامل:',
                'emailAddress': 'عنوان البريد الإلكتروني:',
                'phoneNumber': 'رقم الهاتف:',
                'deliveryMethod': 'طريقة التوصيل:',
                'chooseDelivery': 'اختر طريقة التوصيل',
                'toAddress': 'إلى العنوان',
                'toOffice': 'إلى المكتب',
                'deliveryAddress': 'عنوان التوصيل:',
                'city': 'المدينة:',
                'orderDetails': 'تفاصيل الطلب:',
                'totalAmount': 'المبلغ الإجمالي:',
                'submitOrder': 'إرسال الطلب',
                'cancel': 'إلغاء',
                
                // Сравнение между градове
                'cityComparison': 'مقارنة المدن',
                'firstCity': 'المدينة الأولى:',
                'secondCity': 'المدينة الثانية:',
                'updateComparison': 'تحديث المقارنة',
                
                // Потребителско меню
                'settings': 'الإعدادات',
                'logout': 'تسجيل الخروج',
                
                // Footer
                'aboutProject': 'حول المشروع',
                'projectDescription': 'أوقات الصلاة هي منصة ذكية لأوقات الصلاة مع موقع GPS، تحليلات كاملة ودعم دون اتصال.',
                'technologies': 'التقنيات',
                'techStack': 'HTML5, CSS3, JavaScript (ES6+), PHP 8, MySQL, Chart.js, PWA, Service Workers, Geolocation API, RESTful API, HTTP Requests',
                'olympiad': 'الأولمبياد',
                'olympiadDescription': 'مشروع للأولمبياد الوطني للمعلوماتية 2026.',
                'allRights': 'جميع الحقوق محفوظة.',
                'projectDetails': 'تفاصيل المشروع',
                'techDocs': 'الوثائق الفنية',
                'developer': 'اتصل بالمطور: yusuf.kapanak@pmggd.bg - يوسف كاباناك',
                
                // Хиджри и други
                'loading': 'جاري التحميل...',
                
                // AI Assistant
                'aiAssistant': 'مساعد الصلاة الذكي',
                'aiWelcome': 'السلام عليكم! أنا مساعدكم الذكي للصلاة. يمكنني الإجابة على أسئلة حول أوقات الصلاة، الوضوء، الركعات، والقبلة. كيف يمكنني مساعدتك؟',
                'aiPlaceholder': 'اسأل سؤالاً عن الصلاة...',
                'aiAskRakat': 'كم ركعة في الفجر',
                'aiAskWudu': 'كيفية الوضوء',
                'aiAskQibla': 'في أي اتجاه القبلة',
                'aiAskJumuah': 'متى صلاة الجمعة',
                'aiFajrRakat': '🌅 صلاة الفجر: 2 ركعة سنة + 2 ركعة فرض. المجموع 4 ركعات.',
                'aiWuduSteps': '💧 الوضوء يشمل الخطوات التالية:\n\n1. 👐 غسل اليدين 3 مرات\n2. 👄 المضمضة 3 مرات\n3. 👃 الاستنشاق 3 مرات\n4. 😷 غسل الوجه 3 مرات\n5. 💪 غسل الذراعين إلى المرفقين 3 مرات\n6. 👤 مسح الرأس مرة واحدة\n7. 🦶 غسل القدمين إلى الكعبين 3 مرات\n\n💡 الوضوء واجب قبل كل صلاة.',
                'aiQiblaDirection': '🕋 في بلغاريا، اتجاه القبلة نحو الكعبة في مكة، حوالي 135 درجة جنوب شرق.\n📍 للاتجاه الدقيق، استخدم بوصلة GPS المدمجة في التطبيق.\n👉 انقر على زر "تحديد موقعي" للحصول على اتجاه القبلة الدقيق.',
                'aiJumuahInfo': '🕌 صلاة الجمعة تؤدى بدلاً من الظهر كل يوم جمعة في وقت الظهيرة.\n📖 وهي ركعتان فرض وتؤدى في المسجد مع خطبة.',
                'aiRakatInfo': '📿 ركعات الصلوات:\n\n• 🌅 الفجر: 2 سنة + 2 فرض\n• 🕛 الظهر: 4 سنة + 4 فرض + 2 سنة\n• ⏳ العصر: 4 سنة + 4 فرض\n• 🌇 المغرب: 3 فرض + 2 سنة\n• 🌙 العشاء: 4 سنة + 4 فرض + 2 سنة + 3 وتر',
                'aiNextPrayer': 'الصلاة التالية',
                'aiAfter': 'بعد',
                'aiHours': 'ساعة و',
                'aiMinutes': 'دقيقة',
                'aiDefault': '🤖 شكراً على سؤالك! لمعلومات محددة:\n\n• ⏰ لأوقات الصلاة - اسأل "متى الصلاة التالية"\n• 📿 للركعات - حدد صلاة معينة\n• 💧 للوضوء - اسأل "خطوات الوضوء"\n• 🕋 للقبلة - استخدم وظيفة GPS\n\nالسلام عليكم!'
            }
        };
        
        this.init();
    }
    
    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        const phpLang = window.userSavedLanguage;
        const savedLang = localStorage.getItem('prayerAppLang');
        
        if (phpLang && this.translations[phpLang]) {
            this.currentLang = phpLang;
            localStorage.setItem('prayerAppLang', this.currentLang);
        } else if (urlLang && this.translations[urlLang]) {
            this.currentLang = urlLang;
            localStorage.setItem('prayerAppLang', this.currentLang);
        } else if (savedLang && this.translations[savedLang]) {
            this.currentLang = savedLang;
        } else {
            this.currentLang = 'bg';
            localStorage.setItem('prayerAppLang', this.currentLang);
        }
        
        console.log(`[Multilingual] Initialized with language: ${this.currentLang}`);
        this.applyTranslations();
        this.updateTextDirection(this.currentLang);
        this.initLanguageButtons();
    }
    
    initLanguageButtons() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                this.switchLanguage(lang);
            });
            
            if (btn.dataset.lang === this.currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    switchLanguage(lang) {
        if (!this.translations[lang]) return;
        
        this.currentLang = lang;
        localStorage.setItem('prayerAppLang', lang);
        
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.pushState({}, '', url);
        
        this.applyTranslations();
        this.updateTextDirection(lang);
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            }
        });
        
        this.showNotification(`Language changed to ${this.getLanguageName(lang)}`, 'success');
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
        if (window.aiAssistant) {
            window.aiAssistant.updateTranslations();
        }
    }
    
    applyTranslations() {
        const dict = this.translations[this.currentLang];
        
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.dataset.translate;
            if (dict[key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = dict[key];
                } else {
                    element.textContent = dict[key];
                }
            }
        });
        
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.dataset.translatePlaceholder;
            if (dict[key]) {
                element.placeholder = dict[key];
            }
        });
        
        document.querySelectorAll('[data-translate-title]').forEach(element => {
            const key = element.dataset.translateTitle;
            if (dict[key]) {
                element.title = dict[key];
            }
        });
        
        const monthNames = {
            'bg': ['Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни', 'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'],
            'en': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            'tr': ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
            'ar': ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
        };
        
        const currentMonthElement = document.querySelector('.current-month');
        if (currentMonthElement) {
            const monthText = currentMonthElement.textContent;
            const match = monthText.match(/([А-Яа-яA-Za-zА-я]+)\s+(\d{4})/);
            if (match) {
                const monthIndex = monthNames['bg'].indexOf(match[1]);
                if (monthIndex !== -1) {
                    const translatedMonth = monthNames[this.currentLang][monthIndex];
                    currentMonthElement.textContent = `${translatedMonth} ${match[2]}`;
                }
            }
        }
    }
    
    updateTextDirection(lang) {
        if (lang === 'ar') {
            document.body.style.direction = 'rtl';
            document.body.classList.add('rtl-layout');
        } else {
            document.body.style.direction = 'ltr';
            document.body.classList.remove('rtl-layout');
        }
    }
    
    getLanguageName(code) {
        const names = {'bg': 'Български', 'en': 'English', 'tr': 'Türkçe', 'ar': 'العربية'};
        return names[code] || code;
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
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
            background: ${type === 'success' ? '#38b000' : type === 'error' ? '#ff6b6b' : '#4d96ff'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    translate(key) {
        return this.translations[this.currentLang][key] || key;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.multilingual = new MultilingualManager();
});