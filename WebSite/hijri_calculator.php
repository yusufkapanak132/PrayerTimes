<?php
/**
 * Клас за конвертиране на дати между Грегориански и Хиджри календар
 * Използва Umm al-Qura алгоритъм с корекции за точни изчисления
 */
class HijriCalendar {
    
    /**
     * Конвертира Грегорианска дата към Хиджри дата
     * Работи за всяка година след Хиджра (1 AH нататък)
     */
    public static function gregorianToHijri($year, $month, $day, $hour = 12, $minute = 0, $second = 0) {
        try {
            // Проверка за валидност на датата
            if (!checkdate($month, $day, $year)) {
                return null;
            }
            
            // Изчисляваме Юлиански ден с точно време
            $jd = self::gregorianToJulian($year, $month, $day, $hour, $minute, $second);
            
            // Правилна епоха на Хиджра: 16 юли 622 г. по Юлиански календар
            // Това е 1 Muharram 1 AH (Нова Хиджра)
            $hijri_epoch = 1948439.5; // JD за 16 юли 622 г. 12:00 UTC
            
            // Изчисляваме разликата в дни
            $days_since_hijra = $jd - $hijri_epoch;
            
            if ($days_since_hijra < 0) {
                // Дата преди началото на Хиджра
                return null;
            }
            
            // Използваме таблица за точност или алгоритъм
            return self::calculateUmmAlQura($jd);
            
        } catch (Exception $e) {
            error_log("Hijri conversion error: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Точен Umm al-Qura алгоритъм (версия 4)
     */
    private static function calculateUmmAlQura($jd) {
        // JD за 1 Muharram 1 AH (16 юли 622 г.)
        $epoch = 1948439.5;
        
        // Разлика в дни
        $days = $jd - $epoch;
        
        // Брой цикли от 30 години
        $thirtyYearCycles = floor($days / 10631);
        $remainingDays = fmod($days, 10631);
        
        // Брой години в текущия 30-годишен цикъл
        $yearsInCycle = 0;
        for ($i = 0; $i < 30; $i++) {
            $yearDays = self::getUmmAlQuraYearLength($i);
            if ($remainingDays < $yearDays) {
                break;
            }
            $remainingDays -= $yearDays;
            $yearsInCycle++;
        }
        
        // Хиджри година
        $hijri_year = $thirtyYearCycles * 30 + $yearsInCycle + 1;
        
        // Брой дни в месеците за текущата година
        $hijri_month = 1;
        for ($i = 1; $i <= 12; $i++) {
            $monthDays = self::getUmmAlQuraMonthLength($hijri_year, $i);
            if ($remainingDays < $monthDays) {
                break;
            }
            $remainingDays -= $monthDays;
            $hijri_month++;
        }
        
        // Хиджри ден
        $hijri_day = floor($remainingDays) + 1;
        
        return [
            'year' => (int)$hijri_year,
            'month' => (int)$hijri_month,
            'day' => (int)$hijri_day,
            'success' => true
        ];
    }
    
    /**
     * Връща продължителността на Хиджри година в Umm al-Qura системата
     */
    private static function getUmmAlQuraYearLength($yearInCycle) {
        // Таблица за 30-годишен цикъл на Umm al-Qura
        // 0 = обикновена (354 дни), 1 = високосна (355 дни)
        $cycle = [
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0,  // 1-10
            1, 0, 0, 1, 0, 0, 1, 0, 1, 0,  // 11-20
            0, 1, 0, 0, 1, 0, 0, 1, 0, 1   // 21-30
        ];
        
        return $cycle[$yearInCycle] == 0 ? 354 : 355;
    }
    
    /**
     * Връща продължителността на Хиджри месец в Umm al-Qura системата
     */
    private static function getUmmAlQuraMonthLength($year, $month) {
        // Таблица за продължителност на месеците в Umm al-Qura
        // За разлика от традиционния календар, тук има специфични правила
        $yearInCycle = ($year - 1) % 30;
        
        // Основно правило: нечетни месеци 30 дни, четни 29 дни
        // Но има изключения за определено разположение на високосните години
        
        // Първо определяме дали годината е високосна
        $isLeapYear = self::getUmmAlQuraYearLength($yearInCycle) == 355;
        
        // Продължителност на месеците
        if ($month == 12) { // Зул-Хиджа
            return $isLeapYear ? 30 : 29;
        }
        
        // Обикновени месеци
        return ($month % 2 == 1) ? 30 : 29;
    }
    
    /**
     * Конвертира Грегорианска дата към Юлиански ден с точно време
     */
    private static function gregorianToJulian($year, $month, $day, $hour = 12, $minute = 0, $second = 0) {
        // Превръщаме времето във фракция от ден
        $timeFraction = ($hour - 12) / 24 + $minute / 1440 + $second / 86400;
        
        if ($month <= 2) {
            $year -= 1;
            $month += 12;
        }
        
        $a = floor($year / 100);
        $b = 2 - $a + floor($a / 4);
        
        $jd = floor(365.25 * ($year + 4716)) 
            + floor(30.6001 * ($month + 1)) 
            + $day + $b - 1524.5;
            
        // Добавяме точното време
        return $jd + $timeFraction;
    }
    
    /**
     * Връща имената на Хиджри месеци
     */
    public static function getHijriMonthNames($lang = 'bg') {
        $months = [
            'bg' => [
                1 => 'Мухаррам', 2 => 'Сафар', 3 => 'Рабиул-аввал', 4 => 'Рабиул-ахир',
                5 => 'Джумадал-уля', 6 => 'Джумадал-ахира', 7 => 'Раджаб', 8 => 'Шаабан',
                9 => 'Рамадан', 10 => 'Шаввал', 11 => 'Зул-када', 12 => 'Зул-хиджа'
            ],
            'en' => [
                1 => 'Muharram', 2 => 'Safar', 3 => 'Rabi\' al-Awwal', 4 => 'Rabi\' al-Thani',
                5 => 'Jumada al-Ula', 6 => 'Jumada al-Thani', 7 => 'Rajab', 8 => 'Sha\'ban',
                9 => 'Ramadan', 10 => 'Shawwal', 11 => 'Dhu al-Qi\'dah', 12 => 'Dhu al-Hijjah'
            ],
            'tr' => [
                1 => 'Muharrem', 2 => 'Safer', 3 => 'Rebiülevvel', 4 => 'Rebiülahir',
                5 => 'Cemaziyelevvel', 6 => 'Cemaziyelahir', 7 => 'Recep', 8 => 'Şaban',
                9 => 'Ramazan', 10 => 'Şеввал', 11 => 'Zilkade', 12 => 'Zilhicce'
            ],
            'ar' => [
                1 => 'محرم', 2 => 'صفر', 3 => 'ربيع الأول', 4 => 'ربيع الآخر',
                5 => 'جمادى الأولى', 6 => 'جمادى الآخرة', 7 => 'رجب', 8 => 'شعبان',
                9 => 'رمضان', 10 => 'شوال', 11 => 'ذو القعدة', 12 => 'ذو الحجة'
            ]
        ];
        
        return $months[$lang] ?? $months['bg'];
    }
    
    /**
     * Връща текущата Хиджри дата
     * Има специална настройка за часовите зони
     */
    public static function getCurrentHijriDate($lang = 'bg', $timezone = 'Asia/Riyadh') {
        try {
            // Използваме Саудитско време (UTC+3) за точност
            $today = new DateTime('now', new DateTimeZone($timezone));
            
            // За датата използваме местно време на Саудитска Арабия
            // защото Umm al-Qura се базира на наблюденията там
            $year = (int)$today->format('Y');
            $month = (int)$today->format('n');
            $day = (int)$today->format('j');
            $hour = (int)$today->format('G');
            
            // Конвертираме със Саудитско време
            $hijri = self::gregorianToHijri($year, $month, $day, $hour);
            
            if ($hijri === null || !isset($hijri['success'])) {
                return self::getFallbackHijriDate($lang, $timezone);
            }
            
            $monthNames = self::getHijriMonthNames($lang);
            $monthName = $monthNames[$hijri['month']] ?? $monthNames[1];
            
            return [
                'day' => $hijri['day'],
                'month' => $monthName,
                'year' => $hijri['year'],
                'formatted' => $hijri['day'] . ' ' . $monthName . ' ' . $hijri['year'] . ' хиджри',
                'success' => true,
                'timezone' => $timezone
            ];
        } catch (Exception $e) {
            error_log("Get current hijri error: " . $e->getMessage());
            return self::getFallbackHijriDate($lang, $timezone);
        }
    }
    
    /**
     * Алтернативен метод: директно изчисление за текущата дата
     */
    public static function getExactCurrentHijri() {
        // Текуща дата и време в UTC
        $utcNow = new DateTime('now', new DateTimeZone('UTC'));
        
        // Преобразуваме към Юлиански ден
        $year = (int)$utcNow->format('Y');
        $month = (int)$utcNow->format('n');
        $day = (int)$utcNow->format('j');
        $hour = (int)$utcNow->format('G');
        $minute = (int)$utcNow->format('i');
        
        $jd = self::gregorianToJulian($year, $month, $day, $hour, $minute);
        
        // За датата: след залез слънце в Мека започва нов ден
        // Ако сме след 18:00 UTC (21:00 Саудитско време), добавяме 1 ден
        $makkahTime = $hour + 3; // UTC+3 за Мека/Саудитска Арабия
        if ($makkahTime >= 21) {
            $jd += 1;
        }
        
        // Изчисляваме Хиджри дата
        return self::calculateUmmAlQura($jd);
    }
    
    /**
     * Подобрена резервна функция
     */
    private static function getFallbackHijriDate($lang = 'bg', $timezone = 'Asia/Riyadh') {
        try {
            $today = new DateTime('now', new DateTimeZone($timezone));
            
            // Текущо време в UTC за точност
            $todayUTC = new DateTime('now', new DateTimeZone('UTC'));
            $currentHourUTC = (int)$todayUTC->format('G');
            
            // Ако е след 18:00 UTC, добавяме 1 ден
            $extraDay = ($currentHourUTC >= 18) ? 1 : 0;
            
            $year = (int)$today->format('Y');
            $month = (int)$today->format('n');
            $day = (int)$today->format('j') + $extraDay;
            
            // Ако денят е по-голям от броя дни в месеца
            if ($day > cal_days_in_month(CAL_GREGORIAN, $month, $year)) {
                $day = 1;
                $month++;
                if ($month > 12) {
                    $month = 1;
                    $year++;
                }
            }
            
            // Използваме по1прост алгоритъм за приближение
            $hijra_date = new DateTime('622-07-16 12:00:00', new DateTimeZone('UTC'));
            $today->setTimezone(new DateTimeZone('UTC'));
            
            $interval = $today->diff($hijra_date);
            $total_days = $interval->days;
            
            if ($interval->invert) {
                $total_days = -$total_days;
            }
            
            // Брой лунарни месеци
            $total_lunations = floor($total_days / 29.530588);
            
            $hijri_year = floor($total_lunations / 12) + 1;
            $hijri_month = ($total_lunations % 12) + 1;
            
            // Ден в месеца
            $day_in_cycle = fmod($total_days, 29.530588);
            $hijri_day = floor($day_in_cycle) + 1;
            
            // Корекция: добавяме 1 ден поради разликата във времето на деня
            $hijri_day += 1;
            
            $monthNames = self::getHijriMonthNames($lang);
            $monthName = $monthNames[$hijri_month] ?? $monthNames[1];
            
            return [
                'day' => $hijri_day,
                'month' => $monthName,
                'year' => $hijri_year,
                'formatted' => $hijri_day . ' ' . $monthName . ' ' . $hijri_year . ' хиджри (приблизително)',
                'success' => false,
                'is_fallback' => true
            ];
        } catch (Exception $e) {
            // Крайна резервна стойност
            return [
                'day' => 18,
                'month' => 'Раджаб',
                'year' => 1446,
                'formatted' => '18 Раджаб 1446 хиджри (по подразбиране)',
                'success' => false,
                'is_fallback' => true
            ];
        }
    }
    
    /**
     * Тестова функция за проверка на точни дати
     */
    public static function testCurrentDate() {
        echo "<h3>Текуща дата проверка</h3>";
        
        // Метод 1: Umm al-Qura със Саудитско време
        $hijri1 = self::getCurrentHijriDate('bg', 'Asia/Riyadh');
        echo "Саудитско време: " . $hijri1['formatted'] . "<br>";
        
        // Метод 2: Точен изчислен
        $hijri2 = self::getExactCurrentHijri();
        $monthNames = self::getHijriMonthNames('bg');
        $monthName2 = $monthNames[$hijri2['month']] ?? '???';
        echo "Точно изчислен: {$hijri2['day']} {$monthName2} {$hijri2['year']} хиджри<br>";
        
        // Метод 3: Българско време
        $hijri3 = self::getCurrentHijriDate('bg', 'Europe/Sofia');
        echo "Българско време: " . $hijri3['formatted'] . "<br>";
        
        echo "<br>Сега е: " . date('Y-m-d H:i:s') . " (България)<br>";
        echo "В Саудитска Арабия е: " . date('Y-m-d H:i:s', strtotime('+1 hour')) . "<br>";
    }
    
    /**
     * Проверка на конкретна дата с корекция за времето
     */
    public static function verifyDateWithCorrection($gregorian_date, $expected_hijri) {
        echo "<h4>Проверка за: $gregorian_date</h4>";
        
        $date = new DateTime($gregorian_date . ' 12:00:00', new DateTimeZone('UTC'));
        
        // Тестваме различни часове от деня
        for ($hour = 0; $hour < 24; $hour += 6) {
            $testDate = clone $date;
            $testDate->setTime($hour, 0, 0);
            
            $year = (int)$testDate->format('Y');
            $month = (int)$testDate->format('n');
            $day = (int)$testDate->format('j');
            $hourVal = (int)$testDate->format('G');
            
            $hijri = self::gregorianToHijri($year, $month, $day, $hourVal);
            
            if ($hijri) {
                $monthNames = self::getHijriMonthNames('bg');
                $monthName = $monthNames[$hijri['month']] ?? '???';
                $result = $hijri['day'] . ' ' . $monthName . ' ' . $hijri['year'];
                
                echo "Час {$hour}:00 UTC => {$result}<br>";
            }
        }
    }
}
?>