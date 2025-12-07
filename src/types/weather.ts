export interface WeatherApiResponse {
    weather: Array<{
        description: string;
        icon: string;
    }>;
    main: {
        temp: number;
        feels_like: number;
        humidity: number;
        pressure: number;
    };
    wind: {
        speed: number;
    };
    sys: {
        country: string;
    };
    name: string;
}

export interface WeatherData {
    city: string;
    country: string;
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    description: string;
    icon: string;
    icon_url: string;
    lat?: number;
    lon?: number;
}
