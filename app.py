import os
import requests
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from dotenv import load_dotenv

# Load the .env file so we can use the API key
load_dotenv()

# Read API key from .env
API_KEY = os.getenv("229fe5209bb893d5eb27d2192b432c11")

# Create Flask app
app = Flask(__name__, static_folder="static", template_folder="templates")

# Allow frontend JS to call backend routes
CORS(app)

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/weather")
def get_weather():
    # Read the 'city' parameter from the request
    city = request.args.get("city")

    if not city:
        return jsonify({"error": "City name is required"}), 400

    # STEP 1: Convert city → (lat, lon)
    geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={API_KEY}"
    geo_response = requests.get(geo_url)

    if geo_response.status_code != 200 or not geo_response.json():
        return jsonify({"error": "City not found"}), 404

    geo_data = geo_response.json()[0]
    lat = geo_data["lat"]
    lon = geo_data["lon"]
    name = geo_data["name"]

    # STEP 2: Get current weather for that lat/lon
    weather_url = (
        f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}"
        f"&units=metric&appid={API_KEY}"
    )

    weather_response = requests.get(weather_url)

    if weather_response.status_code != 200:
        return jsonify({"error": "Weather fetch failed"}), 500

    weather_data = weather_response.json()

    return jsonify({
        "location": {"name": name, "lat": lat, "lon": lon},
        "weather": weather_data
    })


@app.route("/api/air_quality")
def air_quality():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if not lat or not lon:
        return jsonify({"error": "lat & lon required"}), 400

    aq_url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}"
    aq_response = requests.get(aq_url)

    if aq_response.status_code != 200:
        return jsonify({"error": "Air quality API failed"}), 500

    return jsonify(aq_response.json())


# Run the server
if __name__ == "__main__":
    app.run(debug=True)