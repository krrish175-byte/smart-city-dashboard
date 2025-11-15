SmartCity Dashboard is a real-time urban intelligence platform that brings together weather, air quality, traffic flow, energy usage, and geospatial insights into a single interactive interface.

The goal is to give city authorities, students, and researchers a unified, live-updating view of city health, using open datasets and modern web technologies.

The project uses:
	•	Real-time environmental & traffic APIs
	•	Heatmaps layered on dynamic city maps
	•	Interactive charts
	•	Auto-refreshing metrics
	•	Smooth UI/UX with dark/light mode

It is lightweight, modular, and built completely on the frontend.


Key Features

Live Weather Monitoring
	•	Temperature, humidity, wind speed
	•	Live condition icons/descriptions
	•	Powered by OpenWeather API

Air Quality Index (AQI)
	•	Real-time AQI value
	•	Category classification (Good → Very Poor)
	•	AQI history (7-day trend)
	•	Pollution breakdown (PM2.5, PM10, NO₂)
	•	Powered by OpenAQ API

Traffic Congestion Analytics
	•	Live traffic speed
	•	Congestion % computation
	•	Traffic intensity heatmap
	•	Powered by TomTom Traffic API

Energy Consumption
	•	City-wise MW consumption
	•	Dynamic “Low / Medium / High” classification

Interactive City Map
	•	Leaflet.js based
	•	Live AQI + traffic + precipitation overlays
	•	Auto-centered markers with pulse animation
	•	Dark/light tile switching

Pollution Trend Chart
	•	7-day PM2.5, PM10, NO₂ trend
	•	Chart.js line visualisation

Dark / Light Theme
	•	System-like smooth toggling
	•	Saves preference in localStorage

Auto-Refresh
	•	Refreshes all metrics every 30 seconds
	•	Ensures dashboard is always live

⸻

Tech Stack

Frontend
	•	HTML5, CSS3 (modern UI with gradients, shadows, animations)
	•	JavaScript (modular architecture, async/await)
	•	Chart.js (visual analytics)
	•	Leaflet.js (maps)
	•	Leaflet.heat (heatmaps)

APIS:

Weather-
OpenWeather – Current Weather endpoint
AQI-
OpenAQ API (public, no key)
Traffic-
TomTom Traffic Flow API

project/
│── index.html        # Main UI layout + CSS
│── h1.js             # Core logic, API calls, map updates, chart updates
│── README.md         # Documentation
│── /assets           # (optional) icons, screenshots

Limitations
	•	Some API endpoints (like OpenWeather OneCall) require a paid plan.
        We only use free endpoints to avoid 401 errors.
	•	OpenAQ data availability varies by city.
	•	TomTom Traffic API rate limits heavy requests.
	•	Heatmaps depend on a minimum dataset volume.

Future Improvements
	•	Add Waste Management metrics using municipal datasets
	•	Add Public Transport Utilization graphs
	•	Add Electric Vehicle charging analytics
	•	Add Population density heatmaps
	•	Add Predictive models (ML) using AQI & weather

	
Conclusion

SmartCity Dashboard delivers a complete real-time urban monitoring interface, integrating multi-source datasets into a clean, modern, animated dashboard.

It is lightweight, scalable, API-driven, and highly extensible — perfect for hackathons, research, and smart city demos.

