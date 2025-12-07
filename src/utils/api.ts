import axios from "axios";
import type { WeatherApiResponse, WeatherData } from "@/types/weather";
import type { TemperatureUnit, CityLocation } from "@/types/widget";

const API_KEY = process.env.OPENWEATHER_API_KEY || "";

export async function fetchWeather(city: CityLocation, unit: TemperatureUnit = "celsius"): Promise<WeatherData> {
    if (!API_KEY) {
        throw new Error("OpenWeather API key is missing.");
    }

    try {
        const response = await axios.get<WeatherApiResponse>(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                lat: city.lat,
                lon: city.lon,
                appid: API_KEY,
                units: unit === "celsius" ? "metric" : "imperial",
            },
            timeout: 10000,
        });

        const data = response.data;

        if (!data.weather || data.weather.length === 0) {
            throw new Error("No weather information available.");
        }

        return {
            city: city.name,
            country: city.country,
            temp: data.main.temp,
            feels_like: data.main.feels_like,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            wind_speed: data.wind.speed,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            icon_url: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            lat: city.lat,
            lon: city.lon,
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.message;
            throw new Error(`Failed to fetch weather for ${city.name}: ${message}`);
        }
        throw error;
    }
}
