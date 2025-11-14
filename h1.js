// =============================
// h1.js — fixed + stable version
// =============================

// CONFIG
const OPENWEATHER_KEY = "be1b627ecabbe5e8522b8edb35542fd1";
const TOMTOM_KEY = "iN9VrxKgPUlht88S0AsMCk2p9w4l9hJY";
const AUTO_REFRESH_INTERVAL_MS = 30_000;

const CITIES = {
  mumbai:  { name: "Mumbai, India", lat: 19.0760, lon: 72.8777 },
  delhi:   { name: "Delhi, India",  lat: 28.6139, lon: 77.2090 },
  london:  { name: "London, UK",   lat: 51.5072, lon: -0.1276 },
  newyork: { name: "New York, USA",lat: 40.7128, lon: -74.0060 },
  tokyo:   { name: "Tokyo, Japan", lat: 35.6895, lon: 139.6917 },
  paris:   { name: "Paris, France",lat: 48.8566, lon: 2.3522 },
  sydney:  { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093 }
};

const ENERGY_MOCK = {
  mumbai:  { value: 1850, label: "High" },
  delhi:   { value: 1600, label: "High" },
  london:  { value: 1200, label: "Normal" },
  newyork: { value: 1500, label: "High" },
  tokyo:   { value: 1900, label: "High" },
  paris:   { value: 1100, label: "Normal" },
  sydney:  { value: 900,  label: "Low" }
};

// DOM
const citySelect   = document.getElementById("citySelect");
const refreshBtn   = document.getElementById("refreshBtn");
const darkToggle   = document.getElementById("darkToggle");
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

// state
let pollutionChartInstance = null;
let map = null;
let mapMarker = null;
let radarLayer = null;
let aqiHeatLayer = null;
let trafficHeatLayer = null;
let autoRefreshTimer = null;

// helpers
function setError(msg){ if (errorBox) errorBox.textContent = msg || ""; }
function safeText(el, v){ if (!el) return; el.textContent = v; }
function cap(s){ if(!s) return s; return s.charAt(0).toUpperCase()+s.slice(1); }
function congestionPercent(speed){ const max=60; const r=Math.max(0,Math.min(speed/max,1)); return Math.round((1-r)*100); }

// chart
function createOrUpdateChart(labels, pm25, pm10, no2){
  labels = labels && labels.length ? labels : ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  pm25 = pm25 && pm25.length ? pm25 : new Array(labels.length).fill(0);
  pm10 = pm10 && pm10.length ? pm10 : new Array(labels.length).fill(0);
  no2  = no2  && no2.length ? no2  : new Array(labels.length).fill(0);

  if (pollutionChartInstance){
    pollutionChartInstance.data.labels = labels;
    pollutionChartInstance.data.datasets[0].data = pm25;
    pollutionChartInstance.data.datasets[1].data = pm10;
    pollutionChartInstance.data.datasets[2].data = no2;
    pollutionChartInstance.update();
    return;
  }

  pollutionChartInstance = new Chart(pollutionCanvas.getContext("2d"), {
    type: "line",
    data: { labels, datasets: [
      { label:"PM2.5", data: pm25, borderWidth:2, tension:0.3 },
      { label:"PM10",  data: pm10,  borderWidth:2, tension:0.3 },
      { label:"NO₂",   data: no2,   borderWidth:2, tension:0.3 }
    ]},
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:"top"}}, scales:{ y:{ beginAtZero:true } } }
  });
}

// Map initialization
function initMap(lat=20, lon=0, isDark=false){
  try {
    if (!map) {
      map = L.map("map", { zoomControl:true, preferCanvas:true }).setView([lat, lon], 12);

      const lightTiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:19, attribution: "" });
      const darkTiles  = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom:19, attribution: "" });

      if (isDark) darkTiles.addTo(map); else lightTiles.addTo(map);

      map._lightTiles = lightTiles;
      map._darkTiles = darkTiles;

      aqiHeatLayer = L.heatLayer([], { radius: 25, blur: 18, maxZoom: 12 }).addTo(map);
      trafficHeatLayer = L.heatLayer([], { radius: 28, blur: 20, maxZoom: 12 }).addTo(map);

      const html = `<div class="pulse-marker" title="Selected city"></div>`;
      mapMarker = L.marker([lat, lon], { icon: L.divIcon({ className: "", html, iconSize:[18,18], iconAnchor:[9,9] }) }).addTo(map);

      // ensure map invalidation after paint (helps with some dev servers)
      setTimeout(()=>{ try{ map.invalidateSize(); }catch(e){} }, 300);
    } else {
      if (isDark) { if (map._darkTiles && !map.hasLayer(map._darkTiles)) { map.removeLayer(map._lightTiles); map.addLayer(map._darkTiles); } }
      else        { if (map._lightTiles && !map.hasLayer(map._lightTiles)) { map.removeLayer(map._darkTiles); map.addLayer(map._lightTiles); } }

      map.setView([lat, lon], 12);
      if (mapMarker) mapMarker.setLatLng([lat, lon]);
    }
  } catch(e){ console.warn("initMap error", e); }
}

// Radar: safe add
function updateRadarLayer(lat, lon){
  try {
    if (!map) return;
    if (radarLayer) { try{ map.removeLayer(radarLayer); } catch(e){} radarLayer = null; }
    const url = `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_KEY}`;
    radarLayer = L.tileLayer(url, { opacity: 0.55, attribution: "" }).addTo(map);
  } catch(e) { console.warn("radar add failed", e); }
}

// AQI heat from OpenAQ
async function buildAQIHeat(lat, lon){
  try {
    if (!map || !aqiHeatLayer) return;
    const dateTo = new Date().toISOString();
    const dateFrom = new Date(Date.now() - 7*24*3600*1000).toISOString();
    const url = `https://api.openaq.org/v2/measurements?coordinates=${lat},${lon}&radius=10000&date_from=${dateFrom}&date_to=${dateTo}&limit=1000`;
    const res = await fetch(url);
    if (!res.ok) { aqiHeatLayer.setLatLngs([]); return; }
    const json = await res.json();
    const results = json.results || [];
    if (!results.length) { aqiHeatLayer.setLatLngs([]); return; }
    const pts = [];
    for (const m of results) {
      if (!m || !m.coordinates) continue;
      const v = Number(m.value) || 0;
      const intensity = Math.min(1, Math.max(0, v / 200));
      pts.push([m.coordinates.latitude, m.coordinates.longitude, intensity]);
    }
    aqiHeatLayer.setLatLngs(pts);
  } catch(e){ console.warn("AQI heat failed", e); }
}

// Traffic blob (TomTom)
async function buildTrafficHeat(lat, lon){
  try {
    if (!map || !trafficHeatLayer) return;
    const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&unit=KMPH&key=${TOMTOM_KEY}`;
    const res = await fetch(url);
    if (!res.ok) { trafficHeatLayer.setLatLngs([]); return; }
    const json = await res.json();
    const f = json.flowSegmentData || json;
    const speed = f?.currentSpeed ?? null;
    if (speed == null) { trafficHeatLayer.setLatLngs([]); return; }
    const intensity = Math.min(1, Math.max(0, (60 - speed) / 60));
    const points = [];
    const steps = 12;
    for (let i=0;i<steps;i++){
      const angle = (i / steps) * Math.PI * 2;
      const deltaLat = (Math.cos(angle) * 0.02) * (0.6 + Math.random()*0.6);
      const deltaLon = (Math.sin(angle) * 0.02) * (0.6 + Math.random()*0.6);
      points.push([lat + deltaLat, lon + deltaLon, intensity]);
    }
    trafficHeatLayer.setLatLngs(points);
  } catch(e){ console.warn("traffic heat failed", e); }
}

// Fetch helpers
async function fetchWeather(lat, lon){
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_KEY}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  } catch(e){ console.warn("fetchWeather fail", e); return null; }
}

async function fetchAirOpenWeather(lat, lon){
  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  } catch(e){ console.warn("fetchAir fail", e); return null; }
}

// OpenAQ history
async function fetchAQIHistory_OpenAQ(lat, lon){
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(Date.now() - 7*24*3600*1000);
    const dateFrom = sevenDaysAgo.toISOString();
    const dateTo = now.toISOString();
    const url = `https://api.openaq.org/v2/measurements?coordinates=${lat},${lon}&radius=10000&date_from=${dateFrom}&date_to=${dateTo}&limit=1000`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const json = await r.json();
    const results = json.results || [];
    if (!results.length) return null;
    const buckets = {};
    for (const m of results) {
      if (!m || !m.date || !m.date.local || !m.parameter) continue;
      const day = m.date.local.slice(0,10);
      if (!buckets[day]) buckets[day] = { pm25:[], pm10:[], no2:[] };
      const val = Number(m.value) || 0;
      if (m.parameter === "pm25") buckets[day].pm25.push(val);
      if (m.parameter === "pm10") buckets[day].pm10.push(val);
      if (m.parameter === "no2")  buckets[day].no2.push(val);
    }
    const dates=[], pm25=[], pm10=[], no2=[];
    for (let i=6;i>=0;i--){
      const d = new Date(Date.now() - i*24*3600*1000);
      const key = d.toISOString().slice(0,10);
      dates.push(key);
      const b = buckets[key];
      const avg = arr => arr && arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0;
      pm25.push(b ? avg(b.pm25) : 0);
      pm10.push(b ? avg(b.pm10) : 0);
      no2.push(b ? avg(b.no2) : 0);
    }
    return { dates, pm25, pm10, no2 };
  } catch(e){ console.warn("fetchAQIHistory fail", e); return null; }
}

function makeTrendFromCurrent(val){
  const base = val || 0;
  return [ base*0.85, base*0.92, base, base*1.05, base*1.12, base*0.97, base*0.9 ].map(v=>Math.round(v));
}

// MAIN: loadCity
async function loadCity(key=null){
  setError("");
  const selectedKey = key || (citySelect && citySelect.value) || Object.keys(CITIES)[0];
  const city = CITIES[selectedKey];
  if (!city) return;

  try {
    // weather
    const wd = await fetchWeather(city.lat, city.lon);
    if (wd) {
      safeText(tempValue, wd.main && Number.isFinite(wd.main.temp) ? `${Math.round(wd.main.temp)}°` : "--°");
      safeText(tempDesc, wd.weather?.[0]?.description ? cap(wd.weather[0].description) : "--");
      safeText(humidityValue, wd.main?.humidity != null ? `${wd.main.humidity}%` : "--%");
      safeText(windValue, wd.wind?.speed ? `${(wd.wind.speed*3.6).toFixed(1)} km/h` : "-- km/h");

      const now = new Date();
      safeText(dateText, now.toLocaleDateString(undefined,{ weekday:"long", month:"long", day:"numeric", year:"numeric" }));
      safeText(timeText, now.toLocaleTimeString(undefined,{ hour:"2-digit", minute:"2-digit", second:"2-digit" }));
      safeText(cityNameEl, city.name);
    } else {
      safeText(tempValue,"--°"); safeText(tempDesc,"--"); safeText(humidityValue,"--%"); safeText(windValue,"-- km/h");
    }

    // air
    const air = await fetchAirOpenWeather(city.lat, city.lon);
    const aqi = air?.list?.[0]?.main?.aqi ?? null;
    const comps = air?.list?.[0]?.components || {};
    safeText(aqiNumber, aqi ? aqi : "--");
    safeText(aqiStatus, aqi ? ["","Good","Fair","Moderate","Poor","Very Poor"][aqi] : "--");
    aqiStatus.className = "metric-status " + (aqi ? (aqi <=2 ? "good" : aqi===3 ? "moderate" : "bad") : "");

    // traffic
    try {
      const tt = await fetch(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${city.lat},${city.lon}&unit=KMPH&key=${TOMTOM_KEY}`);
      if (tt.ok) {
        const jt = await tt.json();
        const f = jt.flowSegmentData || jt;
        const speed = f?.currentSpeed ?? null;
        if (speed != null) {
          const percent = congestionPercent(speed);
          safeText(trafficPercent, `${percent}%`);
          safeText(trafficLabel, `${Math.round(speed)} km/h`);
          trafficLabel.className = "metric-status " + (percent < 35 ? "good" : percent < 70 ? "moderate" : "bad");
        } else {
          safeText(trafficPercent, "--%"); safeText(trafficLabel, "No data");
        }
        buildTrafficHeat(city.lat, city.lon);
      } else {
        safeText(trafficPercent,"--%"); safeText(trafficLabel,"No data");
      }
    } catch(e){ safeText(trafficPercent,"--%"); safeText(trafficLabel,"No data"); console.warn("TomTom err", e); }

    // safety mock
    safeText(safetyIndexEl, "100"); safeText(safetyLabelEl, "Excellent"); safetyLabelEl.className = "metric-status good";

    // energy
    const en = ENERGY_MOCK[selectedKey];
    if (en) { safeText(energyValueEl, `${en.value} MW`); safeText(energyLabelEl, en.label); energyLabelEl.className = "metric-status " + (en.label === "High" ? "bad" : en.label === "Normal" ? "moderate" : "good"); }
    else { safeText(energyValueEl, "-- MW"); safeText(energyLabelEl, "N/A"); }

    // chart
    try {
      const hist = await fetchAQIHistory_OpenAQ(city.lat, city.lon).catch(()=>null);
      if (hist && hist.dates && hist.dates.length) {
        createOrUpdateChart(hist.dates.map(d=>{ const dd=new Date(d+"T00:00:00"); return dd.toLocaleDateString(undefined,{weekday:"short"}); }), hist.pm25, hist.pm10, hist.no2);
      } else {
        createOrUpdateChart(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
          makeTrendFromCurrent(comps.pm2_5 || 0),
          makeTrendFromCurrent(comps.pm10 || 0),
          makeTrendFromCurrent(comps.no2 || 0)
        );
      }
    } catch(e){ console.warn("chart fail", e); createOrUpdateChart(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,0,0]); }

    // map + overlays
    try {
      const dark = document.documentElement.classList.contains("dark");
      initMap(city.lat, city.lon, dark);
      updateRadarLayer(city.lat, city.lon);
      buildAQIHeat(city.lat, city.lon);
      buildTrafficHeat(city.lat, city.lon);
    } catch(e){ console.warn("map overlays failed", e); }

    setError("");
  } catch (err) {
    console.error("loadCity error", err);
    setError("Failed to load city data.");
  }
}

// auto refresh
function startAutoRefresh(){ stopAutoRefresh(); autoRefreshTimer = setInterval(()=>{ loadCity(); }, AUTO_REFRESH_INTERVAL_MS); }
function stopAutoRefresh(){ if (autoRefreshTimer) clearInterval(autoRefreshTimer); autoRefreshTimer = null; }

// dark mode
function applyDark(d){
  document.documentElement.classList.toggle("dark", !!d);
  if (map) initMap(map.getCenter().lat, map.getCenter().lng, !!d);
  localStorage.setItem("sc_dark", !!d ? "1" : "0");
}
(function initDark(){
  const stored = localStorage.getItem("sc_dark");
  if (stored === "1") applyDark(true);
  else applyDark(false);
})();

// events
document.addEventListener("DOMContentLoaded", ()=>{
  if (citySelect) citySelect.addEventListener("change", ()=> loadCity());
  if (refreshBtn) refreshBtn.addEventListener("click", ()=> loadCity());
  if (darkToggle) darkToggle.addEventListener("click", ()=> { applyDark(!document.documentElement.classList.contains("dark")); darkToggle.textContent = document.documentElement.classList.contains("dark") ? "☀️" : "🌙"; });

  // initial
  loadCity();
  startAutoRefresh();
});