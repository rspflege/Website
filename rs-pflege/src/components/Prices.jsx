import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { translations } from '../translations';

export default function Prices({ darkMode, lang, cart, setCart }) {
    const CAR_TYPES = {
        small: {
            id: 'small',
            label: { de: 'Kleinwagen', en: 'Small Car', sq: 'Makine e vogël', es: 'Coche pequeño', it: 'Auto piccola', fr: 'Petite voiture', tr: 'Küçük Araba', bs: 'Mali automobil' }[lang] || 'Kleinwagen',
            upcharge: -5, emoji: '🚗'
        },
        sedan: {
            id: 'sedan',
            label: { de: 'Limousine', en: 'Sedan', sq: 'Limuzinë', es: 'Sedán', it: 'Berlina', fr: 'Berline', tr: 'Sedan', bs: 'Limuzina' }[lang] || 'Limousine',
            upcharge: 0, emoji: '🚘'
        },
        suv: {
            id: 'suv',
            label: { de: 'SUV / Kombi', en: 'SUV / Station Wagon', sq: 'SUV / Karavan', es: 'SUV / Familiar', it: 'SUV / Station Wagon', fr: 'SUV / Break', tr: 'SUV / Station Wagon', bs: 'SUV / Karavan' }[lang] || 'SUV / Kombi',
            upcharge: 10, emoji: '🚙'
        },
        van: {
            id: 'van',
            label: { de: 'Transporter / Bus', en: 'Van / Bus', sq: 'Van / Autobus', es: 'Furgoneta / Autobús', it: 'Furgone / Autobus', fr: 'Fourgon / Bus', tr: 'Panelvan / Otobüs', bs: 'Kombi / Autobus' }[lang] || 'Transporter / Bus',
            upcharge: 25, emoji: '🚐'
        }
    };

    const [withWax, setWithWax] = useState(false);
    const [carType, setCarType] = useState('sedan');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [errors, setErrors] = useState([]);
    const cartEndRef = useRef(null);
    const navigate = useNavigate();
    const t = translations[lang] || translations.de;

    const textColor = darkMode ? 'text-white' : 'text-[#1d1d1f]';
    const subTextColor = darkMode ? 'text-white/40' : 'text-black/40';
    const cardGlass = darkMode
        ? 'bg-white/[0.04] border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl'
        : 'bg-white/80 border-white/80 shadow-[0_8px_40px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl';

    const getPrice = (baseName) => {
        let basePrice = (baseName === t.interior || baseName === t.exterior) ? 20 : baseName === t.signatureCombo ? 35 : 0;
        let final = basePrice + CAR_TYPES[carType].upcharge;
        if (withWax && (baseName === t.exterior || baseName === t.signatureCombo || baseName === t.interior)) final += 2;
        return final;
    };

    useEffect(() => {
        setCart(prevCart => prevCart.map(item => {
            const isInterior = item.name.includes(t.interior);
            const isExterior = item.name.includes(t.exterior);
            const isCombo = item.name.includes(t.signatureCombo);
            if (isInterior || isExterior || isCombo) {
                const baseName = isInterior ? t.interior : isExterior ? t.exterior : t.signatureCombo;
                const newPrice = getPrice(baseName);
                const suffix = withWax ? " + Premium Wax" : "";
                const typeLabel = ` (${CAR_TYPES[carType].label})`;
                return { ...item, name: `${baseName}${suffix}${typeLabel}`, price: newPrice };
            }
            return item;
        }));
    }, [withWax, carType]);

    useEffect(() => {
        if (isCartOpen) cartEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [cart?.length, isCartOpen]);

    const handleSelect = (moduleName) => {
        const finalPrice = getPrice(moduleName);
        const suffix = withWax ? " + Premium Wax" : "";
        const typeLabel = ` (${CAR_TYPES[carType].label})`;
        setCart(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name: `${moduleName}${suffix}${typeLabel}`, price: finalPrice, carModel: '' }]);
        setIsCartOpen(true);
    };

    const updateCarModel = (id, model) => {
        if (model.trim() !== "") setErrors(prev => prev.filter(errId => errId !== id));
        setCart(cart.map(item => item.id === id ? { ...item, carModel: model } : item));
    };

    const removeItem = (id) => {
        const updated = cart.filter(item => item.id !== id);
        setCart(updated);
        setErrors(prev => prev.filter(errId => errId !== id));
        if (updated.length === 0) setIsCartOpen(false);
    };

    const validateAndSubmit = () => {
        const missing = cart.filter(item => !item.carModel || item.carModel.trim() === "").map(item => item.id);
        if (missing.length > 0) { setErrors(missing); return; }
        setIsCartOpen(false);
        navigate('/#kontakt');
    };

    const shakeVariants = { error: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } } };

    return (
        <div className={`pt-32 pb-40 px-6 min-h-screen max-w-7xl mx-auto transition-all duration-700 ${textColor} relative`}>

            {/* Background glows */}
            <div className={`fixed top-1/4 right-0 w-80 h-80 rounded-full blur-[150px] pointer-events-none ${darkMode ? 'bg-blue-600/8' : 'bg-blue-300/10'}`} />
            <div className={`fixed bottom-1/4 left-0 w-64 h-64 rounded-full blur-[120px] pointer-events-none ${darkMode ? 'bg-indigo-500/6' : 'bg-sky-200/12'}`} />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 relative z-10">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 ${darkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    {lang === 'de' ? 'Transparente Preise' : 'Transparent pricing'}
                </div>
                <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4">
                    {t.tarifeTitle.split(' ')[0]}{' '}
                    <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">{t.tarifeTitle.split(' ')[1]}</span>
                </h2>
                <p className={`${subTextColor} font-bold uppercase tracking-[0.5em] text-[10px] mb-4`}>{t.tarifeSub}</p>
                <p className={`text-sm max-w-lg mx-auto font-medium leading-relaxed ${darkMode ? 'text-white/35' : 'text-black/40'}`}>
                    {lang === 'de'
                        ? 'Keine versteckten Kosten. Konfigurieren Sie Ihr Paket — der Endpreis wird sofort angezeigt.'
                        : 'No hidden costs. Configure your package — the final price is shown instantly.'}
                </p>
            </motion.div>

            {/* Configurator */}
            <div className="flex flex-col items-center gap-6 mb-16 relative z-10">

                {/* Car Type Switcher */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <p className={`text-center text-[9px] font-black uppercase tracking-[0.3em] mb-3 ${darkMode ? 'text-white/25' : 'text-black/30'}`}>
                        {lang === 'de' ? '01 — Fahrzeugtyp wählen' : '01 — Select vehicle type'}
                    </p>
                    <div className={`${cardGlass} p-2 rounded-[2rem] flex flex-wrap justify-center gap-2 border max-w-3xl`}>
                        {Object.values(CAR_TYPES).map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setCarType(type.id)}
                                className={`relative px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors duration-200 z-10 ${carType === type.id ? 'text-white' : (darkMode ? 'text-white/30 hover:text-white/60' : 'text-black/35 hover:text-black/60')}`}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <span>{type.emoji}</span>
                                    {type.label}
                                    {type.upcharge > 0 && <span className={`text-[8px] ${carType === type.id ? 'text-blue-200' : 'text-blue-500'}`}>+{type.upcharge}€</span>}
                                    {type.upcharge < 0 && <span className={`text-[8px] ${carType === type.id ? 'text-green-200' : 'text-green-500'}`}>{type.upcharge}€</span>}
                                </span>
                                {carType === type.id && (
                                    <motion.div layoutId="activeCarTab" className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Wax Toggle */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <p className={`text-center text-[9px] font-black uppercase tracking-[0.3em] mb-3 ${darkMode ? 'text-white/25' : 'text-black/30'}`}>
                        {lang === 'de' ? '02 — Premium Upgrade' : '02 — Premium upgrade'}
                    </p>
                    <button
                        onClick={() => setWithWax(!withWax)}
                        className={`${cardGlass} px-10 py-4 rounded-2xl flex items-center gap-5 border-2 transition-all duration-500 ${withWax ? 'border-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.2)]' : (darkMode ? 'border-white/8 hover:border-white/20' : 'border-black/6 hover:border-blue-300/40')}`}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${withWax ? 'bg-blue-500 border-blue-400' : (darkMode ? 'border-white/20' : 'border-black/20')}`}>
                            {withWax && (
                                <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </motion.svg>
                            )}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest italic">
                            {t.premiumWax}
                            <span className="text-blue-500 ml-2">+2€</span>
                        </span>
                        <span className="text-lg">✨</span>
                    </button>
                </motion.div>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left relative z-10">
                <ServiceCard title={t.interior} price={getPrice(t.interior)} onSelect={() => handleSelect(t.interior)} t={t} cardGlass={cardGlass} icon="interior" darkMode={darkMode} lang={lang} />
                <ServiceCard title={t.exterior} price={getPrice(t.exterior)} onSelect={() => handleSelect(t.exterior)} t={t} cardGlass={cardGlass} icon="exterior" darkMode={darkMode} lang={lang} />
                <ServiceCard title={t.polishing} price={80} isComingSoon t={t} cardGlass={cardGlass} icon="polish" darkMode={darkMode} lang={lang} />

                {/* Signature Combo */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`${cardGlass} md:col-span-12 p-10 md:p-14 rounded-[3.5rem] border-2 border-blue-500/20 bg-gradient-to-br from-blue-600/8 via-transparent to-transparent flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500 hover:shadow-[0_0_60px_rgba(37,99,235,0.08)]`}
                >
                    {/* Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/8 blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex-1 z-10">
                        <div className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 inline-flex items-center gap-2">
                            <span>⭐</span> {t.bestValue}
                        </div>
                        <h3 className="text-5xl md:text-7xl font-black italic uppercase mb-6 leading-[0.9]">
                            {t.signatureCombo.split(' ')[0]}<br />
                            <span className="text-blue-500">{t.signatureCombo.split(' ')[1]}</span>
                        </h3>
                        <div className="flex items-baseline gap-4 mb-4">
                            <motion.div key={getPrice(t.signatureCombo)} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-6xl font-black italic text-blue-500">
                                {getPrice(t.signatureCombo)}€
                            </motion.div>
                            <div className={`text-sm font-bold line-through ${darkMode ? 'text-white/20' : 'text-black/20'}`}>
                                {getPrice(t.interior) + getPrice(t.exterior)}€
                            </div>
                            <div className="text-xs font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                {lang === 'de' ? 'Gespart' : 'Saved'} {getPrice(t.interior) + getPrice(t.exterior) - getPrice(t.signatureCombo)}€
                            </div>
                        </div>
                        {withWax && <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-lg inline-block border border-blue-400/20">{lang === 'de' ? 'Inkl. Premium Wax' : 'Incl. Premium Wax'} ✨</span>}
                    </div>

                    <div className="flex-1 w-full z-10 flex flex-col gap-6">
                        <p className={`${subTextColor} text-[11px] font-bold uppercase tracking-widest leading-loose`}>{t.comboDesc}</p>

                        {/* Included features */}
                        <div className="space-y-2">
                            {[
                                lang === 'de' ? 'Komplette Innenreinigung' : 'Complete interior cleaning',
                                lang === 'de' ? 'Komplette Außenwäsche' : 'Complete exterior wash',
                                lang === 'de' ? 'Felgen & Reifen gereinigt' : 'Wheels & tyres cleaned',
                                lang === 'de' ? 'Scheiben kristallklar' : 'Windows crystal clear',
                            ].map((feat, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-black/50'}`}>{feat}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleSelect(t.signatureCombo)}
                            className={`w-full py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl hover:scale-[1.01] hover:shadow-2xl ${darkMode ? 'bg-white text-black hover:bg-blue-600 hover:text-white' : 'bg-black text-white hover:bg-blue-600'}`}
                        >
                            {t.kombiBooking} →
                        </button>
                    </div>
                </motion.div>

                {/* RS Shop Coming Soon */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`${cardGlass} md:col-span-12 p-10 md:p-12 rounded-[3.5rem] border border-dashed border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden`}
                >
                    <div className="flex-1 z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <h3 className={`text-4xl md:text-5xl font-black uppercase italic ${darkMode ? 'text-white/20' : 'text-black/20'}`}>RS Shop</h3>
                            <span className="bg-blue-500/10 text-blue-500 px-4 py-1 rounded-full text-[9px] font-black uppercase italic tracking-widest border border-blue-500/20">{t.comingSoon}</span>
                        </div>
                        <p className={`${subTextColor} text-xs font-bold uppercase tracking-[0.2em] max-w-xl leading-relaxed`}>
                            {lang === 'en' ? 'Exclusive high-end care products for home. Coming soon.' : 'Exklusive High-End Pflegeprodukte für zuhause. Demnächst verfügbar.'}
                        </p>
                    </div>
                    <button disabled className={`px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest cursor-not-allowed italic border ${darkMode ? 'bg-white/3 text-white/20 border-white/8' : 'bg-black/3 text-black/20 border-black/8'}`}>
                        {lang === 'en' ? 'Shop opening soon' : 'Shop Eröffnung folgt'}
                    </button>
                </motion.div>
            </div>

            {/* Floating Cart */}
            <div className="fixed bottom-32 md:bottom-10 left-6 z-[200]">
                <AnimatePresence>
                    {isCartOpen && cart?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -40, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
                            exit={{ opacity: 0, x: -40, scale: 0.95 }}
                            className="bg-[#080808]/96 backdrop-blur-3xl border border-white/15 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.9)] w-[85vw] md:w-[380px] mb-6 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.3em] italic">
                                    {t.cartTitle} ({cart.length})
                                </span>
                                <button onClick={() => setIsCartOpen(false)} className="text-white/20 hover:text-white/60 transition-colors w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/5">✕</button>
                            </div>

                            <div className="max-h-[280px] overflow-y-auto space-y-4 pr-1 text-left">
                                {cart.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        variants={shakeVariants}
                                        animate={errors.includes(item.id) ? "error" : ""}
                                        className={`bg-white/4 border p-5 rounded-2xl relative group transition-all duration-300 ${errors.includes(item.id) ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/6'}`}
                                    >
                                        <button onClick={() => removeItem(item.id)} className="absolute top-3 right-3 text-white/10 group-hover:text-red-500/70 transition-colors text-xs">✕</button>
                                        <p className="text-blue-400 text-[9px] font-black uppercase mb-1 italic tracking-tight">{item.name}</p>
                                        <p className="text-white/30 text-[8px] mb-3 font-bold uppercase tracking-widest">{item.price}€</p>
                                        <input
                                            type="text"
                                            placeholder={errors.includes(item.id) ? (lang === 'en' ? "PLEASE SPECIFY MODEL!" : "BITTE MODELL ANGEBEN!") : (lang === 'en' ? "BRAND & MODEL..." : "MARKE & MODELL...")}
                                            value={item.carModel}
                                            onChange={(e) => updateCarModel(item.id, e.target.value)}
                                            className={`bg-transparent text-white text-[10px] font-bold border-b focus:border-blue-500 outline-none w-full pb-1 uppercase italic transition-colors ${errors.includes(item.id) ? 'border-red-500/40 placeholder:text-red-400/40' : 'border-white/10 placeholder:text-white/15'}`}
                                        />
                                    </motion.div>
                                ))}
                                <div ref={cartEndRef} />
                            </div>

                            <div className="mt-6 pt-5 border-t border-white/8 flex justify-between items-end">
                                <div>
                                    <p className="text-[8px] font-black uppercase text-white/25 tracking-widest">{t.cartSubtotal}</p>
                                    <p className="text-4xl font-black italic text-white tracking-tighter">{cart.reduce((s, i) => s + i.price, 0)}€</p>
                                </div>
                                <button
                                    onClick={validateAndSubmit}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 italic transition-all active:scale-95 hover:shadow-[0_10px_30px_rgba(37,99,235,0.4)]"
                                >
                                    {t.cartAnfragen} →
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {cart?.length > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsCartOpen(!isCartOpen)}
                        className="bg-blue-600 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.5)] border-4 border-black relative group"
                    >
                        <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping opacity-30" />
                        <svg className="w-7 h-7 md:w-8 md:h-8 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="absolute -top-1 -right-1 bg-white text-blue-600 text-[10px] md:text-[12px] font-black w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-600 z-20">
                            {cart.length}
                        </span>
                    </motion.button>
                )}
            </div>
        </div>
    );
}

function ServiceCard({ title, price, onSelect, t, cardGlass, icon, darkMode, lang, isComingSoon }) {
    const iconEl = {
        interior: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" strokeWidth="2.5" /></svg>,
        exterior: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 19l9 2-9-18-9 18 9-2" strokeWidth="2.5" /></svg>,
        polish: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5" /></svg>,
    }[icon];

    const descriptions = {
        interior: { de: 'Sitze, Armaturenbrett, Teppiche, Scheiben — alles handgereinigt bis ins letzte Detail.', en: 'Seats, dashboard, carpets, windows — all hand-cleaned to the last detail.' },
        exterior: { de: 'Außenwäsche mit Zwei-Eimer-Methode, Felgen, Reifen und Scheiben — kratzerfreies Ergebnis garantiert.', en: 'Exterior wash with two-bucket method, wheels, tyres and glass — scratch-free result guaranteed.' },
        polish: { de: 'Tiefe Lackkratzer und Oxidation entfernen — für Hochglanz wie frisch vom Händler.', en: 'Remove deep paint scratches and oxidation — showroom gloss finish.' },
    }[icon];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${cardGlass} md:col-span-4 p-8 rounded-[2.5rem] flex flex-col border-2 transition-all duration-500 group ${
                isComingSoon
                    ? 'opacity-60 cursor-not-allowed border-white/5'
                    : 'hover:scale-[1.02] hover:border-blue-500/30 hover:shadow-[0_0_50px_rgba(59,130,246,0.08)] border-transparent'
            }`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`w-13 h-13 p-3.5 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 duration-500 ${isComingSoon ? 'grayscale bg-white/4 text-white/20' : (darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600')}`}>
                    {iconEl}
                </div>
                {!isComingSoon ? (
                    <motion.span key={price} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-black italic">
                        {price}€
                    </motion.span>
                ) : (
                    <span className={`text-[9px] font-black uppercase italic px-3 py-1.5 rounded-full border ${darkMode ? 'text-blue-400/60 border-blue-500/20 bg-blue-500/8' : 'text-blue-500 border-blue-200 bg-blue-50'}`}>{t.comingSoon}</span>
                )}
            </div>

            <h3 className="text-3xl font-black uppercase italic mb-3 tracking-tighter leading-none">{title}</h3>

            <p className={`text-xs leading-relaxed font-medium mb-6 flex-1 ${darkMode ? 'text-white/35' : 'text-black/40'}`}>
                {descriptions?.[lang] || descriptions?.['de']}
            </p>

            <button
                onClick={isComingSoon ? null : onSelect}
                disabled={isComingSoon}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic shadow-lg ${
                    isComingSoon
                        ? (darkMode ? 'bg-white/4 text-white/15 cursor-not-allowed' : 'bg-black/5 text-black/15 cursor-not-allowed')
                        : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_8px_30px_rgba(37,99,235,0.3)] active:scale-95'
                }`}
            >
                {isComingSoon ? t.comingSoon : `${t.chooseModule} +`}
            </button>
        </motion.div>
    );
}