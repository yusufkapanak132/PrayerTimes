using System;
using System.Collections.Generic;

namespace PrayerTimesApp
{
    public static class Translations
    {
        // Езици и флагове
        public static readonly Dictionary<string, (string name, string flag)> Languages =
            new Dictionary<string, (string, string)>
            {
                { "bg", ("Български", "🇧🇬") },
                { "en", ("English", "🇺🇸") },
                { "tr", ("Türkçe", "🇹🇷") },
                { "ar", ("العربية", "🇸🇦") }
            };

        // Гласови настройки по езици
        public static readonly Dictionary<string, (string culture, System.Speech.Synthesis.VoiceGender gender, System.Speech.Synthesis.VoiceAge age)> VoiceSettings =
            new Dictionary<string, (string, System.Speech.Synthesis.VoiceGender, System.Speech.Synthesis.VoiceAge)>
            {
                { "bg", ("bg-BG", System.Speech.Synthesis.VoiceGender.Female, System.Speech.Synthesis.VoiceAge.Adult) },
                { "en", ("en-US", System.Speech.Synthesis.VoiceGender.Female, System.Speech.Synthesis.VoiceAge.Adult) },
                { "tr", ("tr-TR", System.Speech.Synthesis.VoiceGender.Female, System.Speech.Synthesis.VoiceAge.Adult) },
                { "ar", ("ar-SA", System.Speech.Synthesis.VoiceGender.Female, System.Speech.Synthesis.VoiceAge.Adult) }
            };

        // Текст по езици
        public static readonly Dictionary<string, Dictionary<string, string>> LanguageTexts =
            new Dictionary<string, Dictionary<string, string>>
            {
                {
                    "bg", new Dictionary<string, string>
                    {
                        {"app_title", "Времена за Намаз"},
                        {"menu_settings", "Настройки"},
                        {"menu_about", "За Приложението"},
                        {"menu_exit", "Изход"},
                        {"tray_show", "Покажи"},
                        {"tray_exit", "Изход"},
                        {"next_prayer", "Следваща молитва"},
                        {"current_prayer", "Текуща молитва"},
                        {"fajr", "Зора"},
                        {"sunrise", "Изгрев"},
                        {"dhuhr", "Обедна"},
                        {"asr", "Следобедна"},
                        {"maghrib", "Вечерна"},
                        {"isha", "Нощна"},
                        {"friday", "Джума"},
                        {"noon", "Обедна"},
                        {"until", "до"},
                        {"good_night", "Лека нощ"},
                        {"see_you_tomorrow", "Очакваме ви отново утре!"},
                        {"copyright", "© Времената може да се разминават от 0 до 60 секунди с реалните."},
                        {"location_button", "📍"},
                        {"menu_button", "☰"},
                        {"language_button", "🌐"},
                        {"voice_button", "🔊"},
                        {"reminder_before", "мин. преди"},
                        {"reminder_now", "Време е за"},
                        {"settings_title", "Настройки"},
                        {"settings_minutes", "Минути преди известие:"},
                        {"settings_test", "🔔 Тест на известие"},
                        {"settings_note", "Забележка: Уверете се, че нотификациите от приложения са включени, за да получавате известия."},
                        {"settings_save", "ЗАПАЗИ"},
                        {"about_title", "За Приложението"},
                        {"about_version", "Версия 1.0\nИзчисления на точни времена за намаз."},
                        {"auto_location", "Автоматична Локация"},
                        {"search_location", "Търсене на град..."},
                        {"test_notification", "Тест"},
                        {"test_message", "Работи!"},
                        {"location_found", "Намерен: {0}"},
                        {"location_error", "Неуспешно определяне на местоположение."},
                        {"network_error", "Свържете се към мрежа за успешно намиране на локация: {0}"},
                        {"reminder_title", "Напомняне"},
                        {"time_title", "Време е"},
                        {"fajr_starts", "Зората започва след {0} мин."},
                        {"sunrise_starts", "Изгревът започва след {0} мин."},
                        {"prayer_starts", "{0}та молитва започва след {1} мин."},
                        {"fajr_started", "Зората започна сега."},
                        {"sunrise_started", "Изгревът започна сега."},
                        {"prayer_time", "Време е за {0}та молитва."},
                        {"my_location", "Моята Локация"},
                        {"voice_announcement", "Град: {0}. Времена за намаз днес: {2} в {3}, {4} в {5}, {6} в {7}, {8} в {9}, {10} в {11}, {12} в {13}. Следваща молитва: {14} след {15}."}
                    }
                },
                {
                    "en", new Dictionary<string, string>
                    {
                        {"app_title", "Prayer Times"},
                        {"menu_settings", "Settings"},
                        {"menu_about", "About"},
                        {"menu_exit", "Exit"},
                        {"tray_show", "Show"},
                        {"tray_exit", "Exit"},
                        {"next_prayer", "Next prayer"},
                        {"current_prayer", "Current prayer"},
                        {"fajr", "Fajr"},
                        {"sunrise", "Sunrise"},
                        {"dhuhr", "Dhuhr"},
                        {"asr", "Asr"},
                        {"maghrib", "Maghrib"},
                        {"isha", "Isha"},
                        {"friday", "Jumu'ah"},
                        {"noon", "Noon"},
                        {"until", "until"},
                        {"good_night", "Good night"},
                        {"see_you_tomorrow", "See you tomorrow!"},
                        {"copyright", "© The app may have discrepancies of 0 to 60 seconds with the real times."},
                        {"location_button", "📍"},
                        {"menu_button", "☰"},
                        {"language_button", "🌐"},
                        {"voice_button", "🔊"},
                        {"reminder_before", "min before"},
                        {"reminder_now", "Time for"},
                        {"settings_title", "Settings"},
                        {"settings_minutes", "Minutes before notification:"},
                        {"settings_test", "🔔 Test notification"},
                        {"settings_note", "Note: Make sure app notifications are enabled to receive alerts."},
                        {"settings_save", "SAVE"},
                        {"about_title", "About"},
                        {"about_version", "Version 1.0\nCalculations of accurate prayer times."},
                        {"auto_location", "Auto Location"},
                        {"search_location", "Search city..."},
                        {"test_notification", "Test"},
                        {"test_message", "Working!"},
                        {"location_found", "Found: {0}"},
                        {"location_error", "Failed to determine location."},
                        {"network_error", "Connect to network for successful location detection: {0}"},
                        {"reminder_title", "Reminder"},
                        {"time_title", "Time"},
                        {"fajr_starts", "Fajr starts in {0} min."},
                        {"sunrise_starts", "Sunrise starts in {0} min."},
                        {"prayer_starts", "{0} prayer starts in {1} min."},
                        {"fajr_started", "Fajr started now."},
                        {"sunrise_started", "Sunrise started now."},
                        {"prayer_time", "Time for {0} prayer."},
                        {"my_location", "My Location"},
                        {"voice_announcement", "City: {0}. Prayer times for today: {2} at {3}, {4} at {5}, {6} at {7}, {8} at {9}, {10} at {11}, {12} at {13}. Next prayer: {14} in {15}."}
                    }
                },
                {
                    "tr", new Dictionary<string, string>
                    {
                        {"app_title", "Namaz Vakitleri"},
                        {"menu_settings", "Ayarlar"},
                        {"menu_about", "Hakkında"},
                        {"menu_exit", "Çıkış"},
                        {"tray_show", "Göster"},
                        {"tray_exit", "Çıkış"},
                        {"next_prayer", "Sonraki namaz"},
                        {"current_prayer", "Mevcut namaz"},
                        {"fajr", "Sabah"},
                        {"sunrise", "Güneş"},
                        {"dhuhr", "Öğle"},
                        {"asr", "İkindi"},
                        {"maghrib", "Akşam"},
                        {"isha", "Yatsı"},
                        {"friday", "Cuma"},
                        {"noon", "Öğle"},
                        {"until", "kadar"},
                        {"good_night", "İyi geceler"},
                        {"see_you_tomorrow", "Yarın görüşmek üzere!"},
                        {"copyright", "© Uygulama, Başmüftülük zamanlarına göre 0-60 saniye farklılık gösterebilir."},
                        {"location_button", "📍"},
                        {"menu_button", "☰"},
                        {"language_button", "🌐"},
                        {"voice_button", "🔊"},
                        {"reminder_before", "dakika önce"},
                        {"reminder_now", "Vakit geldi"},
                        {"settings_title", "Ayarlar"},
                        {"settings_minutes", "Bildirimden önceki dakika:"},
                        {"settings_test", "🔔 Bildirimi test et"},
                        {"settings_note", "Not: Uyarı almak için uygulama bildirimlerinin etkin olduğundan emin olun."},
                        {"settings_save", "KAYDET"},
                        {"about_title", "Hakkında"},
                        {"about_version", "Sürüm 1.0\nDoğru namaz vakitleri hesaplamaları."},
                        {"auto_location", "Otomatik Konum"},
                        {"search_location", "Şehir ara..."},
                        {"test_notification", "Test"},
                        {"test_message", "Çalışıyor!"},
                        {"location_found", "Bulundu: {0}"},
                        {"location_error", "Konum belirlenemedi."},
                        {"network_error", "Başarılı konum tespiti için ağa bağlanın: {0}"},
                        {"reminder_title", "Hatırlatma"},
                        {"time_title", "Vakit"},
                        {"fajr_starts", "Sabah namazı {0} dakika sonra başlayacak."},
                        {"sunrise_starts", "Güneş {0} dakika sonra doğacak."},
                        {"prayer_starts", "{0} namazı {1} dakika sonra başlayacak."},
                        {"fajr_started", "Sabah namazı şimди başladı."},
                        {"sunrise_started", "Güneş şimди doğdu."},
                        {"prayer_time", "{0} namazı vakti geldi."},
                        {"my_location", "Benim Konumum"},
                        {"voice_announcement", "Şehir: {0}. Bugünkü namaz vakitleri: {2} saat {3}, {4} saat {5}, {6} saat {7}, {8} saat {9}, {10} saat {11}, {12} saat {13}. Sonraki namaz: {14}, {15} sonra."}
                    }
                },
                {
                    "ar", new Dictionary<string, string>
                    {
                        {"app_title", "مواقيت الصلاة"},
                        {"menu_settings", "الإعدادات"},
                        {"menu_about", "حول التطبيق"},
                        {"menu_exit", "خروج"},
                        {"tray_show", "إظهار"},
                        {"tray_exit", "خروج"},
                        {"next_prayer", "الصلاة التالية"},
                        {"current_prayer", "الصلاة الحالية"},
                        {"fajr", "الفجر"},
                        {"sunrise", "الشروق"},
                        {"dhuhr", "الظهر"},
                        {"asr", "العصر"},
                        {"maghrib", "المغرب"},
                        {"isha", "العشاء"},
                        {"friday", "الجمعة"},
                        {"noon", "الظهر"},
                        {"until", "حتى"},
                        {"good_night", "ليلة سعيدة"},
                        {"see_you_tomorrow", "نراكم غداً!"},
                        {"copyright", "© قد يكون للتطبيق اختلافات من 0 إلى 60 ثانية مقارنة بأوقات المفتي العام."},
                        {"location_button", "📍"},
                        {"menu_button", "☰"},
                        {"language_button", "🌐"},
                        {"voice_button", "🔊"},
                        {"reminder_before", "دقيقة قبل"},
                        {"reminder_now", "حان وقت"},
                        {"settings_title", "الإعدادات"},
                        {"settings_minutes", "دقائق قبل الإشعار:"},
                        {"settings_test", "🔔 اختبار الإشعار"},
                        {"settings_note", "ملاحظة: تأكد من تمكين إشعارات التطبيق لتلقي التنبيهات."},
                        {"settings_save", "حفظ"},
                        {"about_title", "حول التطبيق"},
                        {"about_version", "الإصدار 1.0\nحسابات دقيقة لمواقيت الصلاة."},
                        {"auto_location", "الموقع التلقائي"},
                        {"search_location", "ابحث عن مدينة..."},
                        {"test_notification", "اختبار"},
                        {"test_message", "يعمل!"},
                        {"location_found", "تم العثور على: {0}"},
                        {"location_error", "فشل في تحديد الموقع."},
                        {"network_error", "اتصل بالشبكة للكشف الناجح عن الموقع: {0}"},
                        {"reminder_title", "تذكير"},
                        {"time_title", "الوقت"},
                        {"fajr_starts", "يبدأ الفجر بعد {0} دقيقة."},
                        {"sunrise_starts", "يبدأ الشروق بعد {0} دقيقة."},
                        {"prayer_starts", "تبدأ صلاة {0} بعد {1} دقيقة."},
                        {"fajr_started", "بدأ الفجر الآن."},
                        {"sunrise_started", "بدأ الشروق الآن."},
                        {"prayer_time", "حان وقت صلاة {0}."},
                        {"my_location", "موقعي"},
                        {"voice_announcement", "المدينة: {0}. مواقيت الصلاة لهذا اليوم: {2} الساعة {3}, {4} الساعة {5}, {6} الساعة {7}, {8} الساعة {9}, {10} الساعة {11}, {12} الساعة {13}. الصلاة التالية: {14} بعد {15}."}
                    }
                }
            };

        // Градове и техните преводи
        public static readonly Dictionary<string, CityNames> CityTranslations =
            new Dictionary<string, CityNames>(StringComparer.OrdinalIgnoreCase)
            {
                { "Айтос", new CityNames { Bg = "Айтос", En = "Aytos", Tr = "Aytos", Ar = "أيتوس" } },
                { "Балчик", new CityNames { Bg = "Балчик", En = "Balchik", Tr = "Balçık", Ar = "بالتشيك" } },
                { "Благоевград", new CityNames { Bg = "Благоевград", En = "Blagoevgrad", Tr = "Blagoevgrad", Ar = "بلاغويفغراد" } },
                { "Бургас", new CityNames { Bg = "Бургас", En = "Burgas", Tr = "Burgaz", Ar = "بورغاس" } },
                { "Бяла", new CityNames { Bg = "Бяла", En = "Byala", Tr = "Byala", Ar = "بيالا" } },
                { "Варна", new CityNames { Bg = "Варна", En = "Varna", Tr = "Varna", Ar = "فارنا" } },
                { "Велики Преслав", new CityNames { Bg = "Велики Преслав", En = "Veliki Preslav", Tr = "Veliki Preslav", Ar = "فيليكي بريسلاف" } },
                { "Велико Търново", new CityNames { Bg = "Велико Търново", En = "Veliko Tarnovo", Tr = "Veliko Tırnovo", Ar = "فيليكو تارنوفو" } },
                { "Велинград", new CityNames { Bg = "Велинград", En = "Velingrad", Tr = "Velingrad", Ar = "فيلينغراد" } },
                { "Горна Оряховица", new CityNames { Bg = "Горна Оряховица", En = "Gorna Oryahovitsa", Tr = "Gorna Oryahovitsa", Ar = "غورنا أورياهوفيتسا" } },
                { "Гоце Делчев", new CityNames { Bg = "Гоце Делчев", En = "Gotse Delchev", Tr = "Gotse Delçev", Ar = "غوتسه ديلتشيف" } },
                { "Добрич", new CityNames { Bg = "Добрич", En = "Dobrich", Tr = "Dobriç", Ar = "دوبريتش" } },
                { "Исперих", new CityNames { Bg = "Исперих", En = "Isperih", Tr = "İsperih", Ar = "إسبيريخ" } },
                { "Каварна", new CityNames { Bg = "Каварна", En = "Kavarna", Tr = "Kavarna", Ar = "كافارنا" } },
                { "Каолиново", new CityNames { Bg = "Каолиново", En = "Kaolinovo", Tr = "Kaolinovo", Ar = "كاولينوفو" } },
                { "Карлово", new CityNames { Bg = "Карлово", En = "Karlovo", Tr = "Karlovo", Ar = "كارلوفو" } },
                { "Карнобат", new CityNames { Bg = "Карнобат", En = "Karnobat", Tr = "Karnobat", Ar = "كارنوبات" } },
                { "Кнежа", new CityNames { Bg = "Кнежа", En = "Kneja", Tr = "Kneja", Ar = "كنيجا" } },
                { "Котел", new CityNames { Bg = "Котел", En = "Kotel", Tr = "Kotel", Ar = "كوتيل" } },
                { "Крумовград", new CityNames { Bg = "Крумовград", En = "Krumovgrad", Tr = "Krumovgrad", Ar = "كروموفغراد" } },
                { "Кубрат", new CityNames { Bg = "Кубрат", En = "Kubrat", Tr = "Kubrat", Ar = "كوبرات" } },
                { "Кърджали", new CityNames { Bg = "Кърджали", En = "Kardzhali", Tr = "Kırcali", Ar = "كارجلي" } },
                { "Ловеч", new CityNames { Bg = "Ловеч", En = "Lovech", Tr = "Loveç", Ar = "لوفيتش" } },
                { "Мадан", new CityNames { Bg = "Мадан", En = "Madan", Tr = "Madan", Ar = "مادان" } },
                { "Монтана", new CityNames { Bg = "Монтана", En = "Montana", Tr = "Montana", Ar = "مونتانا" } },
                { "Никопол", new CityNames { Bg = "Никопол", En = "Nikopol", Tr = "Nikopol", Ar = "نيكوبول" } },
                { "Нова Загора", new CityNames { Bg = "Нова Загора", En = "Nova Zagora", Tr = "Nova Zağra", Ar = "نوفا زاغورا" } },
                { "Нови пазар", new CityNames { Bg = "Нови пазар", En = "Novi Pazar", Tr = "Novi Pazar", Ar = "نوفي بازار" } },
                { "Пазарджик", new CityNames { Bg = "Пазарджик", En = "Pazardzhik", Tr = "Pazarcık", Ar = "بازارجيك" } },
                { "Плевен", new CityNames { Bg = "Плевен", En = "Pleven", Tr = "Pleven", Ar = "بليفين" } },
                { "Пловдив", new CityNames { Bg = "Пловдив", En = "Plovdiv", Tr = "Filibe", Ar = "بلوفديف" } },
                { "Провадия", new CityNames { Bg = "Провадия", En = "Provadiya", Tr = "Provadiya", Ar = "بروفاديا" } },
                { "Разград", new CityNames { Bg = "Разград", En = "Razgrad", Tr = "Razgrad", Ar = "رازغراد" } },
                { "Русе", new CityNames { Bg = "Русе", En = "Ruse", Tr = "Ruse", Ar = "روسه" } },
                { "Свищов", new CityNames { Bg = "Свищов", En = "Svishtov", Tr = "Sviştov", Ar = "سفيشتوف" } },
                { "Силистра", new CityNames { Bg = "Силистра", En = "Silistra", Tr = "Silistre", Ar = "سيليسترا" } },
                { "Ситово", new CityNames { Bg = "Ситово", En = "Sitovo", Tr = "Sitovo", Ar = "سيتوفو" } },
                { "Сливен", new CityNames { Bg = "Сливен", En = "Sliven", Tr = "Sliven", Ar = "سليفن" } },
                { "Смолян", new CityNames { Bg = "Смолян", En = "Smolyan", Tr = "Smolyan", Ar = "سموليان" } },
                { "София", new CityNames { Bg = "София", En = "Sofia", Tr = "Sofya", Ar = "صوفيا" } },
                { "Стара Загора", new CityNames { Bg = "Стара Загора", En = "Stara Zagora", Tr = "Eski Zağra", Ar = "ستارا زاغورا" } },
                { "Твърдица", new CityNames { Bg = "Твърдица", En = "Tvarditsa", Tr = "Tvırditsa", Ar = "تفاردبتسا" } },
                { "Търговище", new CityNames { Bg = "Търговище", En = "Targovishte", Tr = "Tırgovişte", Ar = "تارغوفيشت" } },
                { "Харманли", new CityNames { Bg = "Харманли", En = "Harmanli", Tr = "Harmanlı", Ar = "هارمانلي" } },
                { "Хасково", new CityNames { Bg = "Хасково", En = "Haskovo", Tr = "Hasköy", Ar = "هاسكوفو" } },
                { "Шумен", new CityNames { Bg = "Шумен", En = "Shumen", Tr = "Şumnu", Ar = "شومن" } },
                { "Якоруда", new CityNames { Bg = "Якоруда", En = "Yakoruda", Tr = "Yakoruda", Ar = "ياكورودا" } },
                { "Ямбол", new CityNames { Bg = "Ямбол", En = "Yambol", Tr = "Yambol", Ar = "يامبول" } }
            };

        // Метод за получаване на преведен текст
        public static string GetText(string language, string key)
        {
            if (LanguageTexts.ContainsKey(language) && LanguageTexts[language].ContainsKey(key))
                return LanguageTexts[language][key];

            // Fallback to Bulgarian
            if (LanguageTexts.ContainsKey("bg") && LanguageTexts["bg"].ContainsKey(key))
                return LanguageTexts["bg"][key];

            return key;
        }

        // Метод за получаване на преведено име на град
        public static string GetTranslatedCityName(string language, string cityKey)
        {
            if (string.IsNullOrWhiteSpace(cityKey)) return "";

            // 1. Проверка за автоматична локация
            if (cityKey == "Моята Локация" ||
                cityKey == "My Location" ||
                cityKey == "Benim Konumum" ||
                cityKey == "موقعي" ||
                IsAutoLocation(language, cityKey))
            {
                return GetText(language, "my_location");
            }

            // 2. Изчистваме само празното място в началото и края
            string cleanKey = cityKey.Trim();

            // 3. Директно търсене по ключ (българско име)
            if (CityTranslations.ContainsKey(cleanKey))
            {
                return GetNameByLanguage(CityTranslations[cleanKey], language);
            }

            // 4. Търсене във всички езици
            foreach (var cityPair in CityTranslations)
            {
                var cityNames = cityPair.Value;

                // Проверяваме дали ключът съвпада с някое от имената на всеки език
                if (cityNames.Bg.Equals(cleanKey, StringComparison.OrdinalIgnoreCase) ||
                    cityNames.En.Equals(cleanKey, StringComparison.OrdinalIgnoreCase) ||
                    cityNames.Tr.Equals(cleanKey, StringComparison.OrdinalIgnoreCase) ||
                    cityNames.Ar.Equals(cleanKey, StringComparison.OrdinalIgnoreCase))
                {
                    return GetNameByLanguage(cityNames, language);
                }
            }

            // 5. Специална обработка за общи случаи
            var normalizedKey = cleanKey.ToLowerInvariant();

            // Често срещани градове - директно търсене
            var commonCities = new Dictionary<string, string>
            {
                { "sofia", "София" },
                { "sofya", "София" },
                { "صوفيا", "София" },
                { "varna", "Варна" },
                { "فارنا", "Варна" },
                { "plovdiv", "Пловдив" },
                { "فيلبه", "Пловдив" },
                { "burgas", "Бургас" },
                { "بورغاس", "Бургас" }
            };

            if (commonCities.ContainsKey(normalizedKey))
            {
                string bgName = commonCities[normalizedKey];
                if (CityTranslations.ContainsKey(bgName))
                {
                    return GetNameByLanguage(CityTranslations[bgName], language);
                }
            }

            // 6. Ако нищо не намерим, връщаме оригинала
            return cleanKey;
        }

        // Помощен метод, който връща правилния низ спрямо езика
        private static string GetNameByLanguage(CityNames city, string language)
        {
            switch (language)
            {
                case "bg": return city.Bg;
                case "tr": return city.Tr;
                case "ar": return city.Ar;
                case "en": return city.En;
                default: return city.En;
            }
        }

        // Проверка дали това е автоматична локация
        private static bool IsAutoLocation(string language, string locationName)
        {
            string myLocationText = GetText(language, "my_location");
            return locationName == myLocationText ||
                   locationName == "Моята Локация" ||
                   locationName == "My Location" ||
                   locationName == "Benim Konumum" ||
                   locationName == "موقعي";
        }
    }

    public class CityNames
    {
        public string Bg { get; set; } // Български
        public string En { get; set; } // Английски
        public string Tr { get; set; } // Турски
        public string Ar { get; set; } // Арабски
    }
}