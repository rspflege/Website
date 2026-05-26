import { useState, useRef, useEffect } from 'react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from './useLocation';
import { supabase } from '../supabaseClient';

// ── Basisstandort (XOR-verschlüsselt — kein Klartext im Bundle) ───────────────
const _K = 0x4f;
const _La = [123,120,97,119,119,124,124];
const _Lo = [126,124,97,121,122,127,127];
const _BASE = (() => {
    const d = a => parseFloat(a.map(b => String.fromCharCode(b ^ _K)).join(''));
    return { lat: d(_La), lon: d(_Lo) };
})();

// ── Fahrtkosten-Kalkulation ───────────────────────────────────────────────────
const FUEL_L_PER_100KM = 5.8;
const FUEL_FALLBACK    = 1.45;
const OVERHEAD_FACTOR  = 1.30;
const FREE_KM          = 8;

const PRICE_CACHE_KEY = 'at_diesel_price_cache';
const PRICE_CACHE_TTL = 60 * 60 * 1000;

// Hook: aktueller Diesel-Preis AT (E-Control API) mit Fallback-Kette
// FIX: Direktaufruf entfernt (verursachte 400-Fehler) — nur noch CORS-Proxies
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
                    return; // Cache gültig → kein Netzwerk-Request nötig
                }
            } catch {}

            // 2) E-Control API — Diesel (DIE)
            // FIX: Direktaufruf (u => u) entfernt, da E-Control CORS blockiert → 400/403
            const API = 'https://api.e-control.at/sprit/1.0/search/gas-stations/by-region?regionType=BL&regionCode=99&fuelType=DIE&includeClosed=false';
            const PROXIES = [
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
    return Math.round(cost * 2) / 2;
}

function safePrice(val, decimals = 3) {
    const n = Number(val);
    return isNaN(n) ? FUEL_FALLBACK.toFixed(decimals) : n.toFixed(decimals);
}

function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.3;
}

// FIX: Nominatim (CORS-blockiert) ersetzt durch Photon API (photon.komoot.io)
// Photon ist kostenlos, kein API-Key nötig, und erlaubt Browser-CORS-Requests
async function geocodeAddress(address) {
    try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(address + ' Österreich')}&limit=1&lang=de`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) return null;
        const data = await res.json();
        const feature = data.features?.[0];
        if (!feature) return null;
        const [lon, lat] = feature.geometry.coordinates;
        const p = feature.properties;
        const display = [p.name, p.street, p.city || p.town || p.village, p.country]
            .filter(Boolean)
            .join(', ');
        return { lat, lon, display };
    } catch { return null; }
}

// Kalender-Hilfsfunktionen
function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

// ── Arbeitstage aus Supabase laden ─────────────────────────────────────────────
// Supabase-Tabelle: work_schedule (date TEXT PRIMARY KEY, slots TEXT[] DEFAULT '{}')
// Jeder Eintrag = ein Tag, an dem gearbeitet wird, mit optionalen Zeitslots
const SCHEDULE_TABLE = 'work_schedule';

function useWorkSchedule() {
    const [schedule, setSchedule]       = useState({});
    const [scheduleLoading, setLoading] = useState(true);
    const [reloadTick, setReloadTick]   = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        supabase.from(SCHEDULE_TABLE).select('date,slots').then(({ data }) => {
            if (cancelled) return;
            if (data) {
                const map = {};
                data.forEach(r => { map[r.date] = r.slots || []; });
                setSchedule(map);
            }
            setLoading(false);
        }).catch(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [reloadTick]);

    const refresh = () => setReloadTick(t => t + 1);

    return { schedule, scheduleLoading, refresh };
}

const ADMIN_EMAILS_CONTACT = [
    'spahiu.endrit09@hotmail.com',
    'rspflege.office@gmail.com',
    'rekicsead6@gmail.com'
];

export default function Contact({ darkMode, lang, cart = [], setCart }) {
    const t = translations[lang] || translations.de;
    const form = useRef();
    const { coords: userCoords, city: userCity } = useLocation();
    const { price: fuelPrice, source: fuelSource } = useAustrianFuelPrice();

    // Auth
    const [currentUser, setCurrentUser] = useState(null);
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setCurrentUser(session?.user ?? null));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setCurrentUser(s?.user ?? null));
        return () => subscription.unsubscribe();
    }, []);
    const isAdminUser = currentUser && ADMIN_EMAILS_CONTACT.includes(currentUser.email);

    // Work schedule (admin-verwaltete Arbeitstage)
    const { schedule, scheduleLoading, refresh: refreshSchedule } = useWorkSchedule();
    const [showAdminSchedule, setShowAdminSchedule] = useState(false);

    // Form state
    const [status,          setStatus]          = useState('idle');
    const [validationError, setValidationError] = useState(false);

    // Booking state
    const [serviceMode,   setServiceMode]   = useState(null);
    const [customerAddr,  setCustomerAddr]  = useState('');
    const [addrPrefilled, setAddrPrefilled] = useState(false);
    const [addrGeo,       setAddrGeo]       = useState(null);
    const [addrLoading,   setAddrLoading]   = useState(false);
    const [travelFee,     setTravelFee]     = useState(0);
    const [travelKm,      setTravelKm]      = useState(null);

    // Nutzerstandort automatisch → Fahrtkosten vorberechnen
    useEffect(() => {
        if (serviceMode !== 'home' || !userCoords) return;
        const { lat, lon } = userCoords;
        const km = haversineKm(_BASE.lat, _BASE.lon, lat, lon);
        setTravelKm(Math.round(km));
        setTravelFee(estimateTravelFee(km, fuelPrice));
        if (!addrPrefilled) {
            setAddrGeo({ lat, lon, display: userCity });
            if (!customerAddr) setCustomerAddr(userCity);
            setAddrPrefilled(true);
        }
    }, [serviceMode, userCoords, userCity, fuelPrice]);

    // Wenn Adresse manuell geocoded wurde, Fahrtkosten bei fuelPrice-Update neu berechnen
    useEffect(() => {
        if (!addrGeo || serviceMode !== 'home') return;
        const km = haversineKm(_BASE.lat, _BASE.lon, addrGeo.lat, addrGeo.lon);
        setTravelKm(Math.round(km));
        setTravelFee(estimateTravelFee(km, fuelPrice));
    }, [fuelPrice]);

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
    const firstDay      = (getFirstDayOfMonth(calYear, calMonth) + 6) % 7;
    const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); };
    const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); };

    // Sa/So werden wie normale Tage behandelt — im schedule-Objekt via mergedSchedule
    const WEEKEND_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];

    const isWeekend = (year, month, day) => {
        const dow = new Date(year, month, day).getDay();
        return dow === 0 || dow === 6;
    };

    // Merged schedule: Supabase-Daten haben Vorrang; Wochenenden sind immer verfügbar als Fallback
    const getMergedSlots = (dateStr) => {
        if (dateStr in schedule) {
            // Leere slots = explizit deaktiviert (auch für Wochenenden)
            if (schedule[dateStr].length === 0) return null;
            return schedule[dateStr];
        }
        const [y, m, d] = dateStr.split('-').map(Number);
        if (isWeekend(y, m - 1, d)) return WEEKEND_SLOTS;
        return null;
    };

    const isDisabled = (day) => {
        const d = new Date(calYear, calMonth, day);
        const now = new Date(); now.setHours(0,0,0,0);
        if (d < now) return true;
        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        return getMergedSlots(dateStr) === null;
    };

    const getTimeSlotsForDate = (dateStr) => {
        return getMergedSlots(dateStr) || TIME_SLOTS;
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
        <section id="kontakt" className="py-24 px-6 scroll-mt-20 relative overflow-x-hidden">
            <div className={`absolute bottom-0 left-1/3 w-96 h-72 rounded-full blur-[140px] pointer-events-none ${darkMode ? 'bg-blue-600/[0.09]' : 'bg-blue-300/[0.15]'}`} />
            <div className={`absolute top-1/4 right-0 w-72 h-72 rounded-full blur-[120px] pointer-events-none ${darkMode ? 'bg-violet-600/[0.07]' : 'bg-violet-300/[0.10]'}`} />
            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`absolute w-1 h-1 rounded-full pointer-events-none ${darkMode ? 'bg-blue-400/40' : 'bg-blue-500/30'}`}
                    style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
                    animate={{ y: [-12, 12, -12], opacity: [0.3, 0.8, 0.3], scale: [1, 1.5, 1] }}
                    transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                />
            ))}

            <div className="max-w-6xl mx-auto text-center relative z-10">

                {/* Progress bar */}
                <motion.div
                    className="mb-16 max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
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
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12 pb-2 leading-[1.05] ${darkMode ? 'text-white' : 'text-black'}`}
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
                                            <div className="flex items-center justify-between">
                                                <label className={labelStyle}>{lang === 'de' ? 'Wunschtermin' : 'Preferred date'}</label>
                                                {isAdminUser && (
                                                    <motion.button type="button" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                                        onClick={() => setShowAdminSchedule(v => !v)}
                                                        className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
                                                            showAdminSchedule
                                                                ? 'bg-violet-600 border-violet-500 text-white'
                                                                : darkMode ? 'border-violet-500/40 text-violet-400 hover:bg-violet-500/10' : 'border-violet-400 text-violet-600 hover:bg-violet-50'
                                                        }`}>
                                                        {lang === 'de' ? '⚙ Arbeitstage verwalten' : '⚙ Manage schedule'}
                                                    </motion.button>
                                                )}
                                            </div>

                                            {/* Admin: Arbeitstage eintragen */}
                                            <AnimatePresence>
                                                {isAdminUser && showAdminSchedule && (
                                                    <AdminScheduleEditor
                                                        darkMode={darkMode}
                                                        lang={lang}
                                                        schedule={schedule}
                                                        calYear={calYear}
                                                        calMonth={calMonth}
                                                        onRefresh={refreshSchedule}
                                                        TIME_SLOTS={TIME_SLOTS}
                                                    />
                                                )}
                                            </AnimatePresence>

                                            {scheduleLoading && (
                                                <p className={`text-[8px] font-black uppercase tracking-widest ml-2 animate-pulse ${darkMode ? 'text-white/20' : 'text-black/20'}`}>
                                                    {lang === 'de' ? 'Termine werden geladen...' : 'Loading schedule...'}
                                                </p>
                                            )}
                                            {false && Object.keys(schedule).length === 0 && (
                                                <p className={`text-[8px] font-black uppercase tracking-widest ml-2 ${darkMode ? 'text-amber-400/60' : 'text-amber-600/70'}`}>
                                                    {lang === 'de' ? 'ℹ Noch keine Termine verfügbar — bitte direkt anfragen' : 'ℹ No dates available yet — please inquire directly'}
                                                </p>
                                            )}

                                            {/* Sa/So immer verfügbar Badge */}
                                            <motion.div
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest w-fit ${
                                                    darkMode ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-600'
                                                }`}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                                                {lang === 'de' ? 'Sa & So · 08:00–18:00 · Immer buchbar' : 'Sat & Sun · 08:00–18:00 · Always available'}
                                            </motion.div>

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
                                                        const available = !disabled;
                                                        return (
                                                            <button
                                                                key={day}
                                                                type="button"
                                                                disabled={disabled}
                                                                onClick={() => { setSelectedDate(dateStr); setSelectedTime(null); }}
                                                                style={{ willChange: 'transform' }}
                                                                className={`aspect-square rounded-xl text-[10px] font-black flex items-center justify-center relative transition-[background,box-shadow,color] duration-150 ${
                                                                    available ? 'hover:scale-110 active:scale-95' : ''
                                                                } ${
                                                                    selected
                                                                        ? 'bg-blue-600 text-white shadow-[0_0_14px_rgba(37,99,235,0.5)]'
                                                                        : disabled
                                                                            ? (darkMode ? 'text-white/10 cursor-not-allowed' : 'text-black/10 cursor-not-allowed')
                                                                            : (darkMode ? 'bg-green-500/15 text-green-400 ring-1 ring-green-500/25 hover:bg-green-500/30' : 'bg-green-50 text-green-700 ring-1 ring-green-200 hover:bg-green-100')
                                                                }`}
                                                            >
                                                                {day}
                                                                {available && !selected && (
                                                                    <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-green-400" />
                                                                )}
                                                            </button>
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
                                                            {getTimeSlotsForDate(selectedDate).map(slot => (
                                                                <button
                                                                    key={slot}
                                                                    type="button"
                                                                    onClick={() => setSelectedTime(slot)}
                                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black border-2 transition-[background,border-color,box-shadow,color] duration-150 hover:scale-105 active:scale-95 ${
                                                                        selectedTime === slot
                                                                            ? 'border-blue-500 bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                                                                            : darkMode ? 'border-white/[0.08] bg-white/[0.04] text-white/50 hover:border-blue-500/50' : 'border-black/[0.08] bg-white/60 text-black/50 hover:border-blue-400'
                                                                    }`}
                                                                >
                                                                    {slot}
                                                                </button>
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
                                    whileHover={{ scale: 1.02, y: -2, boxShadow: '0 16px 48px rgba(37,99,235,0.45)' }}
                                    whileTap={{ scale: 0.97 }}
                                    animate={status === 'sending' ? { opacity: [1, 0.7, 1] } : { opacity: 1 }}
                                    transition={status === 'sending' ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.15 }}
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
            </div>
        </section>
    );
}

// ── Admin: Arbeitstage eintragen ───────────────────────────────────────────────
// Supabase SQL (einmalig ausführen):
// CREATE TABLE IF NOT EXISTS work_schedule (
//   date TEXT PRIMARY KEY,
//   slots TEXT[] DEFAULT '{}'
// );
// ALTER TABLE work_schedule ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Public read" ON work_schedule FOR SELECT USING (true);
// CREATE POLICY "Auth write" ON work_schedule FOR ALL USING (auth.role() = 'authenticated');

const ALL_SLOTS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

function AdminScheduleEditor({ darkMode, lang, schedule, calYear, calMonth, onRefresh, TIME_SLOTS }) {
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [editDate, setEditDate] = useState(null);
    const [editSlots, setEditSlots] = useState([]);
    const [localYear, setLocalYear] = useState(calYear);
    const [localMonth, setLocalMonth] = useState(calMonth);

    const MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

    const daysInMonth = getDaysInMonth(localYear, localMonth);
    const firstDay = (getFirstDayOfMonth(localYear, localMonth) + 6) % 7;
    const today = new Date(); today.setHours(0,0,0,0);

    const prevM = () => { if (localMonth === 0) { setLocalYear(y=>y-1); setLocalMonth(11); } else setLocalMonth(m=>m-1); };
    const nextM = () => { if (localMonth === 11) { setLocalYear(y=>y+1); setLocalMonth(0); } else setLocalMonth(m=>m+1); };

    const WEEKEND_SLOTS_ADMIN = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];

    const isAdminWeekend = (dateStr) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dow = new Date(y, m - 1, d).getDay();
        return dow === 0 || dow === 6;
    };

    // Ein Tag gilt als "verfügbar" wenn er in schedule ist ODER ein Wochenende ist
    const isAvailable = (dateStr) => (dateStr in schedule) || isAdminWeekend(dateStr);

    const openDay = (dateStr) => {
        setEditDate(dateStr);
        if (schedule[dateStr]) {
            setEditSlots([...schedule[dateStr]]);
        } else if (isAdminWeekend(dateStr)) {
            setEditSlots([...WEEKEND_SLOTS_ADMIN]);
        } else {
            setEditSlots([...TIME_SLOTS]);
        }
    };

    const toggleSlot = (slot) => {
        setEditSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot].sort());
    };

    const saveDay = async (dateStr, slots) => {
        setSaving(true);
        try {
            if (slots.length === 0) {
                // Wochenende mit leeren Slots = explizit als "nicht verfügbar" speichern
                // Wir speichern einen Sentinel-Eintrag mit speziellen Slots oder löschen
                if (isAdminWeekend(dateStr)) {
                    // Für Wochenenden: in Supabase als deaktiviert speichern (leere slots = disabled)
                    const { error } = await supabase.from(SCHEDULE_TABLE).upsert({ date: dateStr, slots: [] }, { onConflict: 'date' });
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from(SCHEDULE_TABLE).delete().eq('date', dateStr);
                    if (error) throw error;
                }
                if (editDate === dateStr) setEditDate(null);
            } else {
                const { error } = await supabase.from(SCHEDULE_TABLE).upsert({ date: dateStr, slots }, { onConflict: 'date' });
                if (error) throw error;
            }
            setSaveMsg(lang === 'de' ? '✓ Gespeichert' : '✓ Saved');
            setTimeout(() => setSaveMsg(''), 2500);
            onRefresh();
        } catch (err) {
            const msg = err?.message || err?.code || JSON.stringify(err);
            setSaveMsg('✕ ' + msg.slice(0, 60));
            setTimeout(() => setSaveMsg(''), 6000);
        }
        setSaving(false);
    };

    const removeDay = async (dateStr) => {
        setSaving(true);
        try {
            if (isAdminWeekend(dateStr)) {
                // Wochenende deaktivieren: leere slots in Supabase speichern
                const { error } = await supabase.from(SCHEDULE_TABLE).upsert({ date: dateStr, slots: [] }, { onConflict: 'date' });
                if (error) throw error;
            } else {
                const { error } = await supabase.from(SCHEDULE_TABLE).delete().eq('date', dateStr);
                if (error) throw error;
            }
            setSaveMsg(lang === 'de' ? '✓ Entfernt' : '✓ Removed');
            setTimeout(() => setSaveMsg(''), 2500);
            setEditDate(null);
            onRefresh();
        } catch (err) {
            const msg = err?.message || err?.code || JSON.stringify(err);
            setSaveMsg('✕ ' + msg.slice(0, 60));
            setTimeout(() => setSaveMsg(''), 6000);
        }
        setSaving(false);
    };

    const inputCls = `w-full px-3 py-1.5 rounded-xl border text-[10px] font-medium transition-all ${
        darkMode ? 'bg-white/[0.06] border-white/10 text-white' : 'bg-white border-black/10 text-black'
    }`;

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className={`rounded-3xl border p-5 space-y-4 ${darkMode ? 'bg-violet-500/[0.06] border-violet-500/20' : 'bg-violet-50 border-violet-200'}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-violet-400' : 'text-violet-700'}`}>
                        ⚙ {lang === 'de' ? 'Arbeitstage verwalten' : 'Manage working days'}
                    </p>
                    <p className={`text-[8px] mt-0.5 ${darkMode ? 'text-white/30' : 'text-black/40'}`}>
                        {lang === 'de' ? 'Tag klicken → Slots wählen → Speichern' : 'Click day → pick slots → save'}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {saveMsg && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className={`text-[9px] font-black px-2 py-1 rounded-lg max-w-[200px] truncate ${saveMsg.startsWith('✓') ? 'text-green-500 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}
                            title={saveMsg}
                        >
                            {saveMsg}
                        </motion.span>
                    )}
                    <button type="button"
                        onClick={async () => {
                            const { data: { session } } = await supabase.auth.getSession();
                            const role = session?.user ? 'authenticated ✓' : 'anon ✗ (nicht eingeloggt!)';
                            setSaveMsg('Auth: ' + role + ' · ' + (session?.user?.email || '–'));
                            setTimeout(() => setSaveMsg(''), 6000);
                        }}
                        className={`text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${darkMode ? 'border-white/10 text-white/25 hover:text-white/50' : 'border-black/10 text-black/25 hover:text-black/50'}`}
                    >
                        auth?
                    </button>
                </div>
            </div>

            {/* Mini-Kalender */}
            <div className={`rounded-2xl border p-4 ${darkMode ? 'bg-black/20 border-white/[0.06]' : 'bg-white/80 border-black/[0.06]'}`}>
                {/* Nav */}
                <div className="flex items-center justify-between mb-3">
                    <button type="button" onClick={prevM} className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? 'hover:bg-white/10 text-white/50' : 'hover:bg-black/5 text-black/50'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-black'}`}>
                        {MONTH_NAMES[localMonth]} {localYear}
                    </p>
                    <button type="button" onClick={nextM} className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? 'hover:bg-white/10 text-white/50' : 'hover:bg-black/5 text-black/50'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                    {['Mo','Di','Mi','Do','Fr','Sa','So'].map(d => (
                        <div key={d} className={`text-center text-[7px] font-black uppercase py-1 ${darkMode ? 'text-white/20' : 'text-black/20'}`}>{d}</div>
                    ))}
                </div>
                {/* Days */}
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${localYear}-${String(localMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                        const isPast = new Date(localYear, localMonth, day) < today;
                        // Deaktiviertes Wochenende: in schedule mit slots=[]
                        const inSupabase = dateStr in schedule;
                        const isDisabledWeekend = inSupabase && schedule[dateStr].length === 0 && isAdminWeekend(dateStr);
                        const isScheduled = inSupabase && !isDisabledWeekend;
                        const isWeekendDefault = !inSupabase && isAdminWeekend(dateStr); // Sa/So ohne Eintrag = default verfügbar
                        const isEditing = editDate === dateStr;
                        return (
                            <button key={day} type="button" disabled={isPast}
                                onClick={() => openDay(dateStr)}
                                className={`aspect-square rounded-lg text-[9px] font-black flex items-center justify-center transition-all relative ${
                                    isPast
                                        ? (darkMode ? 'text-white/10 cursor-not-allowed' : 'text-black/10 cursor-not-allowed')
                                        : isEditing
                                            ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]'
                                            : isScheduled
                                                ? (darkMode ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30 hover:bg-green-500/30' : 'bg-green-100 text-green-700 ring-1 ring-green-300 hover:bg-green-200')
                                                : isWeekendDefault
                                                    ? (darkMode ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30 hover:bg-green-500/30' : 'bg-green-100 text-green-700 ring-1 ring-green-300 hover:bg-green-200')
                                                    : isDisabledWeekend
                                                        ? (darkMode ? 'text-white/20 ring-1 ring-red-500/20 bg-red-500/5' : 'text-black/20 ring-1 ring-red-300 bg-red-50')
                                                        : (darkMode ? 'text-white/40 hover:bg-white/10' : 'text-black/40 hover:bg-violet-50')
                                }`}>
                                {day}
                                {(isScheduled || isWeekendDefault) && !isEditing && (
                                    <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-green-400" />
                                )}
                                {isDisabledWeekend && !isEditing && (
                                    <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-red-400" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Slot-Editor für gewählten Tag */}
            <AnimatePresence>
                {editDate && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`rounded-2xl border p-4 space-y-3 ${darkMode ? 'bg-black/20 border-white/[0.06]' : 'bg-white/80 border-black/[0.06]'}`}>
                        <div className="flex items-center justify-between">
                            <p className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                                📅 {editDate}
                            </p>
                            <button type="button" onClick={() => removeDay(editDate)}
                                className="text-[8px] font-black uppercase tracking-widest text-red-500 hover:text-red-400">
                                {lang === 'de' ? 'Tag entfernen' : 'Remove day'}
                            </button>
                        </div>
                        <p className={`text-[8px] ${darkMode ? 'text-white/30' : 'text-black/40'}`}>
                            {lang === 'de' ? 'Verfügbare Zeitslots auswählen:' : 'Select available time slots:'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {ALL_SLOTS.map(slot => (
                                <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                                    className={`px-2.5 py-1 rounded-lg text-[8px] font-black border transition-all ${
                                        editSlots.includes(slot)
                                            ? 'bg-violet-600 border-violet-500 text-white'
                                            : darkMode ? 'border-white/10 text-white/35 hover:border-white/25' : 'border-black/10 text-black/40 hover:border-violet-300'
                                    }`}>
                                    {slot}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setEditSlots([...ALL_SLOTS])}
                                className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase border ${darkMode ? 'border-white/10 text-white/30 hover:text-white/60' : 'border-black/10 text-black/40'}`}>
                                {lang === 'de' ? 'Alle' : 'All'}
                            </button>
                            <button type="button" onClick={() => setEditSlots([])}
                                className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase border ${darkMode ? 'border-white/10 text-white/30 hover:text-white/60' : 'border-black/10 text-black/40'}`}>
                                {lang === 'de' ? 'Keine' : 'None'}
                            </button>
                            <button type="button" disabled={saving} onClick={() => saveDay(editDate, editSlots)}
                                className="flex-1 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[9px] font-black uppercase tracking-widest transition-colors disabled:opacity-50">
                                {saving ? '...' : (lang === 'de' ? 'Speichern' : 'Save')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}