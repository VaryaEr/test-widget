import { ref, watch } from "vue";
import type { WidgetConfig, CityLocation } from "@/types/widget";

const STORAGE_KEY = "weather-widget-config";

export function useLocalStorage() {
    const config = ref<WidgetConfig>({
        cities: [],
        unit: "celsius",
    });

    const loadConfig = () => {
        if (typeof window === "undefined" || !window.localStorage) {
            return;
        }

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return;
        }

        try {
            const parsed = JSON.parse(saved);

            if (parsed.cities && Array.isArray(parsed.cities)) {
                config.value.cities = parsed.cities.filter(
                    (city: any) =>
                        city &&
                        typeof city === "object" &&
                        city.name &&
                        typeof city.name === "string" &&
                        city.name.trim() !== "" &&
                        city.country &&
                        typeof city.country === "string" &&
                        city.country.trim() !== "" &&
                        typeof city.lat === "number" &&
                        typeof city.lon === "number",
                );
            }

            if (parsed.unit === "celsius" || parsed.unit === "fahrenheit") {
                config.value.unit = parsed.unit;
            }
        } catch (error) {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    let saveTimeout: NodeJS.Timeout | null = null;

    const saveConfig = () => {
        if (typeof window === "undefined" || !window.localStorage) {
            return;
        }

        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }

        saveTimeout = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value));
            } catch (error) {
                console.error(error);
            }
        }, 300);
    };

    const saveConfigImmediate = () => {
        if (typeof window === "undefined" || !window.localStorage) {
            return;
        }

        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value));
        } catch (error) {
            console.error(error);
        }
    };

    const addCity = (city: CityLocation) => {
        if (!city || !city.name || !city.country || typeof city.lat !== "number" || typeof city.lon !== "number") {
            console.error(city);
            return;
        }

        if (!config.value.cities.some((c) => c.lat === city.lat && c.lon === city.lon)) {
            config.value.cities.push(city);
        }
    };

    const removeCity = (city: CityLocation) => {
        config.value.cities = config.value.cities.filter((c) => c.lat !== city.lat || c.lon !== city.lon);
    };

    const reorderCities = (fromIndex: number, toIndex: number) => {
        const [movedCity] = config.value.cities.splice(fromIndex, 1);
        config.value.cities.splice(toIndex, 0, movedCity);
    };

    const changeUnit = (unit: "celsius" | "fahrenheit") => {
        config.value.unit = unit;
    };

    watch(config, saveConfig, { deep: true });

    return {
        config,
        loadConfig,
        saveConfig: saveConfigImmediate,
        addCity,
        removeCity,
        reorderCities,
        changeUnit,
    };
}
