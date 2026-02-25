import weeklyOffsetsData from '../assets/city_weekly_offsets_2026.json';
import rawCityData from '../assets/bg_cities_coordinates.json';

// --- КОНСТАНТИ ---
export const REFERENCE_CITIES = Object.entries(rawCityData).map(([cityName, data]) => ({
  name: cityName,
  lat: data.lat,
  lng: data.lng
}));

export const order = ["Зора", "Изгрев", "Обяд", "Следобяд", "Залез", "Нощ"];
export const prayerKeys = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

// --- ПОМОЩНИ ФУНКЦИИ (HELPER FUNCTIONS) ---

export const getWeekday = (date) => {
  return date.toLocaleDateString("bg-BG", { weekday: "long" });
};

export const getPrayerDisplayName = (prayerKey, date = new Date()) => {
  const isFriday = getWeekday(date) === 'петък';
  const prayerMap = {
    "Зора": "Зора",
    "Изгрев": "Изгрев",
    "Обяд": isFriday ? "Джума" : "Обедна",
    "Следобяд": "Следобедна",
    "Залез": "Вечерна",
    "Нощ": "Нощна"
  };
  return prayerMap[prayerKey] || prayerKey;
};

// --- МАТЕМАТИЧЕСКА ЛОГИКА (MATH) - ТОЧНО КОПИЕ ---

const dtr = (deg) => deg * Math.PI / 180.0;
const rtd = (rad) => rad * 180.0 / Math.PI;

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

const getCityOffsetsForWeek = (cityName, date) => {
  if (!weeklyOffsetsData || weeklyOffsetsData.length === 0) return null;
  const cityData = weeklyOffsetsData.find(city => city.name === cityName);
  if (!cityData || !cityData.weekly_offsets) return null;
  const weekNumber = getWeekNumber(date);
  const offsets = cityData.weekly_offsets[weekNumber.toString()];
  if (!offsets || !Array.isArray(offsets) || offsets.length !== 6) return [0, 0, 0, 0, 0, 0];
  return offsets;
};

const getAccurateJulianDay = (date) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jd + (hour - 12) / 24 + minute / 1440 + second / 86400;
};

const normalizeAngle = (angle) => {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
};

const getEnhancedRefraction = (altitude, temperature = 15, pressure = 1013.25) => {
  if (altitude < -1) return 0;
  const altDeg = altitude;
  if (altDeg > 15) {
    return 0.00452 * pressure / 1013.25 * 3.51561 / Math.tan(dtr(altDeg));
  } else if (altDeg > -0.5) {
    const R = 3.51561 * (0.1594 + 0.0196 * altDeg + 0.00002 * altDeg * altDeg) / (1 + 0.505 * altDeg + 0.0845 * altDeg * altDeg);
    return R * pressure / 1013.25 * (1 + (temperature - 10) * 0.0033);
  } else {
    return 0;
  }
};

const getSeasonalAngle = (date, baseAngle) => {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const dayOfYear = Math.floor((date - start) / 86400000);
  const isLeap = ((date.getUTCFullYear() % 4 === 0 && date.getUTCFullYear() % 100 !== 0) || date.getUTCFullYear() % 400 === 0);
  const totalDays = isLeap ? 366 : 365;
  const variation = 0.3 * Math.sin((dayOfYear / totalDays) * 2 * Math.PI);
  return baseAngle + variation;
};

const getUniversalSeasonalCorrection = (date, prayerIndex) => {
  const year = date.getUTCFullYear();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const start = new Date(Date.UTC(year, 0, 0));
  const dayOfYear = Math.floor((date - start) / 86400000);
  const totalDays = isLeap ? 366 : 365;
  const t = dayOfYear / totalDays;
  const amplitudes = [2.5, 3.5, 1.5, 1.5, 3.5, 2.5];
  const phases = [0, Math.PI/6, Math.PI/2, Math.PI/2, 5*Math.PI/6, Math.PI];
  const offset = Math.sin(2 * Math.PI * t + phases[prayerIndex]) * amplitudes[prayerIndex];
  return Math.round(offset * 10) / 10;
};

const getRawAstroTimes = (lat, lng, date) => {
  const jd = getAccurateJulianDay(date) - 2451545.0;
  const g = normalizeAngle(357.52911 + 0.98560028 * jd);
  const gRad = dtr(g);
  const L = normalizeAngle(280.46646 + 0.98564736 * jd);
  const C = 1.9148 * Math.sin(gRad) + 0.0200 * Math.sin(2 * gRad) + 0.0003 * Math.sin(3 * gRad);
  const lambda = L + C;
  const epsilon = 23.43929 - 0.00000036 * jd;
  const lambdaRad = dtr(lambda);
  const epsilonRad = dtr(epsilon);
  const deltaRad = Math.asin(Math.sin(epsilonRad) * Math.sin(lambdaRad));
  const delta = rtd(deltaRad);
  const y = Math.tan(epsilonRad / 2);
  const y2 = y * y;
  const eq = rtd(y2 * Math.sin(2 * dtr(L)) - 2 * 0.0167 * Math.sin(gRad) + 4 * 0.0167 * y2 * Math.sin(gRad) * Math.cos(2 * dtr(L)) - 0.5 * y2 * y2 * Math.sin(4 * dtr(L)) - 1.25 * 0.0167 * 0.0167 * Math.sin(2 * gRad)) * 4;
  const noon = 12.0 - (lng / 15.0) - (eq / 60.0);
  const fajrAngle = getSeasonalAngle(date, -18);
  const ishaAngle = getSeasonalAngle(date, -17);
  const sunriseRefraction = getEnhancedRefraction(-0.833);
  const sunriseAngle = -0.833 + sunriseRefraction;

  const getHourAngle = (latitude, declination, altitude) => {
    const latRad = dtr(latitude);
    const decRad = dtr(declination);
    const altRad = dtr(altitude);
    const cosH = (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
    if (cosH <= -1) return 12.0;
    if (cosH >= 1) return 0;
    if (Math.abs(cosH) > 1) return cosH > 0 ? 0 : 12;
    return rtd(Math.acos(cosH)) / 15.0;
  };

  const getAsrHourAngle = (latitude, declination) => {
    const latRad = dtr(latitude);
    const decRad = dtr(declination);
    const shadowLength = 1;
    const angle = Math.atan(1 / (shadowLength + Math.tan(Math.abs(latRad - decRad))));
    return getHourAngle(latitude, declination, rtd(angle));
  };

  const timeFromHours = (baseDate, hours) => {
    let h = hours;
    while (h < 0) h += 24;
    while (h >= 24) h -= 24;
    const hour = Math.floor(h);
    const minutes = (h - hour) * 60;
    const minute = Math.floor(minutes);
    const seconds = Math.round((minutes - minute) * 60);
    return new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate(), hour, minute, seconds));
  };

  const solarNoon = timeFromHours(date, noon);
  return {
    "Fajr": timeFromHours(date, noon - getHourAngle(lat, delta, fajrAngle)),
    "Sunrise": timeFromHours(date, noon - getHourAngle(lat, delta, sunriseAngle)),
    "Dhuhr": solarNoon,
    "Asr": timeFromHours(date, noon + getAsrHourAngle(lat, delta)),
    "Maghrib": timeFromHours(date, noon + getHourAngle(lat, delta, sunriseAngle)),
    "Isha": timeFromHours(date, noon + getHourAngle(lat, delta, ishaAngle))
  };
};

export const getNearestReferenceCity = (userLat, userLng) => {
  let minDistance = Infinity;
  let nearestCity = REFERENCE_CITIES[0];
  for (const city of REFERENCE_CITIES) {
    const distance = Math.sqrt(Math.pow(userLat - city.lat, 2) + Math.pow(userLng - city.lng, 2));
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }
  return nearestCity;
};

// --- ОСНОВНА ФУНКЦИЯ ЗА ИЗЧИСЛЕНИЕ (CORE CALCULATION) ---
export const calculatePrayerTimesForDate = (date, userCoords = null, selectedCity = null, isAuto = false) => {
  const calculationDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0, 0));
  let calculatedTimes;

  if (isAuto && userCoords && selectedCity) {
    const nearestCity = getNearestReferenceCity(userCoords.lat, userCoords.lng);
    const rB = getRawAstroTimes(nearestCity.lat, nearestCity.lng, calculationDate);
    const rU = getRawAstroTimes(userCoords.lat, userCoords.lng, calculationDate);
    const result = {};
    for (let i = 0; i < prayerKeys.length; i++) {
      const key = prayerKeys[i];
      const baseTimeMs = rB[key].getTime();
      const deltaMs = rU[key].getTime() - baseTimeMs;
      let finalTime = new Date(baseTimeMs + deltaMs);
      const seasonalCorrection = getUniversalSeasonalCorrection(date, i);
      finalTime = new Date(finalTime.getTime() + seasonalCorrection * 60000);
      result[key] = finalTime;
    }
    calculatedTimes = result;
  } else {
    // Fallback if selectedCity is null (shouldn't happen but for safety)
    const cityToUse = selectedCity || REFERENCE_CITIES[0];
    calculatedTimes = getRawAstroTimes(cityToUse.lat, cityToUse.lng, calculationDate);
    const correctedTimes = {};
    for (let i = 0; i < prayerKeys.length; i++) {
      const key = prayerKeys[i];
      const time = calculatedTimes[key];
      const seasonalCorrection = getUniversalSeasonalCorrection(date, i);
      correctedTimes[key] = new Date(time.getTime() + seasonalCorrection * 60000);
    }
    calculatedTimes = correctedTimes;
  }

  const offsets = selectedCity ? getCityOffsetsForWeek(selectedCity.name, date) : null;
  if (offsets) {
    const adjustedTimes = {};
    for (let i = 0; i < prayerKeys.length; i++) {
      const key = prayerKeys[i];
      const offsetMinutes = offsets[i];
      if (calculatedTimes[key]) {
        const originalTime = new Date(calculatedTimes[key].getTime());
        adjustedTimes[key] = new Date(originalTime.getTime() + (offsetMinutes * 60000));
      } else {
        adjustedTimes[key] = calculatedTimes[key];
      }
    }
    calculatedTimes = adjustedTimes;
  }

  const times = {};
  const timesFull = {};
  const rawDates = {};

  order.forEach((prayerName, index) => {
    const key = prayerKeys[index];
    const time = calculatedTimes[key];
    if (time) {
      // Преобразуваме UTC времето в локално за визуализация
      const localTime = new Date(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
      
      const hoursStr = localTime.getHours().toString().padStart(2, '0');
      const minutesStr = localTime.getMinutes().toString().padStart(2, '0');
      const secondsStr = localTime.getSeconds().toString().padStart(2, '0');

      times[prayerName] = `${hoursStr}:${minutesStr}`;
      timesFull[prayerName] = `${hoursStr}:${minutesStr}:${secondsStr}`;
      rawDates[prayerName] = localTime;
    }
  });

  return { times, timesFull, rawDates };
};