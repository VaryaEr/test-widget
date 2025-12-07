<template>
    <div class="weather-widget">
        <div class="weather-widget__container">
            <div class="weather-widget__header">
                <h2>Weather Widget</h2>
                <button class="weather-widget__gear-btn" @click="isSettingsOpen = !isSettingsOpen"
                    aria-label="Toggle settings">
                    <img src="@/assets/icons/gear.svg" alt="Settings" class="weather-widget__gear-icon" />
                </button>
            </div>

            <div v-if="isLoadingGeolocation && config.cities.length === 0" class="weather-widget__loading">
                <div class="weather-widget__loading-spinner"></div>
                <p>Detecting your location...</p>
            </div>

            <div v-else-if="geolocationError && config.cities.length === 0" class="weather-widget__geolocation-error">
                <p>{{ geolocationError }}</p>
                <button class="weather-widget__retry-btn" @click="retryGeolocation">
                    Try Again
                </button>
                <p class="weather-widget__geolocation-hint">
                    Or add cities manually in settings
                </p>
            </div>

            <template v-else>
                <div v-if="!isSettingsOpen" class="weather-widget__cards">
                    <div v-if="weatherError" class="weather-widget__error">
                        <p>{{ weatherError }}</p>
                        <button class="weather-widget__retry-btn" @click="updateWeather(config)">
                            Retry
                        </button>
                    </div>

                    <div v-else-if="weatherData.size === 0 && config.cities.length > 0"
                        class="weather-widget__loading-cards">
                        <div class="weather-widget__loading-spinner"></div>
                        <p>Loading weather data...</p>
                    </div>

                    <div v-else-if="weatherData.size === 0" class="weather-widget__empty">
                        No cities added. Open settings to add your first city.
                    </div>

                    <WeatherCard v-for="city in config.cities" :key="`${city.lat},${city.lon}`" :city="city.name"
                        :temp="weatherData.get(`${city.lat},${city.lon}`)?.temp || 0" :unit="config.unit"
                        :icon-url="weatherData.get(`${city.lat},${city.lon}`)?.icon_url || ''"
                        :description="weatherData.get(`${city.lat},${city.lon}`)?.description || ''" />
                </div>

                <SettingsPanel v-else :cities="config.cities" :unit="config.unit" :api-key="apiKey"
                    @close="isSettingsOpen = false" @remove-city="handleRemoveCity" @add-city="handleAddCity"
                    @change-unit="handleChangeUnit" @reorder-cities="handleReorderCities" />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import WeatherCard from './components/WeatherCard.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import { useLocalStorage } from './composables/useLocalStorage';
import { useWeather } from './composables/useWeather';
import { useGeolocation } from './composables/useGeolocation';
import type { CityLocation } from '@/types/widget';

const props = defineProps<{
    apiKey: string;
}>();

const { config, loadConfig, saveConfig, addCity, removeCity, reorderCities, changeUnit } = useLocalStorage();
const { weatherData, error: weatherError, updateWeather } = useWeather();
const { getUserCity, isLoading: isLoadingGeolocation, error: geolocationError } = useGeolocation();

const isSettingsOpen = ref(false);

async function initializeWidget() {
    loadConfig();

    if (config.value.cities.length === 0) {
        const userCity = await getUserCity();
        if (userCity) {
            addCity(userCity);
            saveConfig();
        }
    }

    if (config.value.cities.length > 0) {
        await updateWeather(config.value);
    }
}

async function retryGeolocation() {
    const userCity = await getUserCity();
    if (userCity) {
        addCity(userCity);
        saveConfig();
        await updateWeather(config.value);
    }
}

onMounted(() => {
    initializeWidget();
});

onBeforeUnmount(() => {
    saveConfig();
});

if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        saveConfig();
    });
}

function handleRemoveCity(city: CityLocation) {
    removeCity(city);
    saveConfig();
    updateWeather(config.value);
}

function handleAddCity(city: CityLocation) {
    addCity(city);
    saveConfig();
    updateWeather(config.value);
}

function handleChangeUnit(unit: 'celsius' | 'fahrenheit') {
    changeUnit(unit);
    saveConfig();
    updateWeather(config.value);
}

function handleReorderCities(fromIndex: number, toIndex: number) {
    reorderCities(fromIndex, toIndex);
    saveConfig();
}
</script>

<style lang="scss" scoped>
.weather-widget {
    width: 100%;
    padding: 40px 0;

    &__container {
        width: 100%;
        max-width: $container-width;
        margin: 0 auto;
        padding: 0 $container-padding;
    }

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $space-lg;
    }

    h2 {
        margin: 0;
        color: $color-dark;
        font-size: $font-large;
    }

    &__gear-btn {
        background: none;
        border: none;
        padding: $space-half;
        border-radius: $radius;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            background: $color-border;
        }
    }

    &__gear-icon {
        width: $font-large;
        height: $font-large;
        color: $color-gray;
    }

    &__cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: $space;
    }

    &__empty {
        grid-column: 1 / -1;
        text-align: center;
        padding: $space-lg;
        color: $color-gray;
        font-style: italic;
    }

    &__loading {
        text-align: center;
        padding: $space-xl;
        color: $color-gray;
    }

    &__loading-spinner {
        width: 40px;
        height: 40px;
        margin: 0 auto $space;
        border: 3px solid $color-border;
        border-top-color: $color-blue;
        border-radius: 50%;
        animation: weather-widget-spin 1s linear infinite;
    }

    &__loading-cards {
        grid-column: 1 / -1;
        text-align: center;
        padding: $space-xl;
    }

    &__geolocation-error {
        text-align: center;
        padding: $space-lg;
        background: $color-warning-bg;
        border: 1px solid $color-warning-border;
        border-radius: $radius;
        color: $color-warning-text;
        margin-bottom: $space;
    }

    &__error {
        text-align: center;
        padding: $space-lg;
        background: rgba($color-red, 0.1);
        border: 1px solid rgba($color-red, 0.3);
        border-radius: $radius;
        color: $color-red;
        margin-bottom: $space;
        grid-column: 1 / -1;
    }

    &__retry-btn {
        display: inline-block;
        margin: $space-half auto;
        padding: $space-half $space;
        background: $color-blue;
        color: $color-white;
        border: none;
        border-radius: $radius;
        cursor: pointer;

        &:hover {
            background: $color-blue-dark;
        }
    }

    &__geolocation-hint {
        margin-top: $space-half;
        font-size: $font-small;
        color: $color-gray;
    }
}

@keyframes weather-widget-spin {
    to {
        transform: rotate(360deg);
    }
}
</style>