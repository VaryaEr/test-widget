import { ref } from "vue";
import type { CityLocation } from "@/types/widget";

export function useGeolocation() {
    const userCity = ref<CityLocation | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const permissionDenied = ref(false);

    const isGeolocationAvailable = () => {
        return typeof window !== "undefined" && "geolocation" in navigator;
    };

    async function getUserCity(): Promise<CityLocation | null> {
        if (typeof window === "undefined") {
            error.value = "Geolocation is only available in browser";
            return null;
        }

        if (!isGeolocationAvailable()) {
            error.value = "Geolocation is not supported by your browser";
            return null;
        }

        isLoading.value = true;
        error.value = null;
        permissionDenied.value = false;

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        const apiKey = process.env.OPENWEATHER_API_KEY || "";

                        if (!apiKey) {
                            throw new Error("OpenWeather API key is missing");
                        }

                        const response = await fetch(
                            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`,
                        );

                        if (!response.ok) {
                            throw new Error(`Failed to get city from coordinates: ${response.status}`);
                        }

                        const data = await response.json();

                        if (!data || data.length === 0) {
                            throw new Error("No location found for these coordinates");
                        }

                        const location = data[0];

                        const cityLocation: CityLocation = {
                            name: location.name,
                            country: location.country,
                            state: location.state,
                            lat: lat,
                            lon: lon,
                        };

                        userCity.value = cityLocation;
                        resolve(cityLocation);
                    } catch (err) {
                        const errorMessage = err instanceof Error ? err.message : "Failed to get city from coordinates";
                        error.value = errorMessage;
                        resolve(null);
                    } finally {
                        isLoading.value = false;
                    }
                },
                (err) => {
                    error.value =
                        "Location access denied. Please allow location access or add cities manually in settings.";
                    permissionDenied.value = true;
                    isLoading.value = false;
                    resolve(null);
                },
                {
                    timeout: 10000,
                    maximumAge: 600000,
                    enableHighAccuracy: true,
                },
            );
        });
    }

    function resetPermissionState() {
        permissionDenied.value = false;
        error.value = null;
    }

    return {
        userCity,
        isLoading,
        error,
        permissionDenied,
        isGeolocationAvailable,
        getUserCity,
        resetPermissionState,
    };
}
