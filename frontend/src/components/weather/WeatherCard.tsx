import { CloudSun, Droplets, Thermometer, Wind } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  icon: string;
}

export function WeatherCard({ weather }: { weather: WeatherData }) {
  return (
    <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 dark:from-blue-500/15 dark:to-indigo-500/5">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
        <CloudSun className="w-4 h-4" />
        Match Day Weather
      </h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-primary dark:text-white">{weather.temperature}°C</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{weather.condition}</p>
        </div>
        <div className="text-right space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 justify-end">
            <Wind className="w-3.5 h-3.5" /> 12 km/h
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 justify-end">
            <Droplets className="w-3.5 h-3.5" /> {weather.humidity}%
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 justify-end">
            <Thermometer className="w-3.5 h-3.5" /> Feels 30°
          </p>
        </div>
      </div>
    </Card>
  );
}