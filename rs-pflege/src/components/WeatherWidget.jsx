import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function WeatherWidget({ darkMode }) {
    const [weather, setWeather] = useState(null);
    const [city, setCity] = useState("Vöcklabruck"); // Default Name

    useEffect(() => {
        // 1. Geolocation abfragen
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await fetchWeatherData(latitude, longitude, true);
                },
                async () => {
                    // Fallback auf Vöcklabruck bei Ablehnung
                    await fetchWeatherData(48.00, 13.65, false);
                }
            );
        } else {
            fetchWeatherData(48.00, 13.65, false);
        }
    }, []);

    async function fetchWeatherData(lat, lon, isAuto) {
        try {
            // Wetter Daten holen
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await res.json();
            setWeather(data.current_weather);

            // Wenn Standort erlaubt wurde, versuchen wir den Stadtnamen via Reverse-Geocoding zu finden
            if (isAuto) {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const geoData = await geoRes.json();
                setCity(geoData.address.city || geoData.address.town || geoData.address.village || "Mein Standort");
            }
        } catch (err) {
            console.error("Wetter-Ladefehler", err);
        }
    }

    if (!weather) return null;

    const getIcon = (code) => {
        if (code <= 1) return "☀️";
        if (code <= 3) return "⛅";
        if (code >= 51) return "🌧️";
        return "☁️";
    };

    const isGoodForWash = weather.weathercode <= 3;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full border shadow-sm transition-all duration-700 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'
                }`}
        >
            <div className="flex flex-col items-end leading-tight">
                <span className={`text-[9px] font-black uppercase tracking-tighter ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                    {city}
                </span>
                <span className={`text-[10px] font-bold italic ${isGoodForWash ? 'text-blue-500' : 'text-amber-500'}`}>
                    {isGoodForWash ? 'Washing Day' : 'Interior Day'}
                </span>
            </div>

            <div className={`flex items-center gap-1.5 border-l pl-3 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                <span className="text-base leading-none">{getIcon(weather.weathercode)}</span>
                <span className={`text-xs font-black italic ${darkMode ? 'text-white' : 'text-black'}`}>
                    {Math.round(weather.temperature)}°
                </span>
            </div>
        </motion.div>
    );
}