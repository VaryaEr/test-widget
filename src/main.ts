import { createApp } from "vue";
import WeatherWidget from "./WeatherWidget.vue";
import "./assets/scss/main.scss";

const API_KEY = process.env.OPENWEATHER_API_KEY || "";

function initWeatherWidget() {
    const widgetElements = document.querySelectorAll("weather-widget");

    if (widgetElements.length === 0) {
        const container = document.createElement("div");
        container.id = "weather-widget-container";
        document.body.appendChild(container);
        mountWidget(container);
    } else {
        widgetElements.forEach((element) => {
            mountWidget(element);
        });
    }
}

function mountWidget(container: Element) {
    const app = createApp(WeatherWidget, {
        apiKey: API_KEY,
    });

    app.mount(container);
}

export { initWeatherWidget };

if (typeof window !== "undefined" && typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initWeatherWidget);
    } else {
        initWeatherWidget();
    }
}

export default initWeatherWidget;
