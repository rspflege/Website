import { useState, useRef, useEffect } from 'react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from './useLocation';

// ── Basisstandort (XOR-verschlüsselt — kein Klartext im Bundle) ───────────────
// Koordinaten nur als Byte-Array gespeichert — Adresse ist nirgendwo lesbar
const _K = 0x4f;
const _La = [0x7f,0x13,0x08,0x1f,0x7f,0x1e,0x03,0x1a,0x7f,0x1b]; // lat bytes
const _Lo = [0x7b,0x18,0x0b,0x1c,0x79,0x15,0x00,0x1f,0x7d,0x1e]; // lon bytes
const _BASE = (() => {
    const d = a => parseFloat(a.map(b => String.fromCharCode(b ^ _K)).join(''));
    return { lat: d(_La), lon: d(_Lo) };
})();

// ── Fahrtkosten-Kalkulation ───────────────────────────────────────────────────
// Diesel · 5.8L/100km · 57L Tank · Hin+Rück · +30% Aufschlag
const FUEL_L_PER_100KM = 5.8;
const FUEL_TANK_L      = 57;
const FUEL_FALLBACK    = 1.45;   // €/L Fallback Diesel AT
const OVERHEAD_FACTOR  = 1.30;
const FREE_KM          = 3;

const PRICE_CACHE_KEY = 'at_diesel_price_cache';
const PRICE_CACHE_TTL = 60 * 60 * 1000; // 1 Stunde

// Hook: aktueller Diesel-Preis AT (E-Control API) mit Fallback-Kette
function useAustrianFuelPrice() {
    const [price,   setPrice]   = useState(FUEL_FALLBACK);
    const [source,  setSource]  = useState('fallback');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            // 1) Cache prüfen
            try {
                const cached = JSON.parse(localStorage.getItem(PRICE_CACHE_KEY) || 'null');
                if (cached && typeof cached.price === 'number' && !isNaN(cached.price) && Date.now() - cached.ts < PRICE_CACHE_TTL) {
                    if (!cancelled) { setPrice(cached.price); setSource('cache'); setLoading(false); }
                }
            } catch {}

            // 2) E-Control API — Diesel (DIE)
            const API = 'https://api.e-control.at/sprit/1.0/search/gas-stations/by-region?regionType=BL&regionCode=99&fuelType=DIE&includeClosed=false';
            const PROXIES = [
                u => u,
                u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
                u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
                u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
            ];

            for (const proxy of PROXIES) {
                try {
                    const res = await fetch(proxy(API), {
                        headers: { 'Accept': 'application/json' },
                        signal: AbortSignal.timeout(8000),
                    });
                    if (!res.ok) continue;
                    const data = await res.json();
                    const amounts = (Array.isArray(data) ? data : [])
                        .flatMap(s => s.prices || [])
                        .filter(p => p.fuelType === 'DIE' && typeof p.amount === 'number' && p.amount > 0.5 && p.amount < 4)
                        .map(p => p.amount);
                    if (amounts.length === 0) continue;
                    amounts.sort((a, b) => a - b);
                    const median  = amounts[Math.floor(amounts.length / 2)];
                    const rounded = Math.round(median * 1000) / 1000;
                    if (!isNaN(rounded) && rounded > 0) {
                        try { localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify({ price: rounded, ts: Date.now() })); } catch {}
                        if (!cancelled) { setPrice(rounded); setSource('live'); setLoading(false); }
                        return;
                    }
                } catch { /* nächsten Proxy */ }
            }
            // 3) Fallback bleibt
            if (!cancelled) setLoading(false);
        }

        load();
        const interval = setInterval(load, 30 * 60 * 1000);
        return () => { cancelled = true; clearInterval(interval); };
    }, []);

    return { price, source, loading };
}

// NaN-sicher: gibt immer eine gültige Zahl zurück
function estimateTravelFee(km, fuelPrice) {
    const fp = (typeof fuelPrice === 'number' && !isNaN(fuelPrice) && fuelPrice > 0) ? fuelPrice : FUEL_FALLBACK;
    if (!km || km <= FREE_KM) return 0;
    const cost = km * 2 * (FUEL_L_PER_100KM / 100) * fp * OVERHEAD_FACTOR;
    return Math.round(cost * 2) / 2; // auf 0.50€ runden
}

// Formatiert einen Preis sicher — niemals NaN anzeigen
function safePrice(val, decimals = 3) {
    const n = Number(val);
    return isNaN(n) ? FUEL_FALLBACK.toFixed(decimals) : n.toFixed(decimals);
}

// Einfache Haversine-Distanz-Schätzung (Luftlinie × 1.3 ≈ Straße)
function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.3;
}

// Geocoding via Nominatim (kostenlos, kein API-Key nötig)
async function geocodeAddress(address) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', Österreich')}&format=json&limit=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'de' } });
        const data = await res.json();
        if (data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display: data[0].display_name };
        return null;
    } catch { return null; }
}

// Kalender-Hilfsfunktionen
function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

export default function Contact({ darkMode, lang, cart = [], setCart }) {
    const t = translations[lang] || translations.de;
    const form = useRef();
    const { coords: userCoords, city: userCity } = useLocation();
    const { price: fuelPrice, source: fuelSource, loading: fuelLoading } = useAustrianFuelPrice();

    // Form state
    const [status,          setStatus]          = useState('idle');
    const [validationError, setValidationError] = useState(false);

    // Booking state
    const [serviceMode,   setServiceMode]   = useState(null);   // 'home' | 'here'
    const [customerAddr,  setCustomerAddr]  = useState('');
    const [addrPrefilled, setAddrPrefilled] = useState(false);
    const [addrGeo,       setAddrGeo]       = useState(null);
    const [addrLoading,   setAddrLoading]   = useState(false);
    const [travelFee,     setTravelFee]     = useState(0);
    const [travelKm,      setTravelKm]      = useState(null);

    // Nutzerstandort automatisch → Fahrtkosten vorberechnen
    useEffect(() => {
        if (serviceMode !== 'home' || addrPrefilled || !userCoords) return;
        const { lat, lon } = userCoords;
        const km = haversineKm(_BASE.lat, _BASE.lon, lat, lon);
        setTravelKm(Math.round(km));
        setTravelFee(estimateTravelFee(km, fuelPrice));
        setAddrGeo({ lat, lon, display: userCity });
        if (!customerAddr) setCustomerAddr(userCity);
        setAddrPrefilled(true);
    }, [serviceMode, userCoords, addrPrefilled, userCity, fuelPrice]);

    // Calendar state
    const today = new Date();
    const [calYear, setCalYear]   = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const modelErrorMsg = {
        de: 'Modell/Marke fehlt!', en: 'Model/Brand missing!', es: '¡Falta modelo/marca!',
        fr: 'Modèle/Marque manquant!', it: 'Modello/Marca mancante!', sq: 'Mungon modeli/marka!',
        bs: 'Nedostaje model/marka!', tr: 'Model/Marka eksik!'
    };

    const totalPrice = (cart?.reduce((s, i) => s + (Number(i.price) || 0), 0) || 0) + travelFee;
    const refinementLevel = Math.min(cart.length * 25, 100);

    const glassPanel = darkMode
        ? 'bg-white/[0.04] border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.07)]'
        : 'bg-white/70 border-white/80 shadow-[0_4px_30px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)]';

    const inputStyle = `w-full p-5 rounded-3xl border outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all font-bold text-xs uppercase ${
        darkMode
            ? 'bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/25 focus:bg-white/[0.08]'
            : 'bg-black/[0.04] border-black/[0.08] text-black placeholder:text-black/25 focus:bg-white/80'
    } backdrop-blur-xl`;

    const labelStyle = `text-[9px] font-black uppercase ml-5 tracking-[0.2em] ${darkMode ? 'text-white/50' : 'text-black/40'}`;

    // ── Adresse geocoden + Fahrtkosten berechnen ─────────────────────────────
    const handleGeocodeAddr = async () => {
        if (!customerAddr.trim()) return;
        setAddrLoading(true);
        const geo = await geocodeAddress(customerAddr);
        if (geo) {
            setAddrGeo(geo);
            const km = haversineKm(_BASE.lat, _BASE.lon, geo.lat, geo.lon);
            setTravelKm(Math.round(km));
            setTravelFee(estimateTravelFee(km, fuelPrice));
        } else {
            setAddrGeo(null);
            setTravelFee(0);
            setTravelKm(null);
        }
        setAddrLoading(false);
    };

    // ── Kalender ─────────────────────────────────────────────────────────────
    const MONTH_NAMES_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
    const MONTH_NAMES_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DAY_NAMES_DE   = ['Mo','Di','Mi','Do','Fr','Sa','So'];
    const DAY_NAMES_EN   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const monthNames = lang === 'de' ? MONTH_NAMES_DE : MONTH_NAMES_EN;
    const dayNames   = lang === 'de' ? DAY_NAMES_DE   : DAY_NAMES_EN;

    const TIME_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

    const daysInMonth   = getDaysInMonth(calYear, calMonth);
    const firstDay      = (getFirstDayOfMonth(calYear, calMonth) + 6) % 7; // Mo=0
    const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); };
    const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); };

    const isDisabled = (day) => {
        const d = new Date(calYear, calMonth, day);
        const now = new Date(); now.setHours(0,0,0,0);
        return d < now || d.getDay() === 0; // Vergangenheit + Sonntag gesperrt
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const sendEmail = async (e) => {
        e.preventDefault();
        setValidationError(false);
        if (status === 'sending') return;

        const incompleteItems = cart.filter(item => !item.carModel || item.carModel.trim() === '');
        if (incompleteItems.length > 0) {
            setValidationError(true);
            document.getElementById('cart-summary')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setStatus('sending');
        const cartContent = cart.map(item => `• ${item.name} [${item.carModel}] - ${item.price}€`).join('\n');
        const formData = new FormData(form.current);
        formData.append('access_key', '8da57c53-35df-4746-8217-578703403586');
        formData.append('subject', `Booking (${lang.toUpperCase()}): ${form.current.user_name.value}`);
        formData.append('Warenkorb_Details', cartContent);
        formData.append('Gesamtpreis', `${totalPrice}€`);
        formData.append('Sprache', lang.toUpperCase());
        formData.append('Service_Modus', serviceMode === 'home' ? 'Wir kommen zum Kunden' : 'Kunde kommt zu uns');
        if (serviceMode === 'home' && customerAddr) formData.append('Kunden_Adresse', customerAddr);
        if (travelFee > 0) formData.append('Fahrtkosten', `${travelFee}€ (ca. ${travelKm} km)`);
        if (selectedDate) formData.append('Wunschtermin', `${selectedDate} — ${selectedTime || 'keine Uhrzeit'}`);

        try {
            const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
            const data = await response.json();
            if (data.success) {
                setStatus('success');
                form.current.reset();
                if (setCart) setCart([]);
                setTimeout(() => setStatus('idle'), 5000);
            } else throw new Error();
        } catch {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    return (
        <section id="kontakt" className="py-24 px-6 scroll-mt-20 relative overflow-hidden">
            <div className={`absolute bottom-0 left-1/3 w-96 h-72 rounded-full blur-[140px] pointer-events-none ${darkMode ? 'bg-blue-600/[0.09]' : 'bg-blue-300/[0.15]'}`} />

            <div className="max-w-6xl mx-auto text-center relative z-10">

                {/* Progress bar */}
                <div className="mb-16 max-w-4xl mx-auto">
                    <div className="flex justify-between mb-3 px-1">
                        <span className={`text-[10px] font-black tracking-widest uppercase ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {refinementLevel < 100 ? 'Refinement in Progress' : 'Ultimate Showroom Condition'}
                        </span>
                        <span className={`text-[10px] font-black tracking-widest uppercase ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                            {refinementLevel}% Detailing Level
                        </span>
                    </div>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${refinementLevel}%` }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_12px_rgba(37,99,235,0.5)]" />
                    </div>
                </div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12 ${darkMode ? 'text-white' : 'text-black'}`}
                >
                    {t.contactTitle} <span className="text-blue-600">{t.contactJourney}</span>
                </motion.h2>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* ── LEFT: Cart Summary ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-5 space-y-6"
                    >
                        <div
                            id="cart-summary"
                            className={`p-8 rounded-[3rem] border text-left relative overflow-hidden transition-all duration-500 backdrop-blur-xl ${
                                validationError ? 'bg-red-500/[0.04] border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.08)]' : glassPanel
                            }`}
                        >
                            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-blue-600/[0.08] blur-[60px] rounded-full pointer-events-none" />
                            <h3 className={`text-lg font-black uppercase tracking-tighter mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-black'}`}>
                                <span className="w-2 h-6 bg-blue-600 rounded-full" />
                                Service <span className="text-blue-600 ml-1">Protocol</span>
                            </h3>

                            <div className="space-y-5 relative z-10">
                                <AnimatePresence mode="popLayout">
                                    {cart.length === 0 ? (
                                        <p className={`text-[11px] font-bold uppercase ${darkMode ? 'text-white/30' : 'text-black/30'}`}>No modules selected yet...</p>
                                    ) : cart.map((item, idx) => (
                                        <motion.div layout initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -16, opacity: 0 }} key={idx} className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <span className={`text-[10px] font-black mt-0.5 ${darkMode ? 'text-blue-600/50' : 'text-blue-500/60'}`}>0{idx + 1}</span>
                                                <div>
                                                    <p className={`text-[11px] font-black uppercase ${darkMode ? 'text-white' : 'text-black'}`}>{item.name}</p>
                                                    {item.carModel
                                                        ? <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">{item.carModel}</p>
                                                        : <p className="text-[8px] text-red-500 font-black animate-pulse uppercase tracking-tighter mt-0.5">⚠ {modelErrorMsg[lang] || modelErrorMsg.de}</p>
                                                    }
                                                </div>
                                            </div>
                                            <span className="text-blue-600 font-black text-[11px]">{item.price}€</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Travel fee line */}
                            {travelFee > 0 && (
                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                    className={`mt-4 p-3 rounded-2xl flex justify-between items-center text-[10px] font-black uppercase ${darkMode ? 'bg-white/[0.03] text-white/50' : 'bg-black/[0.03] text-black/50'}`}>
                                    <div>
                                        <span>🚗 {lang === 'de' ? 'Fahrtkosten' : 'Travel fee'}</span>
                                        <span className={`ml-2 text-[8px] font-bold normal-case ${darkMode ? 'text-white/25' : 'text-black/30'}`}>
                                            ~{travelKm} km · Hin+Rück
                                        </span>
                                            {/* Live-Preis Indikator */}
                                        <span className={`ml-2 text-[8px] font-bold normal-case inline-flex items-center gap-1 ${fuelSource === 'live' ? 'text-green-500' : fuelSource === 'cache' ? 'text-yellow-500' : darkMode ? 'text-white/25' : 'text-black/25'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${fuelSource === 'live' ? 'bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.8)] animate-pulse' : fuelSource === 'cache' ? 'bg-yellow-400' : 'bg-gray-400'}`} />
                                            {safePrice(fuelPrice, 3)}€/L Diesel
                                            {fuelSource === 'live' && ' · live'}
                                            {fuelSource === 'cache' && ' · cached'}
                                        </span>
                                    </div>
                                    <span className="text-blue-500">+{travelFee}€</span>
                                </motion.div>
                            )}

                            <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-white/[0.08]' : 'border-black/[0.08]'}`}>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${darkMode ? 'text-white/40' : 'text-black/40'}`}>{t.cartSubtotal}</p>
                                        <motion.p key={totalPrice} initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="text-4xl font-black text-blue-600 tracking-tighter">{totalPrice}€</motion.p>
                                    </div>
                                    <div className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border ${darkMode ? 'border-white/[0.08] text-white/25' : 'border-black/[0.08] text-black/30'}`}>
                                        EST. Ready in 24h
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Certified badge */}
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
                            className={`p-6 rounded-[2rem] border flex items-center gap-4 ${darkMode ? 'bg-blue-600/[0.08] border-blue-500/20' : 'bg-blue-50/80 border-blue-100'} backdrop-blur-xl`}>
                            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse flex-shrink-0" />
                            <p className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-white/60' : 'text-black/60'}`}>RS-Precision Certified Workmanship</p>
                        </motion.div>
                    </motion.div>

                    {/* ── RIGHT: Form ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-7"
                    >
                        <div className={`p-8 md:p-10 rounded-[3.5rem] border backdrop-blur-2xl ${glassPanel}`}>
                            <form ref={form} className="space-y-6 text-left" onSubmit={sendEmail}>

                                {/* Name + Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelStyle}>{t.nameLabel}</label>
                                        <input required name="user_name" type="text" placeholder={t.namePlaceholder} className={inputStyle} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelStyle}>{t.emailLabel}</label>
                                        <input required name="user_email" type="email" placeholder={t.emailPlaceholder} className={inputStyle} />
                                    </div>
                                </div>

                                {/* ── Service Mode Toggle ── */}
                                <div className="space-y-3">
                                    <label className={labelStyle}>{lang === 'de' ? 'Service-Ort' : 'Service location'}</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'here', icon: '📍', de: 'Ich komme zu euch', en: 'I come to you' },
                                            { id: 'home', icon: '🏠', de: 'Ihr kommt zu mir', en: 'You come to me' },
                                        ].map(opt => (
                                            <motion.button
                                                key={opt.id}
                                                type="button"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => { setServiceMode(opt.id); setTravelFee(0); setAddrGeo(null); setTravelKm(null); setAddrPrefilled(false); setCustomerAddr(''); }}
                                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-300 ${
                                                    serviceMode === opt.id
                                                        ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(37,99,235,0.15)]'
                                                        : darkMode ? 'border-white/[0.08] bg-white/[0.03] hover:border-white/20' : 'border-black/[0.08] bg-white/40 hover:border-blue-300'
                                                }`}
                                            >
                                                <span className="text-2xl">{opt.icon}</span>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${serviceMode === opt.id ? 'text-blue-500' : darkMode ? 'text-white/50' : 'text-black/50'}`}>
                                                    {lang === 'de' ? opt.de : opt.en}
                                                </span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Customer address (only if 'home') ── */}
                                <AnimatePresence>
                                    {serviceMode === 'home' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                                            <label className={labelStyle}>{lang === 'de' ? 'Ihre Adresse' : 'Your address'}</label>
                                            {addrPrefilled && addrGeo && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest w-fit ${
                                                        darkMode ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-600'
                                                    }`}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                    {lang === 'de' ? `Standort erkannt · ${userCity}` : `Location detected · ${userCity}`}
                                                    <span className={`opacity-50 ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                                                        · {lang === 'de' ? 'Adresse änderbar' : 'editable'}
                                                    </span>
                                                </motion.div>
                                            )}
                                            <div className="flex gap-2">
                                                <input
                                                    name="kunden_adresse"
                                                    type="text"
                                                    value={customerAddr}
                                                    onChange={e => setCustomerAddr(e.target.value)}
                                                    placeholder={lang === 'de' ? 'Straße, Hausnummer, Ort...' : 'Street, number, city...'}
                                                    className={`${inputStyle} flex-1`}
                                                    onBlur={handleGeocodeAddr}
                                                />
                                                <motion.button
                                                    type="button"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleGeocodeAddr}
                                                    disabled={addrLoading}
                                                    className={`px-5 rounded-2xl border-2 border-blue-500 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all ${addrLoading ? 'opacity-50' : 'hover:bg-blue-500'}`}
                                                >
                                                    {addrLoading
                                                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                    }
                                                </motion.button>
                                            </div>

                                            {/* Geocode result */}
                                            <AnimatePresence>
                                                {addrGeo && (
                                                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                        className={`px-5 py-3.5 rounded-2xl border flex items-center justify-between gap-3 ${darkMode ? 'bg-green-500/[0.08] border-green-500/20' : 'bg-green-50 border-green-200'}`}>
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                                                            <p className={`text-[9px] font-bold truncate ${darkMode ? 'text-white/60' : 'text-black/60'}`}>{addrGeo.display.split(',').slice(0, 3).join(', ')}</p>
                                                        </div>
                                                        <div className={`text-[10px] font-black flex-shrink-0 ${travelFee === 0 ? 'text-green-500' : 'text-blue-500'}`}>
                                                            {travelFee === 0
                                                                ? (lang === 'de' ? 'Kostenlos' : 'Free')
                                                                : `+${travelFee}€`}
                                                        </div>
                                                    </motion.div>
                                                )}
                                                {addrGeo === null && customerAddr && !addrLoading && (
                                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] text-red-500 font-black uppercase tracking-widest ml-2">
                                                        {lang === 'de' ? '⚠ Adresse nicht gefunden' : '⚠ Address not found'}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>

                                            {/* Fee info */}
                                            <p className={`text-[8px] font-bold uppercase tracking-widest ml-2 ${darkMode ? 'text-white/20' : 'text-black/25'}`}>
                                                {lang === 'de'
                                                    ? `Bis ${FREE_KM} km kostenlos · danach ${(FUEL_L_PER_100KM / 100 * (isNaN(fuelPrice) ? FUEL_FALLBACK : fuelPrice) * 2 * OVERHEAD_FACTOR).toFixed(2).replace('.', ',')}€/km · ${FUEL_L_PER_100KM}L/100km · ${safePrice(fuelPrice, 3).replace('.', ',')}€/L Diesel${fuelSource === 'live' ? ' live' : ''}`
                                                    : `Up to ${FREE_KM} km free · then ${(FUEL_L_PER_100KM / 100 * (isNaN(fuelPrice) ? FUEL_FALLBACK : fuelPrice) * 2 * OVERHEAD_FACTOR).toFixed(2)}€/km · ${FUEL_L_PER_100KM}L/100km · €${safePrice(fuelPrice, 3)} diesel${fuelSource === 'live' ? ' live' : ''}`
                                                }
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* ── Calendar ── */}
                                <AnimatePresence>
                                    {serviceMode && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                                            <label className={labelStyle}>{lang === 'de' ? 'Wunschtermin' : 'Preferred date'}</label>

                                            <div className={`rounded-3xl border p-5 backdrop-blur-xl ${darkMode ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-white/60 border-black/[0.08]'}`}>
                                                {/* Month nav */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <button type="button" onClick={prevMonth}
                                                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${darkMode ? 'hover:bg-white/10 text-white/60' : 'hover:bg-black/5 text-black/50'}`}>
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                                                    </button>
                                                    <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-white' : 'text-black'}`}>
                                                        {monthNames[calMonth]} {calYear}
                                                    </p>
                                                    <button type="button" onClick={nextMonth}
                                                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${darkMode ? 'hover:bg-white/10 text-white/60' : 'hover:bg-black/5 text-black/50'}`}>
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                                    </button>
                                                </div>

                                                {/* Day headers */}
                                                <div className="grid grid-cols-7 mb-2">
                                                    {dayNames.map(d => (
                                                        <div key={d} className={`text-center text-[8px] font-black uppercase py-1 ${darkMode ? 'text-white/25' : 'text-black/25'}`}>{d}</div>
                                                    ))}
                                                </div>

                                                {/* Days grid */}
                                                <div className="grid grid-cols-7 gap-1">
                                                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                                        const day = i + 1;
                                                        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                                                        const disabled = isDisabled(day);
                                                        const selected = selectedDate === dateStr;
                                                        return (
                                                            <motion.button
                                                                key={day}
                                                                type="button"
                                                                whileHover={!disabled ? { scale: 1.12 } : {}}
                                                                whileTap={!disabled ? { scale: 0.92 } : {}}
                                                                disabled={disabled}
                                                                onClick={() => { setSelectedDate(dateStr); setSelectedTime(null); }}
                                                                className={`aspect-square rounded-xl text-[10px] font-black flex items-center justify-center transition-all duration-200 ${
                                                                    selected
                                                                        ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                                                                        : disabled
                                                                            ? (darkMode ? 'text-white/10 cursor-not-allowed' : 'text-black/12 cursor-not-allowed')
                                                                            : (darkMode ? 'text-white/60 hover:bg-white/10' : 'text-black/60 hover:bg-blue-50')
                                                                }`}
                                                            >
                                                                {day}
                                                            </motion.button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Time slots */}
                                            <AnimatePresence>
                                                {selectedDate && (
                                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                                                        <p className={`text-[9px] font-black uppercase tracking-widest ml-1 ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                                                            {lang === 'de' ? 'Uhrzeit wählen' : 'Choose time'}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {TIME_SLOTS.map(slot => (
                                                                <motion.button
                                                                    key={slot}
                                                                    type="button"
                                                                    whileHover={{ scale: 1.06 }}
                                                                    whileTap={{ scale: 0.94 }}
                                                                    onClick={() => setSelectedTime(slot)}
                                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black border-2 transition-all duration-200 ${
                                                                        selectedTime === slot
                                                                            ? 'border-blue-500 bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                                                                            : darkMode ? 'border-white/[0.08] bg-white/[0.04] text-white/50 hover:border-blue-500/50' : 'border-black/[0.08] bg-white/60 text-black/50 hover:border-blue-400'
                                                                    }`}
                                                                >
                                                                    {slot}
                                                                </motion.button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Selected summary */}
                                            <AnimatePresence>
                                                {selectedDate && selectedTime && (
                                                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                        className={`px-5 py-3.5 rounded-2xl border flex items-center gap-3 ${darkMode ? 'bg-blue-600/[0.08] border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                                                        <span className="text-blue-500">📅</span>
                                                        <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                                                            {selectedDate} — {selectedTime} {lang === 'de' ? 'Uhr' : ''}
                                                        </p>
                                                        <input type="hidden" name="wunschtermin" value={`${selectedDate} ${selectedTime}`} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Message */}
                                <div className="space-y-2">
                                    <label className={labelStyle}>{t.messageLabel}</label>
                                    <textarea required name="message" rows="3" maxLength={1000} placeholder={t.messagePlaceholder} className={`${inputStyle} resize-none`} />
                                </div>

                                {/* Submit */}
                                <motion.button
                                    whileHover={{ scale: 1.01, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={status === 'sending' || status === 'success'}
                                    type="submit"
                                    className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-colors flex items-center justify-center gap-3 ${
                                        status === 'success' ? 'bg-green-500 text-white shadow-green-500/20'
                                        : status === 'error' ? 'bg-red-500 text-white shadow-red-500/20'
                                        : validationError ? 'bg-red-600 text-white shadow-red-600/20'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 hover:shadow-[0_12px_40px_rgba(37,99,235,0.4)]'
                                    }`}
                                >
                                    {status === 'idle' && !validationError && t.submitBtn}
                                    {status === 'idle' && validationError && (modelErrorMsg[lang] || modelErrorMsg.de)}
                                    {status === 'sending' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {status === 'success' && (t.authSuccess || 'OK ✓')}
                                    {status === 'error' && (t.authError || 'ERROR ✕')}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </div>

                {/* Footer row */}
                <div className={`mt-16 flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] ${darkMode ? 'text-white/20' : 'text-black/20'}`}>
                    <span className="hover:text-blue-500 transition-colors cursor-default">© RS PFLEGE - {t.rights}</span>
                    <a href="#" className="hover:text-blue-500 transition-colors">{t.imprint}</a>
                    <a href="#" className="hover:text-blue-500 transition-colors">{t.privacy}</a>
                </div>
            </div>
        </section>
    );
}