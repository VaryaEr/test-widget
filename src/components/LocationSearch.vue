<template>
    <div class="location-search">
        <div class="location-search__input-group">
            <input v-model="searchQuery" type="text" placeholder="Enter city name..." class="location-search__input"
                @input="handleInput" @keyup.enter="performSearch" @focus="onFocus" @blur="onBlur" ref="searchInput" />
            <button class="location-search__btn" @click="performSearch" :disabled="isSearching || !searchQuery.trim()"
                :aria-label="isSearching ? 'Searching...' : 'Search'">
                <img v-if="isSearching" src="@/assets/icons/loading.svg" alt="Loading"
                    class="location-search__loading-icon" />
                <span v-else>Search</span>
            </button>
        </div>

        <div v-if="showResults && searchResults.length > 0" class="location-search__results">
            <div v-for="result in searchResults" :key="`${result.lat},${result.lon}`"
                class="location-search__result-item" @mousedown.prevent="selectCity(result)"
                @keyup.enter="selectCity(result)" tabindex="0" role="button"
                :aria-label="`Select ${result.name}, ${result.country}`">
                <div class="location-search__result-main">
                    <span class="location-search__result-name">{{ result.name }}</span>
                    <span v-if="result.state" class="location-search__result-state">{{ result.state }}</span>
                </div>
                <span class="location-search__result-country">{{ result.country }}</span>
            </div>
        </div>

        <div v-if="error" class="location-search__error" role="alert">
            <img src="@/assets/icons/error.svg" alt="Error" class="location-search__error-icon" />
            {{ error }}
        </div>

        <div v-if="message && !error" class="location-search__message">
            {{ message }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import type { CityLocation } from '@/types/widget';

interface SearchResult {
    name: string;
    country: string;
    state?: string;
    lat: number;
    lon: number;
}

const props = defineProps<{
    apiKey: string;
}>();

const emit = defineEmits<{
    'select': [city: CityLocation];
}>();

const searchQuery = ref('');
const searchResults = ref<SearchResult[]>([]);
const isSearching = ref(false);
const error = ref('');
const message = ref('');
const hasSearched = ref(false);
const showResults = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);

let searchTimeout: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 500;

function handleInput() {
    clearTimeout(searchTimeout as NodeJS.Timeout);

    if (!searchQuery.value.trim()) {
        searchResults.value = [];
        error.value = '';
        message.value = '';
        hasSearched.value = false;
        showResults.value = false;
        return;
    }

    error.value = '';
    message.value = '';

    searchTimeout = setTimeout(() => {
        performSearch();
    }, DEBOUNCE_DELAY);
}

async function performSearch() {
    const query = searchQuery.value.trim();
    if (!query) {
        error.value = 'Please enter a city name';
        return;
    }

    if (searchResults.value.length > 0 && !showResults.value) {
        showResults.value = true;
        return;
    }

    isSearching.value = true;
    error.value = '';
    message.value = '';
    searchResults.value = [];
    hasSearched.value = true;
    showResults.value = false;

    try {
        const response = await axios.get(
            `https://api.openweathermap.org/geo/1.0/direct`,
            {
                params: {
                    q: query,
                    limit: 5,
                    appid: props.apiKey,
                },
            }
        );

        if (response.data.length === 0) {
            message.value = 'No cities found. Try a different name.';
            return;
        }

        searchResults.value = response.data.map((item: any) => ({
            name: item.name,
            country: item.country,
            state: item.state,
            lat: item.lat,
            lon: item.lon,
        }));

        showResults.value = true;
        message.value = '';
    } catch (err: any) {
        error.value = err.response?.data?.message || 'Failed to search cities';
    } finally {
        isSearching.value = false;
    }
}

function selectCity(city: SearchResult) {
    const cityLocation: CityLocation = {
        name: city.name,
        country: city.country,
        state: city.state,
        lat: city.lat,
        lon: city.lon,
    };

    emit('select', cityLocation);
    searchQuery.value = '';
    searchResults.value = [];
    showResults.value = false;
    message.value = `Added ${city.name}`;
    hasSearched.value = false;

    setTimeout(() => {
        message.value = '';
    }, 3000);
}

function onFocus() {
    if (searchResults.value.length > 0) {
        showResults.value = true;
    }
}

function onBlur() {
    setTimeout(() => {
        showResults.value = false;
    }, 200);
}

onMounted(() => {
    if (searchInput.value) {
        searchInput.value.focus();
    }
});

onUnmounted(() => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
});
</script>

<style lang="scss" scoped>
.location-search {
    width: 100%;
    margin-bottom: $space-lg;
    position: relative;

    &__input-group {
        display: flex;
        gap: $space-half;
        margin-bottom: $space;
    }

    &__input {
        flex: 1;
        padding: $space-half $space;
        border: 1px solid $color-border;
        border-radius: $radius;
        font-size: $font-normal;
        transition: border-color $transition;

        &:focus {
            outline: none;
            border-color: $color-blue;
            box-shadow: 0 0 0 2px rgba($color-blue, 0.2);
        }

        &:disabled {
            background: $color-border;
            cursor: not-allowed;
        }
    }

    &__btn {
        padding: $space-half $space;
        background: $color-blue;
        color: $color-white;
        border: none;
        border-radius: $radius;
        font-size: $font-normal;
        white-space: nowrap;
        min-width: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color $transition;

        &:hover:not(:disabled) {
            background: $color-blue-dark;
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }

    &__loading-icon {
        width: $font-normal;
        height: $font-normal;
        animation: location-search-spin 1s linear infinite;
    }

    &__results {
        border: 1px solid $color-border;
        border-radius: $radius;
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: $space;
        background: $color-white;
        box-shadow: $shadow;
        position: absolute;
        width: 100%;
        z-index: 1000;
    }

    &__result-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: $space-half $space;
        border-bottom: 1px solid $color-border;
        cursor: pointer;
        transition: background-color $transition;

        &:last-child {
            border-bottom: none;
        }

        &:hover,
        &:focus {
            background: $color-border;
            outline: none;
        }

        &:active {
            background: $color-gray-hover;
        }
    }

    &__result-main {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    &__result-name {
        font-weight: 500;
        color: $color-dark;
    }

    &__result-state {
        font-size: $font-small;
        color: $color-gray;
    }

    &__result-country {
        font-size: $font-small;
        color: $color-gray;
        background: $color-border;
        padding: 2px 6px;
        border-radius: 4px;
        white-space: nowrap;
    }

    &__error {
        color: $color-red;
        font-size: $font-small;
        padding: $space-half;
        background: rgba($color-red, 0.1);
        border-radius: $radius;
        margin-bottom: $space;
        display: flex;
        align-items: center;
        gap: $space-half;
    }

    &__error-icon {
        width: $font-small;
        height: $font-small;
    }

    &__message {
        color: $color-blue;
        font-size: $font-small;
        padding: $space-half;
        background: $color-blue-light;
        border-radius: $radius;
        margin-bottom: $space;
    }
}

@keyframes location-search-spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>