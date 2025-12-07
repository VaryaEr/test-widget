import { ref } from "vue";
import { fetchWeather } from "@/utils/api";
import type { WeatherData } from "@/types/weather";
import type { WidgetConfig, CityLocation } from "@/types/widget";

export function useWeather() {
    const weatherData = ref<Map<string, WeatherData>>(new Map());
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    async function updateWeather(config: WidgetConfig) {
        isLoading.value = true;
        error.value = null;

        try {
            const promises = config.cities.map(async (city: CityLocation) => {
                try {
                    const data = await fetchWeather(city, config.unit);
                    const key = `${city.lat},${city.lon}`;
                    weatherData.value.set(key, data);
                } catch (err) {
                    const key = `${city.lat},${city.lon}`;
                    weatherData.value.delete(key);
                }
            });

            await Promise.all(promises);
        } catch (err) {
            error.value = err instanceof Error ? err.message : "Failed to update weather";
        } finally {
            isLoading.value = false;
        }
    }

    async function updateSingleCity(city: CityLocation, unit: "celsius" | "fahrenheit") {
        try {
            const data = await fetchWeather(city, unit);
            const key = `${city.lat},${city.lon}`;
            weatherData.value.set(key, data);
            return data;
        } catch (err) {
            const key = `${city.lat},${city.lon}`;
            weatherData.value.delete(key);
            throw err;
        }
    }

    function clearWeatherData() {
        weatherData.value.clear();
    }

    function getWeatherForCity(city: CityLocation) {
        const key = `${city.lat},${city.lon}`;
        return weatherData.value.get(key);
    }

    return {
        weatherData,
        isLoading,
        error,
        updateWeather,
        updateSingleCity,
        clearWeatherData,
        getWeatherForCity,
    };
}
