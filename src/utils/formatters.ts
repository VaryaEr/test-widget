import type { TemperatureUnit } from '@/types/widget';

export function formatTemperature(temp: number, unit: TemperatureUnit): string {
  const symbol = unit === 'celsius' ? '°C' : '°F';
  return `${Math.round(temp)}${symbol}`;
}

export function formatWindSpeed(speed: number, unit: TemperatureUnit): string {
  const unitText = unit === 'celsius' ? 'm/s' : 'mph';
  return `${speed.toFixed(1)} ${unitText}`;
}

export function formatPressure(pressure: number): string {
  return `${pressure} hPa`;
}

export function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}