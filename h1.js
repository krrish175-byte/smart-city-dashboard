// ===== CONFIG =====
const API_KEY = "be1b627ecabbe5e8522b8edb35542fd1"; // <- put your OpenWeather key

const CITIES = {
  mumbai:  { name: "Mumbai, India",      lat: 19.0760, lon: 72.8777 },
  delhi:   { name: "Delhi, India",       lat: 28.6139, lon: 77.2090 },
  london:  { name: "London, UK",         lat: 51.5072, lon: -0.1276 },
  newyork: { name: "New York, USA",      lat: 40.7128, lon: -74.0060 },
  tokyo:   { name: "Tokyo, Japan",       lat: 35.6895, lon: 139.6917 },
  paris:   { name: "Paris, France",      lat: 48.8566, lon: 2.3522 },
  sydney:  { name: "Sydney, Australia",  lat: -33.8688, lon: 151.2093 },
};

// simple mock traffic (avg city speeds)
const TRAFFIC_DATA = {
  mumbai:  { speed: 18, level: "Heavy" },
  delhi:   { speed: 22, level: "Heavy" },
  london:  { speed: 35, level: "Moderate" },
  newyork: { speed: 30, level: "Moderate" },
  tokyo:   { speed: 45, level: "Light" },
  paris:   { speed: 32, level: "Moderate" },
  sydney:  { speed: 50, level: "Free flow" },
};

// mock public safety index (0–100)
const SAFETY_DATA = {
  mumbai:  { index: 68, label: "Average" },
  delhi:   { index: 60, label: "Average" },
  london:  { index: 88, label: "Excellent" },
  newyork: { index: 82, label: "Good" },
  tokyo:   { index: 94, label: "Excellent" },
  paris:   { index: 80, label: "Good" },
  sydney:  { index: 90, label: "Excellent" },
};

// mock energy consumption (in MW)
const ENERGY_DATA = {
  mumbai:  { value: 1850, label: "High" },
  delhi:   { value: 1720, label: "High" },
  london:  { value: 1350, label: "Normal" },
  newyork: { value: 1600, label: "High" },
  tokyo:   { value: 1900, label: "High" },
  paris:   { value: 1200, label: "Normal" },
  sydney:  { value: 950,  label: "Normal" },
};

// ===== DOM =====
const citySelect   = document.getElementById("citySelect");
const refreshBtn   = document.getElementById("refreshBtn");
const errorBox     = document.getElementById("error");

// hero
const dateText      = document.getElementById("dateText");
const cityNameEl    = document.getElementById("cityName");
const timeText      = document.getElementById("timeText");
const tempValue     = document.getElementById("tempValue");
const tempDesc      = document.getElementById("tempDesc");
const humidityValue = document.getElementById("humidityValue");
const windValue     = document.getElementById("windValue");

// metrics: AQI + traffic + safety + energy
const aqiNumber     = document.getElementById("aqiNumber");
const aqiStatus     = document.getElementById("aqiStatus");
const trafficPercent = document.getElementById("trafficPercent");
const trafficLabel   = document.getElementById("trafficLabel");
const safetyIndexEl  = document.getElementById("safetyIndex");
const safetyLabelEl  = document.getElementById("safetyLabel");
const energyValueEl  = document.getElementById("energyValue");
const energyLabelEl  = document.getElementById("energyLabel");

// chart
const pollutionCanvas = document.getElementById("pollutionChart");
let pollutionChartInstance = null;

// ===== HELPERS =====
function setLoading(state) {
  refreshBtn.disabled = state;
  refreshBtn.style.opacity = state ? "0.6" : "1";
}

function setError(msg) {
  errorBox.textContent = msg || "";
}

function aqiLabel(aqi) {
  if (!aqi) return "--";
  if (aqi === 1) return "Good";
  if (aqi === 2) return "Fair";
  if (aqi === 3) return "Moderate";
  if (aqi === 4) return "Poor";
  return "Very Poor";
}

function aqiStatusClass(aqi) {
  if (!aqi) return "";
  if (aqi <= 2) return "good";
  if (aqi === 3) return "moderate";
  return "bad";
}

// congestion % from speed (0–100)
function congestionPercent(speed) {
  const maxSpeed = 60;
  const ratio = Math.max(0, Math.min(1, speed / maxSpeed));
  return Math.round((1 - ratio) * 100);
}

// build simple 7-day trend from a base value
function makeTrend(base) {
  if (!base || base <= 0) return [0, 0, 0, 0, 0, 0, 0];
  const vals = [];
  for (let i = -2; i <= 4; i++) {
    vals.push(Math.max(0, base + i * 1.2));
  }
  return vals;
}

// ===== CHART =====
function updatePollutionChart(components) {
  const pm25 = components.pm2_5 ?? 0;
  const pm10 = components.pm10 ?? 0;
  const no2  = components.no2  ?? 0;

  const labels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const pm25Trend = makeTrend(pm25);
  const pm10Trend = makeTrend(pm10);
  const no2Trend  = makeTrend(no2);

  if (pollutionChartInstance) {
    pollutionChartInstance.data.datasets[0].data = pm25Trend;
    pollutionChartInstance.data.datasets[1].data = pm10Trend;
    pollutionChartInstance.data.datasets[2].data = no2Trend;
    pollutionChartInstance.update();
    return;
  }

  pollutionChartInstance = new Chart(pollutionCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "PM2.5", data: pm25Trend, tension: 0.4, pointRadius: 3 },
        { label: "PM10", data: pm10Trend, tension: 0.4, pointRadius: 3 },
        { label: "NO₂",  data: no2Trend,  tension: 0.4, pointRadius: 3 },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: "#6b7280", font: { size: 11 } },
          grid: { color: "#e5e7eb" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#6b7280", font: { size: 11 } },
          grid: { color: "#f3f4f6" }
        }
      },
      plugins: {
        legend: {
          labels: { color: "#4b5563", font: { size: 12 } }
        }
      },
      elements: {
        line: { borderWidth: 2 }
      }
    }
  });
}

// ===== MAIN LOGIC =====
async function loadCity() {
  const key = citySelect.value;
  const city = CITIES[key];
  if (!city) {
    setError("Unknown city.");
    return;
  }

  setError("");
  setLoading(true);

  try {
    // ---- weather ----
    const weatherUrl =
      `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${API_KEY}`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      const t = await weatherRes.text();
      console.error("Weather error", weatherRes.status, t);
      throw new Error("Weather API error.");
    }
    const weatherData = await weatherRes.json();

    const temp      = weatherData.main?.temp;
    const feels     = weatherData.main?.feels_like;
    const humidity  = weatherData.main?.humidity;
    const desc      = weatherData.weather?.[0]?.description || "N/A";
    const windMs    = weatherData.wind?.speed ?? 0;

    const now = new Date();
    dateText.textContent = now.toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric", year: "numeric"
    });
    timeText.textContent = now.toLocaleTimeString(undefined, {
      hour: "2-digit", minute: "2-digit"
    });
    cityNameEl.textContent = city.name;

    tempValue.textContent = temp !== undefined ? `${Math.round(temp)}°` : "--°";
    tempDesc.textContent  = desc.charAt(0).toUpperCase() + desc.slice(1);
    humidityValue.textContent = humidity != null ? `${humidity}%` : "--%";
    const windKmh = windMs * 3.6;
    windValue.textContent = `${windKmh.toFixed(1)} km/h`;

    // ---- air quality ----
    let aqi = null;
    let comps = {};
    try {
      const airUrl =
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}`;
      const airRes = await fetch(airUrl);
      if (airRes.ok) {
        const airData = await airRes.json();
        aqi   = airData.list?.[0]?.main?.aqi ?? null;
        comps = airData.list?.[0]?.components || {};
      }
    } catch (e) {
      console.warn("Air fetch failed", e);
    }

    aqiNumber.textContent = aqi ? `AQI ${aqi}` : "--";
    const label = aqiLabel(aqi);
    aqiStatus.textContent = label;
    aqiStatus.className = "metric-status " + aqiStatusClass(aqi);

    // ---- traffic (mock) ----
    const tInfo = TRAFFIC_DATA[key];
    if (tInfo) {
      const percent = congestionPercent(tInfo.speed);
      trafficPercent.textContent = `${percent}%`;
      trafficLabel.textContent = `${tInfo.level} · ${tInfo.speed} km/h`;
      trafficLabel.className =
        "metric-status " +
        (percent < 35 ? "good" : percent < 70 ? "moderate" : "bad");
    } else {
      trafficPercent.textContent = "--%";
      trafficLabel.textContent = "No data";
      trafficLabel.className = "metric-status";
    }

    // ---- public safety (mock per city) ----
    const sInfo = SAFETY_DATA[key];
    if (sInfo) {
      safetyIndexEl.textContent = sInfo.index;
      safetyLabelEl.textContent = sInfo.label;
      let cls = "good";
      if (sInfo.index < 60) cls = "bad";
      else if (sInfo.index < 80) cls = "moderate";
      safetyLabelEl.className = "metric-status " + cls;
    } else {
      safetyIndexEl.textContent = "--";
      safetyLabelEl.textContent = "N/A";
      safetyLabelEl.className = "metric-status";
    }

    // ---- energy consumption (mock per city) ----
    const eInfo = ENERGY_DATA[key];
    if (eInfo) {
      energyValueEl.textContent = `${eInfo.value} MW`;
      energyLabelEl.textContent = eInfo.label;
      let cls = "good";
      if (eInfo.label === "High") cls = "bad";
      energyLabelEl.className = "metric-status " + cls;
    } else {
      energyValueEl.textContent = "-- MW";
      energyLabelEl.textContent = "N/A";
      energyLabelEl.className = "metric-status";
    }

    // ---- pollution chart ----
    updatePollutionChart(comps);

  } catch (err) {
    console.error(err);
    setError(err.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
}

// events
citySelect.addEventListener("change", loadCity);
refreshBtn.addEventListener("click", loadCity);
window.addEventListener("load", loadCity);