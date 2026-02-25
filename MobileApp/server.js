const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());

// Четем JSON файла с времената
let prayerTimes = {};
try {
  const data = fs.readFileSync('all_prayer_times_2026.json', 'utf-8');
  prayerTimes = JSON.parse(data);
} catch (err) {
  console.error("Не може да се прочете JSON файла:", err);
}

// REST API endpoint
// Пример: GET /times?city=Sofia&date=2025-01-01
app.get('/times', (req, res) => {
  const city = req.query.city;
  const date = req.query.date;

  if (!city || !date) {
    return res.status(400).json({ error: "Missing city or date parameter" });
  }

  const cityData = prayerTimes[city];
  if (!cityData) return res.status(404).json({ error: "City not found" });

  const dayData = cityData[date];
  if (!dayData) return res.status(404).json({ error: "Date not found" });

  res.json(dayData);
});

// Списък на всички градове
app.get('/cities', (req, res) => {
  res.json(Object.keys(prayerTimes));
});

app.listen(PORT, () => {
  console.log(`Prayer times API is running on http://localhost:${PORT}`);
});
