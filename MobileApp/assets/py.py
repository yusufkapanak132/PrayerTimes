import json
from datetime import datetime
from collections import defaultdict

# ---------------------------------------------------------
# 1. CONFIGURATION
# ---------------------------------------------------------
ALGO_FILE = 'prayer_times_2026_complete.json'
OFFICIAL_FILE = 'all_prayer_times_2026.json'
OUTPUT_FILE = 'city_weekly_offsets_2026.json'


PRAYER_ORDER = ["Зора", "Изгрев", "Обяд", "Следобяд", "Залез", "Нощ"]


REFERENCE_CITIES = [
  { "name": "Айтос", "lat": 42.7, "lng": 27.25 },
  { "name": "Балчик", "lat": 43.4, "lng": 28.1667 },
  { "name": "Благоевград", "lat": 42.0167, "lng": 23.1 },
  { "name": "Бургас", "lat": 42.5048, "lng": 27.4626 },
  { "name": "Бяла", "lat": 43.45, "lng": 25.7333 },
  { "name": "Варна", "lat": 43.2141, "lng": 27.9147 },
  { "name": "Велики Преслав", "lat": 43.1667, "lng": 26.8167 },
  { "name": "Велико Търново", "lat": 43.0757, "lng": 25.6172 },
  { "name": "Велинград", "lat": 42.0275, "lng": 23.9915 },
  { "name": "Горна Оряховица", "lat": 43.1269, "lng": 25.7006 },
  { "name": "Гоце Делчев", "lat": 41.5766, "lng": 23.7345 },
  { "name": "Добрич", "lat": 43.5667, "lng": 27.8333 },
  { "name": "Исперих", "lat": 43.7167, "lng": 26.8333 },
  { "name": "Каварна", "lat": 43.4333, "lng": 28.3333 },
  { "name": "Каолиново", "lat": 43.6167, "lng": 27.1 },
  { "name": "Карлово", "lat": 42.6333, "lng": 24.8 },
  { "name": "Карнобат", "lat": 42.65, "lng": 26.9833 },
  { "name": "Кнежа", "lat": 43.5, "lng": 24.0833 },
  { "name": "Котел", "lat": 42.8833, "lng": 26.45 },
  { "name": "Крумовград", "lat": 41.4667, "lng": 25.65 },
  { "name": "Кубрат", "lat": 43.8, "lng": 26.5 },
  { "name": "Кърджали", "lat": 41.6338, "lng": 25.3775 },
  { "name": "Ловеч", "lat": 43.1333, "lng": 24.7167 },
  { "name": "Мадан", "lat": 41.5, "lng": 24.9667 },
  { "name": "Монтана", "lat": 43.4, "lng": 23.2333 },
  { "name": "Никопол", "lat": 43.7, "lng": 24.9 },
  { "name": "Нова Загора", "lat": 42.4833, "lng": 26.0167 },
  { "name": "Нови пазар", "lat": 43.35, "lng": 27.2 },
  { "name": "Пазарджик", "lat": 42.2, "lng": 24.3333 },
  { "name": "Плевен", "lat": 43.417, "lng": 24.6067 },
  { "name": "Пловдив", "lat": 42.1354, "lng": 24.7453 },
  { "name": "Провадия", "lat": 43.1833, "lng": 27.4333 },
  { "name": "Разград", "lat": 43.5333, "lng": 26.5167 },
  { "name": "Русе", "lat": 43.8486, "lng": 25.9539 },
  { "name": "Свищов", "lat": 43.6167, "lng": 25.35 },
  { "name": "Силистра", "lat": 44.1167, "lng": 27.2667 },
  { "name": "Ситово", "lat": 44.0167, "lng": 27.0167 },
  { "name": "Сливен", "lat": 42.6833, "lng": 26.3167 },
  { "name": "Смолян", "lat": 41.5833, "lng": 24.7 },
  { "name": "София", "lat": 42.6977, "lng": 23.3219 },
  { "name": "Стара Загора", "lat": 42.4328, "lng": 25.6419 },
  { "name": "Твърдица", "lat": 42.7, "lng": 25.9 },
  { "name": "Търговище", "lat": 43.25, "lng": 26.5833 },
  { "name": "Харманли", "lat": 41.9333, "lng": 25.9 },
  { "name": "Хасково", "lat": 41.9333, "lng": 25.55 },
  { "name": "Шумен", "lat": 43.2712, "lng": 26.9361 },
  { "name": "Якоруда", "lat": 42.0167, "lng": 23.6833 },
  { "name": "Ямбол", "lat": 42.4833, "lng": 26.5 }
]

# ---------------------------------------------------------
# 2. HELPER FUNCTIONS
# ---------------------------------------------------------
def parse_time(time_str):
    """Parses time strings like '05:59' or '5:59'."""
    return datetime.strptime(time_str, "%H:%M")

def get_diff_minutes(official_str, algo_str):
    """Calculates (Official - Algorithm) in minutes."""
    t_off = parse_time(official_str)
    t_algo = parse_time(algo_str)
    return (t_off - t_algo).total_seconds() / 60

def get_week_number(date_str):
    """Returns ISO week number from date string YYYY-MM-DD."""
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return dt.isocalendar()[1]

# ---------------------------------------------------------
# 3. MAIN LOGIC
# ---------------------------------------------------------
def main():
    try:
        with open(ALGO_FILE, 'r', encoding='utf-8') as f:
            algo_data = json.load(f)
        with open(OFFICIAL_FILE, 'r', encoding='utf-8') as f:
            official_data = json.load(f)
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return

    final_results = []

    print(f"Processing {len(REFERENCE_CITIES)} cities...")

    for city_ref in REFERENCE_CITIES:
        city_name = city_ref['name']
        
        # Skip if city not in json files
        if city_name not in algo_data or city_name not in official_data:
            print(f"Skipping {city_name} (Not found in JSON data)")
            continue

        city_algo = algo_data[city_name]
        city_off = official_data[city_name]

        # Dictionary to store all diffs for a week
        # Structure: weeks[week_num][prayer_index] = [list of diffs]
        weeks_data = defaultdict(lambda: defaultdict(list))

        # Iterate through all dates in algorithm data
        for date_str, algo_times in city_algo.items():
            if date_str in city_off:
                off_times = city_off[date_str]
                week_num = get_week_number(date_str)

                # Calculate diff for each prayer
                for idx, prayer_name in enumerate(PRAYER_ORDER):
                    if prayer_name in algo_times and prayer_name in off_times:
                        diff = get_diff_minutes(off_times[prayer_name], algo_times[prayer_name])
                        weeks_data[week_num][idx].append(diff)

        # Aggregate averages for each week
        # Result format: "1": [0, -2, 4, 1, 0, 0]
        weekly_offsets_export = {}

        for w_num in sorted(weeks_data.keys()):
            avg_offsets = []
            for i in range(6): # For each of the 6 prayers
                diffs = weeks_data[w_num][i]
                if diffs:
                    # Calculate average and round to nearest minute
                    avg = round(sum(diffs) / len(diffs))
                    avg_offsets.append(int(avg))
                else:
                    avg_offsets.append(0)
            
            weekly_offsets_export[str(w_num)] = avg_offsets

        # Build final object
        city_obj = {
            "name": city_name,
            "lat": city_ref['lat'],
            "lng": city_ref['lng'],
            "weekly_offsets": weekly_offsets_export
        }
        final_results.append(city_obj)

    # 4. EXPORT TO JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_results, f, ensure_ascii=False, indent=2)

    print(f"Successfully generated {OUTPUT_FILE} with weekly offsets.")

if __name__ == "__main__":
    main()