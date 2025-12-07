<template>
    <div class="weather-card">
        <div class="weather-card__city">{{ city }}</div>
        <div class="weather-card__temp">{{ formatTemperature(temp, unit) }}</div>
        <img v-if="iconUrl" :src="iconUrl" :alt="description" class="weather-card__icon" />
        <div class="weather-card__description">{{ capitalizeFirstLetter(description) }}</div>
    </div>
</template>

<script setup lang="ts">
import { formatTemperature, capitalizeFirstLetter } from '@/utils/formatters';
import type { TemperatureUnit } from '@/types/widget';

defineProps<{
    city: string;
    temp: number;
    unit: TemperatureUnit;
    iconUrl: string;
    description: string;
}>();
</script>

<style lang="scss" scoped>
.weather-card {
    background: $color-white;
    border-radius: $radius;
    padding: $space;
    box-shadow: $shadow;
    text-align: center;
    transition: transform $transition;

    &:hover {
        transform: translateY(-4px);
    }

    &__city {
        font-size: $font-medium;
        font-weight: bold;
        color: $color-dark;
        margin-bottom: $space-half;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__temp {
        font-size: $font-xlarge;
        color: $color-blue;
        font-weight: bold;
        margin-bottom: $space-half;
    }

    &__icon {
        width: 60px;
        height: 60px;
        margin: 0 auto $space-half;
    }

    &__description {
        font-size: $font-small;
        color: $color-gray;
        text-transform: capitalize;
    }
}
</style>