import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function WeatherWidget({ darkMode, lang = 'de' }) {
    const [weather, setWeather] = useState(null);
    const [city, setCity] = useState("Vöcklabruck");

    // Lokale Übersetzungen direkt im Widget für maximale Performance
    const localT = {
        de: { wash: "Waschtag", interior: "Innenreinigung", loc: "Standort" },
        en: { wash: "Washing Day", interior: "Interior Day", loc: "Location" },
        sq: { wash: "Ditë Larje", interior: "Pastrim Brendshëm", loc: "Vendi" }
    };

    const t = localT[lang] || localT.de;

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await fetchWeatherData(latitude, longitude, true);
                },
                async () => {
                    await fetchWeatherData(48.00, 13.65, false);
                }
            );
        } else {
            fetchWeatherData(48.00, 13.65, false);
        }
    }, [lang]);

    async function fetchWeatherData(lat, lon, isAuto) {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await res.json();
            setWeather(data.current_weather);

            if (isAuto) {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const geoData = await geoRes.json();
                setCity(geoData.address.city || geoData.address.town || geoData.address.village || t.loc);
            }
        } catch (err) {
            console.error("Wetter-Ladefehler", err);
        }
    }

    if (!weather) return null;

    // Vollautomatische Wetter-Erkennung
    const getWeatherDetails = (code) => {
        if (code === 0) return { icon: "☀️", label: t.wash };
        if (code <= 3) return { icon: "⛅", label: t.wash };
        if (code <= 48) return { icon: "🌫️", label: t.interior };
        if (code <= 67) return { icon: "🌧️", label: t.interior };
        if (code <= 77) return { icon: "❄️", label: t.interior };
        if (code <= 82) return { icon: "🌦️", label: t.interior };
        if (code <= 99) return { icon: "⛈️", label: t.interior };
        return { icon: "☁️", label: t.interior };
    };

    const { icon, label } = getWeatherDetails(weather.weathercode);
    const isGoodWeather = weather.weathercode <= 3;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 rounded-2xl border backdrop-blur-xl shadow-lg transition-all duration-700 ${darkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-white/30 border-black/5 text-black'
                }`}
        >
            {/* Infos - Auf Mobile leicht kompakter */}
            <div className="flex flex-col items-start sm:items-end leading-tight">
                <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-tighter opacity-50">
                    {city}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-black italic whitespace-nowrap ${isGoodWeather ? 'text-blue-500' : 'text-amber-500'}`}>
                    {label}
                </span>
            </div>

            {/* Icon & Temp */}
            <div className={`flex items-center gap-1.5 border-l pl-2 sm:pl-3 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                <span className="text-sm sm:text-base">{icon}</span>
                <span className="text-[10px] sm:text-xs font-black italic">
                    {Math.round(weather.temperature)}°
                </span>
            </div>
        </motion.div>
    );
}