const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

const locationCard = document.getElementById("locationCard");
const weatherCard = document.getElementById("weatherCard");
const aqCard = document.getElementById("aqCard");

let weatherChart, aqChart;

searchBtn.addEventListener("click", async () => {
    const city = cityInput.value;

    if (!city) {
        alert("Enter a city name!");
        return;
    }

    // Fetch weather
    const weatherRes = await fetch(`/api/weather?city=${city}`);
    const weatherData = await weatherRes.json();

    document.getElementById("cityName").textContent = weatherData.location.name;
    document.getElementById("coords").textContent =
        `Lat: ${weatherData.location.lat}, Lon: ${weatherData.location.lon}`;

    document.getElementById("weatherDescription").textContent =
        weatherData.weather.weather[0].description;

    document.getElementById("temp").textContent = weatherData.weather.main.temp;
    document.getElementById("humidity").textContent = weatherData.weather.main.humidity;

    locationCard.classList.remove("hidden");
    weatherCard.classList.remove("hidden");

    // Draw weather chart
    const ctx1 = document.getElementById("weatherChart").getContext("2d");

    if (weatherChart) weatherChart.destroy();

    weatherChart = new Chart(ctx1, {
        type: "bar",
        data: {
            labels: ["Temperature (°C)", "Humidity (%)"],
            datasets: [{
                data: [
                    weatherData.weather.main.temp,
                    weatherData.weather.main.humidity
                ],
                backgroundColor: ["#3b82f6", "#ef4444"]
            }]
        }
    });

    // Fetch AQ
    const lat = weatherData.location.lat;
    const lon = weatherData.location.lon;

    const aqRes = await fetch(`/api/air_quality?lat=${lat}&lon=${lon}`);
    const aqData = await aqRes.json();

    const aqi = aqData.list[0].main.aqi;
    const components = aqData.list[0].components;

    document.getElementById("aqIndex").textContent =
        `AQI: ${aqi} (1 = Good, 5 = Very Poor)`;

    aqCard.classList.remove("hidden");

    const ctx2 = document.getElementById("aqChart").getContext("2d");

    if (aqChart) aqChart.destroy();

    aqChart = new Chart(ctx2, {
        type: "bar",
        data: {
            labels: Object.keys(components),
            datasets: [{
                data: Object.values(components),
                backgroundColor: "#22c55e"
            }]
        }
    });
});