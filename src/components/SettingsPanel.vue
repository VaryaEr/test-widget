<template>
    <div class="settings-panel">
        <div class="settings-panel__header">
            <h3>Settings</h3>
            <button class="settings-panel__close-btn" @click="$emit('close')" aria-label="Close settings">
                <img src="@/assets/icons/close.svg" alt="Close" class="settings-panel__close-icon" />
            </button>
        </div>

        <div class="settings-panel__section">
            <h4>Manage Cities</h4>

            <LocationSearch :api-key="apiKey" @select="onCitySelect" class="settings-panel__search" />

            <div class="settings-panel__cities" :class="{ 'settings-panel__cities--dragging': isDragging }">
                <div v-for="(city, index) in cities" :key="`${city.lat},${city.lon}`" class="settings-panel__city-item"
                    draggable="true" @dragstart="onDragStart($event, index)"
                    @dragover.prevent="onDragOver($event, index)" @drop="onDrop($event, index)" @dragend="onDragEnd"
                    :class="{
                        'settings-panel__city-item--dragging': draggedIndex === index,
                        'settings-panel__city-item--drag-over': dragOverIndex === index && draggedIndex !== index
                    }">
                    <img src="@/assets/icons/hamburger.svg" alt="Drag" class="settings-panel__drag-icon" />
                    <span class="settings-panel__city-name">{{ city.name }}{{ city.state ? `, ${city.state}` : '' }}, {{
                        city.country }}</span>
                    <button class="settings-panel__remove-btn" @click="$emit('remove-city', city)"
                        aria-label="Remove city">
                        <img src="@/assets/icons/close.svg" alt="Remove" class="settings-panel__remove-icon" />
                    </button>
                </div>
            </div>

            <div v-if="cities.length > 1" class="settings-panel__drag-hint">
                <img src="@/assets/icons/hamburger.svg" alt="Drag hint" class="settings-panel__drag-hint-icon" />
                <span class="settings-panel__drag-hint-text">Drag and drop to reorder cities</span>
            </div>
        </div>

        <div class="settings-panel__section">
            <h4>Units</h4>
            <div class="settings-panel__units">
                <button class="settings-panel__unit-btn"
                    :class="{ 'settings-panel__unit-btn--active': unit === 'celsius' }"
                    @click="$emit('change-unit', 'celsius')">
                    °C
                </button>
                <button class="settings-panel__unit-btn"
                    :class="{ 'settings-panel__unit-btn--active': unit === 'fahrenheit' }"
                    @click="$emit('change-unit', 'fahrenheit')">
                    °F
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LocationSearch from './LocationSearch.vue';
import type { TemperatureUnit, CityLocation } from '@/types/widget';

const props = defineProps<{
    cities: CityLocation[];
    unit: TemperatureUnit;
    apiKey: string;
}>();

const emit = defineEmits<{
    'close': [];
    'remove-city': [city: CityLocation];
    'add-city': [city: CityLocation];
    'change-unit': [unit: TemperatureUnit];
    'reorder-cities': [fromIndex: number, toIndex: number];
}>();

let draggedIndex = ref<number | null>(null);
let dragOverIndex = ref<number | null>(null);
let isDragging = ref(false);

function onCitySelect(city: CityLocation) {
    emit('add-city', city);
}

function onDragStart(event: DragEvent, index: number) {
    draggedIndex.value = index;
    isDragging.value = true;

    const dataTransfer = event.dataTransfer;
    if (dataTransfer) {
        dataTransfer.setData('text/plain', index.toString());
        dataTransfer.effectAllowed = 'move';

        const dragImage = event.target as HTMLElement;
        if (dragImage) {
            dataTransfer.setDragImage(dragImage, event.offsetX, event.offsetY);
        }
    }
}

function onDragOver(event: DragEvent, index: number) {
    event.preventDefault();

    if (draggedIndex.value === null || draggedIndex.value === index) {
        dragOverIndex.value = null;
        return;
    }

    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
    }

    dragOverIndex.value = index;
}

function onDrop(event: DragEvent, index: number) {
    event.preventDefault();

    if (draggedIndex.value !== null && draggedIndex.value !== index) {
        emit('reorder-cities', draggedIndex.value, index);
    }

    resetDragState();
}

function onDragEnd() {
    resetDragState();
}

function resetDragState() {
    draggedIndex.value = null;
    dragOverIndex.value = null;
    isDragging.value = false;
}
</script>

<style lang="scss" scoped>
.settings-panel {
    background: $color-white;
    border-radius: $radius;
    padding: $space;
    box-shadow: $shadow;
    max-width: 400px;
    margin: 0 auto;

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $space-lg;
        padding-bottom: $space;
        border-bottom: 1px solid $color-border;

        h3 {
            margin: 0;
            color: $color-dark;
            font-size: $font-large;
        }
    }

    &__close-btn {
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

    &__close-icon {
        width: $font-large;
        height: $font-large;
        color: $color-gray;
    }

    &__section {
        margin-bottom: $space-lg;

        h4 {
            margin: 0 0 $space 0;
            color: $color-dark;
            font-size: $font-medium;
        }
    }

    &__search {
        margin-bottom: $space;
    }

    &__cities {
        margin-bottom: $space;

        &--dragging {
            .settings-panel__city-item:not(.settings-panel__city-item--dragging) {
                transition: transform $transition;
            }
        }
    }

    &__city-item {
        display: flex;
        align-items: center;
        padding: $space-half $space;
        background: $color-border;
        border-radius: $radius;
        margin-bottom: $space-half;
        cursor: move;
        transition: all $transition;
        position: relative;

        &:hover {
            background: $color-gray-hover;

            .settings-panel__drag-icon {
                opacity: 1;
            }
        }

        &--dragging {
            opacity: 0.5;
            background: $color-blue;
            color: $color-white;
            z-index: 10;

            .settings-panel__city-name,
            .settings-panel__drag-icon {
                color: $color-white;
            }
        }

        &--drag-over {
            border-left: 3px solid $color-blue;
            padding-left: calc(#{$space} - 1px);
            background: $color-blue-light;

            &::before {
                content: '';
                position: absolute;
                left: -8px;
                top: 50%;
                transform: translateY(-50%);
                width: 4px;
                height: 4px;
                background: $color-blue;
                border-radius: 50%;
            }
        }
    }

    &__drag-icon {
        width: $font-medium;
        height: $font-medium;
        color: $color-gray;
        margin-right: $space;
        cursor: grab;
        opacity: 0.7;
        transition: opacity $transition;

        &:active {
            cursor: grabbing;
        }
    }

    &__city-name {
        flex: 1;
        color: $color-dark;
        transition: color $transition;
        font-size: $font-small;
    }

    &__remove-btn {
        background: none;
        border: none;
        padding: $space-half;
        border-radius: $radius;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            background: $color-red-light;
        }
    }

    &__remove-icon {
        width: $font-medium;
        height: $font-medium;
        color: $color-red;
    }

    &__drag-hint {
        display: flex;
        align-items: center;
        gap: $space-half;
        padding: $space-half;
        background: $color-blue-light;
        border-radius: $radius;
        margin-top: $space;
    }

    &__drag-hint-icon {
        width: $font-small;
        height: $font-small;
        color: $color-blue;
    }

    &__drag-hint-text {
        font-size: $font-small;
        color: $color-blue-dark;
    }

    &__units {
        display: flex;
        gap: $space;
    }

    &__unit-btn {
        padding: $space-half $space;
        background: $color-border;
        color: $color-dark;
        border: 2px solid transparent;
        border-radius: $radius;
        font-size: $font-medium;
        font-weight: bold;

        &--active {
            background: $color-blue;
            color: $color-white;
            border-color: $color-blue;
        }

        &:hover:not(&--active) {
            background: $color-gray-light;
        }
    }
}
</style>