<?php

function getPrayerDisplayName($prayerKey, $date = null) {
    if ($date === null) {
        $date = new DateTime();
    }
    
    $isFriday = (date('N', $date->getTimestamp()) == 5);
    
    $prayerMap = [
        "Зора" => "Зора",
        "Изгрев" => "Изгрев",
        "Обяд" => $isFriday ? "Джума" : "Обедна",
        "Следобяд" => "Следобедна",
        "Залез" => "Вечерна",
        "Нощ" => "Нощна"
    ];
    
    return $prayerMap[$prayerKey] ?? $prayerKey;
}

function getWeekday($date) {
    $bulgarianDays = [
        'Monday' => 'понеделник',
        'Tuesday' => 'вторник',
        'Wednesday' => 'сряда',
        'Thursday' => 'четвъртък',
        'Friday' => 'петък',
        'Saturday' => 'събота',
        'Sunday' => 'неделя'
    ];
    
    $englishDay = date('l', strtotime($date));
    return $bulgarianDays[$englishDay] ?? $englishDay;
}

function formatTime($timeStr) {
    if (!$timeStr || $timeStr == '--:--') return '--:--';
    $parts = explode(':', $timeStr);
    if (count($parts) !== 2) return '--:--';
    return sprintf("%02d:%02d", $parts[0], $parts[1]);
}

function getCurrentDate() {
    return date('Y-m-d');
}

function getMonthDates($year = null, $month = null) {
    if ($year === null) $year = date('Y');
    if ($month === null) $month = date('m');
    
    $dates = [];
    $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
    
    for ($day = 1; $day <= $daysInMonth; $day++) {
        $date = sprintf("%04d-%02d-%02d", $year, $month, $day);
        $dates[] = $date;
    }
    
    return $dates;
}

function getMonthName($month) {
    $months = [
        1 => 'Януари', 2 => 'Февруари', 3 => 'Март', 4 => 'Април',
        5 => 'Май', 6 => 'Юни', 7 => 'Юли', 8 => 'Август',
        9 => 'Септември', 10 => 'Октомври', 11 => 'Ноември', 12 => 'Декември'
    ];
    return $months[$month] ?? '';
}

function calculateFastingTime($fajrTime, $maghribTime) {
    if (!$fajrTime || !$maghribTime) return 0;
    
    $fajr = DateTime::createFromFormat('H:i', $fajrTime);
    $maghrib = DateTime::createFromFormat('H:i', $maghribTime);
    
    if (!$fajr || !$maghrib) return 0;
    
    $diff = $fajr->diff($maghrib);
    return $diff->h + ($diff->i / 60);
}

function getHijriDate() {
    $months = ['Мухаррам', 'Сафар', 'Рабиул-аввал', 'Рабиул-ахир', 
               'Джумадал-уля', 'Джумадал-ахира', 'Раджаб', 'Шаабан', 
               'Рамадан', 'Шаввал', 'Зул-када', 'Зул-хиджа'];
    
    $month = $months[date('n') - 1];
    $day = date('j') + 10; // Приблизително изчисление
    if ($day > 30) $day -= 30;
    
    $year = 1446; // Примерна година
    
    return "$day $month $year хиджри";
}

function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}
?>
<?php
// Добавете тази функция в края на functions.php

function calculateRealStats($prayerData, $selectedCity, $monthDates) {
    $stats = [
        'fasting_hours' => '--',
        'daylight_hours' => '--',
        'fasting_progress' => '--',
        'eating_window' => '--',
        'longest_day' => '--',
        'shortest_day' => '--',
        'earliest_fajr' => '--:--',
        'latest_isha' => '--:--',
        'avg_day_length' => '--',
        'friday_count' => '--',
        'month_change' => '0.0'
    ];
    
    $today = getCurrentDate();
    $cityTimes = $prayerData[$selectedCity][$today] ?? null;
    
    if ($cityTimes && isset($cityTimes['Зора']) && isset($cityTimes['Залез'])) {
        // Изчисляване на часовете постинг (от Зора до Залез)
        $fajr = DateTime::createFromFormat('H:i', $cityTimes['Зора']);
        $maghrib = DateTime::createFromFormat('H:i', $cityTimes['Залез']);
        
        if ($fajr && $maghrib) {
            $fastingInterval = $fajr->diff($maghrib);
            $stats['fasting_hours'] = $fastingInterval->h + ($fastingInterval->i / 60);
            $stats['fasting_hours'] = round($stats['fasting_hours'], 1);
            
            // Изчисляване на прозореца за хранене
            $stats['eating_window'] = 24 - $stats['fasting_hours'];
            $stats['eating_window'] = round($stats['eating_window'], 1);
            
            // Изчисляване на прогреса на поста
            $now = new DateTime();
            $hoursSinceFajr = $fajr->diff($now)->h + ($fajr->diff($now)->i / 60);
            $progress = ($hoursSinceFajr / $stats['fasting_hours']) * 100;
            $stats['fasting_progress'] = min(100, max(0, round($progress, 0)));
        }
        
        // Изчисляване на продължителността на деня (от Изгрев до Залез)
        if (isset($cityTimes['Изгрев'])) {
            $sunrise = DateTime::createFromFormat('H:i', $cityTimes['Изгрев']);
            if ($sunrise && $maghrib) {
                $daylightInterval = $sunrise->diff($maghrib);
                $stats['daylight_hours'] = $daylightInterval->h + ($daylightInterval->i / 60);
                $stats['daylight_hours'] = round($stats['daylight_hours'], 1);
            }
        }
    }
    
    // Изчисляване на месечни статистики
    $fajrTimes = [];
    $ishaTimes = [];
    $daylightHours = [];
    
    foreach ($monthDates as $date) {
        $cityTimes = $prayerData[$selectedCity][$date] ?? null;
        
        if ($cityTimes) {
            // Събиране на времена за Зора
            if (isset($cityTimes['Зора'])) {
                $fajrTimes[] = $cityTimes['Зора'];
            }
            
            // Събиране на времена за Нощ
            if (isset($cityTimes['Нощ'])) {
                $ishaTimes[] = $cityTimes['Нощ'];
            }
            
            // Изчисляване на продължителност на деня
            if (isset($cityTimes['Изгрев']) && isset($cityTimes['Залез'])) {
                $sunrise = DateTime::createFromFormat('H:i', $cityTimes['Изгрев']);
                $sunset = DateTime::createFromFormat('H:i', $cityTimes['Залез']);
                if ($sunrise && $sunset) {
                    $interval = $sunrise->diff($sunset);
                    $hours = $interval->h + ($interval->i / 60);
                    $daylightHours[] = $hours;
                }
            }
        }
    }
    
    // Изчисляване на най-ранна/късна молитва
    if (!empty($fajrTimes)) {
        $stats['earliest_fajr'] = min($fajrTimes);
        $stats['latest_isha'] = max($ishaTimes);
    }
    
    // Изчисляване на най-дълъг/къс ден
    if (!empty($daylightHours)) {
        $stats['longest_day'] = round(max($daylightHours), 1);
        $stats['shortest_day'] = round(min($daylightHours), 1);
        $stats['avg_day_length'] = round(array_sum($daylightHours) / count($daylightHours), 1);
    }
    
    // Брой петъци
    $stats['friday_count'] = 0;
    foreach ($monthDates as $date) {
        if (date('N', strtotime($date)) == 5) {
            $stats['friday_count']++;
        }
    }
    
    // Промяна от миналия месец (симулирана)
    $stats['month_change'] = (rand(-5, 5) / 10) . 'ч';
    
    return $stats;
}
?>