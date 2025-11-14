// =========================
//  CONFIG + CONSTANTS
// =========================

// put your OpenWeather key here
const OPENWEATHER_KEY = "be1b627ecabbe5e8522b8edb35542fd1";

// TomTom Traffic API
const TOMTOM_KEY = "iN9VrxKgPUlht88S0AsMCk2p9w4l9hJY";

// City list
const CITIES = {
  mumbai:  { name: "Mumbai, India", lat: 19.0760, lon: 72.8777 },
  delhi:   { name: "Delhi, India",  lat: 28.6139, lon: 77.2090 },
  london:  { name: "London, UK", lat: 51.5072, lon: -0.1276 },
  newyork: { name: "New York, USA", lat: 40.7128, lon: -74.0060 },
  tokyo:   { name: "Tokyo, Japan", lat: 35.6895, lon: 139.6917 },
  paris:   { name: "Paris, France", lat: 48.8566, lon: 2.3522 },
  sydney:  { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093 }
};

// Hardcoded energy values
const ENERGY_MOCK = {
  mumbai:  { value: 1850, label: "High" },
  delhi:   { value: 1600, label: "High" },
  london:  { value: 1200, label: "Normal" },
  newyork: { value: 1500, label: "High" },
  tokyo:   { value: 1900, label: "High" },
  paris:   { value: 1100, label: "Normal" },
  sydney:  { value: 900,  label: "Low" }
};

// =========================
//  DOM ELEMENTS
// =========================

const citySelect   = document.getElementById("citySelect");
const refreshBtn   = document.getElementById("refreshBtn");
const errorBox     = document.getElementById("error");

const dateText      = document.getElementById("dateText");
const cityNameEl    = document.getElementById("cityName");
const timeText      = document.getElementById("timeText");
const tempValue     = document.getElementById("tempValue");
const tempDesc      = document.getElementById("tempDesc");
const humidityValue = document.getElementById("humidityValue");
const windValue     = document.getElementById("windValue");

const aqiNumber     = document.getElementById("aqiNumber");
const aqiStatus     = document.getElementById("aqiStatus");
const trafficPercent = document.getElementById("trafficPercent");
const trafficLabel   = document.getElementById("trafficLabel");
const safetyIndexEl  = document.getElementById("safetyIndex");
const safetyLabelEl  = document.getElementById("safetyLabel");
const energyValueEl  = document.getElementById("energyValue");
const energyLabelEl  = document.getElementById("energyLabel");

const pollutionCanvas = document.getElementById("pollutionChart");
let pollutionChart = null;

// =========================
//  HELPERS
// =========================

function setError(msg) {
  errorBox.textContent = msg || "";
}

function safeText(el, text) {
  if (!el) return;
  el.textContent = text;
}

function aqiLabel(aqi) {
  if (!aqi) return "--";
  return ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"][aqi];
}

function aqiStatusClass(aqi) {
  if (!aqi) return "";
  if (aqi === 1) return "good";
  if (aqi === 2) return "moderate";
  if (aqi >= 3) return "bad";
}

function congestionPercent(speed) {
  const max = 60;
  const r = Math.max(0, Math.min(speed / max, 1));
  return Math.round((1 - r) * 100);
}

function makeTrendFromCurrent(val) {
  const base = val || 0;
  return [
    base * 0.85,
    base * 0.92,
    base,
    base * 1.05,
    base * 1.12,
    base * 0.97,
    base * 0.9
  ].map(v => Math.round(v));
}

// =========================
//  API Fetchers
// =========================

async function fetchTraffic(lat, lon) {
  try {
    const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&unit=KMPH&key=${TOMTOM_KEY}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = await r.json();
    return j.flowSegmentData || null;
  } catch {
    return null;
  }
}

async function fetchAQIData(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = await r.json();
    return j.list?.[0] || null;
  } catch {
    return null;
  }
}

// =========================
//  CHART
// =========================

function createOrUpdateChart(labels, pm25, pm10, no2) {
  if (!pollutionChart) {
    pollutionChart = new Chart(pollutionCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "PM2.5", data: pm25, borderWidth: 2 },
          { label: "PM10", data: pm10, borderWidth: 2 },
          { label: "NO₂", data: no2, borderWidth: 2 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  } else {
    pollutionChart.data.labels = labels;
    pollutionChart.data.datasets[0].data = pm25;
    pollutionChart.data.datasets[1].data = pm10;
    pollutionChart.data.datasets[2].data = no2;
    pollutionChart.update();
  }
}

// =========================
//  MAIN LOGIC
// =========================

async function loadCity() {
  const key = citySelect.value;
  const city = CITIES[key];
  setError("");

  try {
    // ---- WEATHER ----
    const wURL = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${OPENWEATHER_KEY}`;
    const wRes = await fetch(wURL);
    if (!wRes.ok) throw new Error("Weather error");
    const w = await wRes.json();

    const now = new Date();
    safeText(dateText, now.toLocaleDateString(undefined, {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    }));
    safeText(timeText, now.toLocaleTimeString());
    safeText(cityNameEl, city.name);

    safeText(tempValue, `${Math.round(w.main.temp)}°`);
    safeText(tempDesc, w.weather?.[0]?.description || "");
    safeText(humidityValue, `${w.main.humidity}%`);
    safeText(windValue, `${(w.wind.speed * 3.6).toFixed(1)} km/h`);

    // ---- AQI ----
    const aq = await fetchAQIData(city.lat, city.lon);
    const aqi = aq?.main?.aqi || null;
    safeText(aqiNumber, aqi ? aqi : "--");
    safeText(aqiStatus, aqiLabel(aqi));
    aqiStatus.className = "metric-status " + aqiStatusClass(aqi);

    const comps = aq?.components || {};
    const pm25 = comps.pm2_5 || 0;
    const pm10 = comps.pm10 || 0;
    const no2  = comps.no2  || 0;

    // ---- Traffic ----
    const t = await fetchTraffic(city.lat, city.lon);
    if (t?.currentSpeed != null) {
      const speed = t.currentSpeed;
      const c = congestionPercent(speed);
      safeText(trafficPercent, `${c}%`);
      const lvl = c < 35 ? "Light" : c < 70 ? "Moderate" : "Heavy";
      safeText(trafficLabel, `${lvl} · ${speed} km/h`);
      trafficLabel.className = "metric-status " + (c < 35 ? "good" : c < 70 ? "moderate" : "bad");
    } else {
      safeText(trafficPercent, "--%");
      safeText(trafficLabel, "No data");
    }

    // ---- Safety (mocked good) ----
    safeText(safetyIndexEl, "100");
    safeText(safetyLabelEl, "Excellent");
    safetyLabelEl.className = "metric-status good";

    // ---- Energy (your fixed variables) ----
    const en = ENERGY_MOCK[key];
    if (en) {
      safeText(energyValueEl, `${en.value} MW`);
      safeText(energyLabelEl, en.label);
      const cls = en.label === "High" ? "bad" : en.label === "Normal" ? "moderate" : "good";
      energyLabelEl.className = "metric-status " + cls;
    } else {
      safeText(energyValueEl, "-- MW");
      safeText(energyLabelEl, "N/A");
    }

    // ---- Chart (fallback trend) ----
    const labels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    createOrUpdateChart(
      labels,
      makeTrendFromCurrent(pm25),
      makeTrendFromCurrent(pm10),
      makeTrendFromCurrent(no2)
    );

  } catch (err) {
    console.error(err);
    setError("Something went wrong while loading city data.");
  }
}

// =========================
//  EVENTS
// =========================

document.addEventListener("DOMContentLoaded", () => {
  citySelect.addEventListener("change", loadCity);
  refreshBtn.addEventListener("click", loadCity);
  loadCity();
});