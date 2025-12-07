export type TemperatureUnit = "celsius" | "fahrenheit";

export interface CityLocation {
    name: string;
    country: string;
    state?: string;
    lat: number;
    lon: number;
}

export interface WidgetConfig {
    cities: CityLocation[];
    unit: TemperatureUnit;
}

export interface DragState {
    isDragging: boolean;
    draggedIndex: number | null;
}
