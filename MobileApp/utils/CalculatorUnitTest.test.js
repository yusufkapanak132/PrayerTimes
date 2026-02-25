

import {
  getWeekday,
  getPrayerDisplayName,
  getNearestReferenceCity,
  calculatePrayerTimesForDate,
  REFERENCE_CITIES
} from './PrayerCalculator'; 



jest.mock('../assets/bg_cities_coordinates.json', () => ({
  "София": { lat: 42.6977, lng: 23.3219 },
  "Пловдив": { lat: 42.1439, lng: 24.7498 },
  "Варна": { lat: 43.2141, lng: 27.9147 }
}));


jest.mock('../assets/city_weekly_offsets_2026.json', () => ([
  {
    name: "София",
    weekly_offsets: {
      
      "1": [10, 10, 10, 10, 10, 10] 
    }
  }
]));

describe('PrayerCalculator Unit Tests', () => {

  
  describe('Помощни функции (Helper Functions)', () => {

    it('getWeekday трябва да връща правилния ден от седмицата на български', () => {
      
      const testDate = new Date('2026-01-02T12:00:00Z');
      expect(getWeekday(testDate)).toBe('петък');
      
      
      const testDate2 = new Date('2026-01-05T12:00:00Z');
      expect(getWeekday(testDate2)).toBe('понеделник');
    });

    it('getPrayerDisplayName трябва да връща "Джума" в петък по обяд', () => {
      const fridayDate = new Date('2026-01-02T12:00:00Z'); 
      const mondayDate = new Date('2026-01-05T12:00:00Z'); 

      expect(getPrayerDisplayName('Обяд', fridayDate)).toBe('Джума');
      expect(getPrayerDisplayName('Обяд', mondayDate)).toBe('Обедна');
      expect(getPrayerDisplayName('Залез', fridayDate)).toBe('Вечерна');
      expect(getPrayerDisplayName('Непозната', fridayDate)).toBe('Непозната'); 
    });

    it('getNearestReferenceCity трябва да намира най-близкия град', () => {
      
      const userLat = 42.65;
      const userLng = 23.35;
      const nearest = getNearestReferenceCity(userLat, userLng);
      
      expect(nearest.name).toBe('София');
    });
  });

  
  describe('calculatePrayerTimesForDate (Core Math & Logic)', () => {

    const mockSofia = { name: "София", lat: 42.6977, lng: 23.3219 };
    const testDate = new Date('2026-01-01T12:00:00Z'); 

    it('трябва да връща правилен обект с times, timesFull и rawDates', () => {
      const result = calculatePrayerTimesForDate(testDate, null, mockSofia, false);

      
      expect(result).toHaveProperty('times');
      expect(result).toHaveProperty('timesFull');
      expect(result).toHaveProperty('rawDates');

      
      const expectedKeys = ["Зора", "Изгрев", "Обяд", "Следобяд", "Залез", "Нощ"];
      expectedKeys.forEach(key => {
        expect(result.times).toHaveProperty(key);
        expect(result.timesFull).toHaveProperty(key);
        expect(result.rawDates).toHaveProperty(key);
      });

      
      expect(result.times["Зора"]).toMatch(/^\d{2}:\d{2}$/);
      expect(result.timesFull["Зора"]).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('времената трябва да са в хронологичен ред (Зора < Изгрев < Обяд < Следобяд < Залез < Нощ)', () => {
      const result = calculatePrayerTimesForDate(testDate, null, mockSofia, false);
      const raw = result.rawDates;

      expect(raw["Зора"].getTime()).toBeLessThan(raw["Изгрев"].getTime());
      expect(raw["Изгрев"].getTime()).toBeLessThan(raw["Обяд"].getTime());
      expect(raw["Обяд"].getTime()).toBeLessThan(raw["Следобяд"].getTime());
      expect(raw["Следобяд"].getTime()).toBeLessThan(raw["Залез"].getTime());
      expect(raw["Залез"].getTime()).toBeLessThan(raw["Нощ"].getTime());
    });

    it('трябва да прилага седмичните отмествания (offsets) правилно', () => {
      
      const resultWithoutOffset = calculatePrayerTimesForDate(testDate, null, null, false);
      
      
      const resultWithOffset = calculatePrayerTimesForDate(testDate, null, mockSofia, false);

      const rawBase = resultWithoutOffset.rawDates["Обяд"].getTime();
      const rawOffset = resultWithOffset.rawDates["Обяд"].getTime();

      
      expect(rawOffset - rawBase).toBe(10 * 60000);
    });

    it('Auto режимът трябва да изчислява делтата на база координатите на потребителя', () => {
      
      const userCoords = { lat: 42.50, lng: 23.50 };
      
      const manualResult = calculatePrayerTimesForDate(testDate, null, mockSofia, false);
      const autoResult = calculatePrayerTimesForDate(testDate, userCoords, mockSofia, true);

      
      const manualDhuhr = manualResult.rawDates["Обяд"].getTime();
      const autoDhuhr = autoResult.rawDates["Обяд"].getTime();

      expect(manualDhuhr).not.toBe(autoDhuhr);
    });

  });
});