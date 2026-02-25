using System;
using System.Collections.Generic;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PrayerTimesApp;

namespace PrayerTimesAppTests
{
    [TestClass]
    public class PrayerTimeCalculationTests
    {
        private MainForm _mainForm;
        private CityData _sofia;
        private CityData _varna;
        private CityData _plovdiv;
        private CityData _burgas;
        private DateTime _testDate;

        [TestInitialize]
        public void Setup()
        {
            _mainForm = new MainForm();

            _sofia = new CityData("София", 42.6977, 23.3219, GetDefaultOffsets());
            _varna = new CityData("Варна", 43.2141, 27.9147, GetDefaultOffsets());
            _plovdiv = new CityData("Пловдив", 42.1354, 24.7453, GetDefaultOffsets());
            _burgas = new CityData("Бургас", 42.5048, 27.4626, GetDefaultOffsets());

            _testDate = new DateTime(2024, 6, 15);
        }

        private Dictionary<int, int[]> GetDefaultOffsets()
        {
            var offsets = new Dictionary<int, int[]>();
            for (int week = 1; week <= 52; week++)
            {
                offsets[week] = new int[] { 0, 0, 0, 0, 0, 0 };
            }
            return offsets;
        }

        [TestMethod]
        public void CalculatePrayerTimes_Sofia_ReturnsValidTimes()
        {
            var result = InvokeCalculatePrayerTimes(_mainForm, _sofia, _testDate);

            Assert.IsNotNull(result);
            Assert.IsTrue(IsValidTimeFormat(result.Зора));
            Assert.IsTrue(IsValidTimeFormat(result.Изгрев));
            Assert.IsTrue(IsValidTimeFormat(result.Обяд));
            Assert.IsTrue(IsValidTimeFormat(result.Следобяд));
            Assert.IsTrue(IsValidTimeFormat(result.Залез));
            Assert.IsTrue(IsValidTimeFormat(result.Нощ));

            var fajr = TimeSpan.Parse(result.Зора);
            var sunrise = TimeSpan.Parse(result.Изгрев);
            var dhuhr = TimeSpan.Parse(result.Обяд);
            var asr = TimeSpan.Parse(result.Следобяд);
            var maghrib = TimeSpan.Parse(result.Залез);
            var isha = TimeSpan.Parse(result.Нощ);

            Assert.IsTrue(fajr < sunrise);
            Assert.IsTrue(sunrise < dhuhr);
            Assert.IsTrue(dhuhr < asr);
            Assert.IsTrue(asr < maghrib);
            Assert.IsTrue(maghrib < isha);
        }

        [TestMethod]
        public void CalculatePrayerTimes_AllCities_ReturnsTimesInValidRange()
        {
            var cities = new[] { _sofia, _varna, _plovdiv, _burgas };
            var testDates = new[]
            {
                new DateTime(2024, 1, 15),
                new DateTime(2024, 6, 15),
                new DateTime(2024, 3, 20),
                new DateTime(2024, 9, 22)
            };

            foreach (var city in cities)
            {
                foreach (var date in testDates)
                {
                    var result = InvokeCalculatePrayerTimes(_mainForm, city, date);
                    Assert.IsNotNull(result);

                    AssertTimeInRange(result.Зора, city.Name, date, "Зора");
                    AssertTimeInRange(result.Изгрев, city.Name, date, "Изгрев");
                    AssertTimeInRange(result.Обяд, city.Name, date, "Обяд");
                    AssertTimeInRange(result.Следобяд, city.Name, date, "Следобяд");
                    AssertTimeInRange(result.Залез, city.Name, date, "Залез");
                    AssertTimeInRange(result.Нощ, city.Name, date, "Нощ");
                }
            }
        }

        [TestMethod]
        public void CalculatePrayerTimes_DifferentLatitudes_ShowsExpectedVariations()
        {
            var date = new DateTime(2024, 6, 21);

            var sofiaTimes = InvokeCalculatePrayerTimes(_mainForm, _sofia, date);
            var varnaTimes = InvokeCalculatePrayerTimes(_mainForm, _varna, date);

            var sofiaSunrise = TimeSpan.Parse(sofiaTimes.Изгрев);
            var varnaSunrise = TimeSpan.Parse(varnaTimes.Изгрев);
            var sofiaSunset = TimeSpan.Parse(sofiaTimes.Залез);
            var varnaSunset = TimeSpan.Parse(varnaTimes.Залез);

            Assert.IsTrue(varnaSunrise < sofiaSunrise);
            Assert.IsTrue(varnaSunset < sofiaSunset);
        }

        [TestMethod]
        public void CalculatePrayerTimes_Seasons_ShowsExpectedVariations()
        {
            var summerDate = new DateTime(2024, 6, 21);
            var winterDate = new DateTime(2024, 12, 21);

            var summerTimes = InvokeCalculatePrayerTimes(_mainForm, _sofia, summerDate);
            var winterTimes = InvokeCalculatePrayerTimes(_mainForm, _sofia, winterDate);

            var summerFajr = TimeSpan.Parse(summerTimes.Зора);
            var winterFajr = TimeSpan.Parse(winterTimes.Зора);
            var summerIsha = TimeSpan.Parse(summerTimes.Нощ);
            var winterIsha = TimeSpan.Parse(winterTimes.Нощ);

            Assert.IsTrue(summerFajr < winterFajr);
            Assert.IsTrue(summerIsha > winterIsha);

            var summerDayLength = summerIsha - summerFajr;
            var winterDayLength = winterIsha - winterFajr;

            Assert.IsTrue(summerDayLength > winterDayLength);
        }

        [TestMethod]
        public void ApplyOffsetsToTimes_WithOffsets_ReturnsAdjustedTimes()
        {
            var testDate = new DateTime(2024, 6, 15);
            int weekNumber = GetIsoWeekNumber(testDate);

            var offsets = new Dictionary<int, int[]>();
            offsets[weekNumber] = new int[] { 5, 3, 2, 4, 3, 6 };

            var cityWithOffsets = new CityData("Тестов град", 42.6977, 23.3219, offsets);

            var result = InvokeCalculatePrayerTimes(_mainForm, cityWithOffsets, testDate);

            Assert.IsNotNull(result);
            Assert.IsTrue(IsValidTimeFormat(result.Зора));
            Assert.IsTrue(IsValidTimeFormat(result.Изгрев));
            Assert.IsTrue(IsValidTimeFormat(result.Обяд));
            Assert.IsTrue(IsValidTimeFormat(result.Следобяд));
            Assert.IsTrue(IsValidTimeFormat(result.Залез));
            Assert.IsTrue(IsValidTimeFormat(result.Нощ));
        }

        [TestMethod]
        public void CalculatePrayerTimes_MidnightTransition_HandlesCorrectly()
        {
            var testDate = new DateTime(2024, 6, 21);

            var result = InvokeCalculatePrayerTimes(_mainForm, _sofia, testDate);

            var isha = TimeSpan.Parse(result.Нощ);
            var fajr = TimeSpan.Parse(result.Зора);

            Assert.IsTrue(isha.TotalHours >= 0 && isha.TotalHours < 24);
            Assert.IsTrue(fajr.TotalHours >= 0 && fajr.TotalHours < 24);

            var sunrise = TimeSpan.Parse(result.Изгрев);
            Assert.IsTrue(fajr < sunrise);
        }

        private PrayerTimesData InvokeCalculatePrayerTimes(MainForm form, CityData city, DateTime date)
        {
            var method = typeof(MainForm).GetMethod("CalculatePrayerTimes",
                System.Reflection.BindingFlags.NonPublic |
                System.Reflection.BindingFlags.Instance);

            return method?.Invoke(form, new object[] { city, date }) as PrayerTimesData;
        }

        private bool IsValidTimeFormat(string timeString)
        {
            if (string.IsNullOrEmpty(timeString))
                return false;

            return TimeSpan.TryParse(timeString, out _);
        }

        private void AssertTimeInRange(string timeString, string cityName, DateTime date, string prayerName)
        {
            Assert.IsTrue(IsValidTimeFormat(timeString));
            var time = TimeSpan.Parse(timeString);
            Assert.IsTrue(time.TotalHours >= 0 && time.TotalHours < 24);
        }

        private int GetIsoWeekNumber(DateTime date)
        {
            return (date.DayOfYear - 1) / 7 + 1;
        }
    }
}