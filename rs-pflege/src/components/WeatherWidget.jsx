import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from './useLocation';

const sf = { fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif' };

export default function WeatherWidget({ darkMode, lang = 'de' }) {
    const [weather, setWeather] = useState(null);
    const { coords, city, loading } = useLocation();

    const localT = {
        de: { wash: 'Waschtag', interior: 'Innenreinigung', loc: 'Standort' },
        en: { wash: 'Washing Day', interior: 'Interior Day', loc: 'Location' },
        sq: { wash: 'Ditë Larje', interior: 'Pastrim Brendshëm', loc: 'Vendi' }
    };
    const t = localT[lang] || localT.de;

    useEffect(() => {
        if (!coords) return;
        const { lat, lon } = coords;
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
            .then(r => r.json())
            .then(d => setWeather(d.current_weather))
            .catch(() => {});
    }, [coords?.lat, coords?.lon]);

    if (loading || !weather) return null;

    const getWeatherInfo = (code) => {
        if (code === 0)  return { emoji: '☀️', label: t.wash,     good: true  };
        if (code <= 3)   return { emoji: '⛅',  label: t.wash,     good: true  };
        if (code <= 48)  return { emoji: '🌫️', label: t.interior, good: false };
        if (code <= 67)  return { emoji: '🌧️', label: t.interior, good: false };
        if (code <= 77)  return { emoji: '❄️',  label: t.interior, good: false };
        return               { emoji: '⛈️',  label: t.interior, good: false };
    };

    const { emoji, label, good } = getWeatherInfo(weather.weathercode);

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full border transition-all duration-300 ${
                darkMode
                    ? 'bg-black/40 border-white/[0.10] text-white'
                    : 'bg-white/70 border-black/[0.08] text-[#1d1d1f]'
            }`}
            style={{ backdropFilter: 'blur(24px) saturate(180%)', ...sf }}
        >
            <span className="text-[15px]">{emoji}</span>
            <div className={`w-[0.5px] h-4 ${darkMode ? 'bg-white/15' : 'bg-black/12'}`} />
            <div className="flex flex-col">
                <span className={`text-[11px] font-medium leading-tight ${darkMode ? 'text-white/40' : 'text-black/35'}`}>
                    {city}
                </span>
                <span className={`text-[11px] font-semibold leading-tight ${good ? 'text-[#0A84FF]' : 'text-[#FF9F0A]'}`}>
                    {Math.round(weather.temperature)}° · {label}
                </span>
            </div>
        </motion.div>
    );
}