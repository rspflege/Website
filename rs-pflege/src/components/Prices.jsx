import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { translations } from '../translations';

export default function Prices({ darkMode, lang, cart, setCart }) {
    // --- FAHRZEUGTYPEN KONFIGURATION ---
    const CAR_TYPES = {
        small: { id: 'small', label: 'Kleinwagen', upcharge: -5 },
        sedan: { id: 'sedan', label: 'Limousine', upcharge: 0 },
        suv: { id: 'suv', label: 'SUV / Kombi', upcharge: 10 },
        van: { id: 'van', label: 'Transporter / Bus', upcharge: 25 }
    };

    // --- STATES ---
    const [withWax, setWithWax] = useState(false);
    const [carType, setCarType] = useState('sedan');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const cartEndRef = useRef(null);
    const navigate = useNavigate();

    const t = translations[lang] || translations.de;

    // --- STYLING CONSTANTS ---
    const textColor = darkMode ? 'text-white' : 'text-[#1d1d1f]';
    const subTextColor = darkMode ? 'text-white/40' : 'text-black/40';
    const cardClass = darkMode
        ? 'bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 shadow-2xl'
        : 'bg-white/80 backdrop-blur-2xl border border-black/[0.05] shadow-xl';

    // --- DYNAMISCHE PREISLOGIK ---
    const getPrice = (baseName) => {
        let basePrice = 0;
        const currentType = CAR_TYPES[carType];

        if (baseName === t.interior || baseName === t.exterior) {
            basePrice = 20;
        } else if (baseName === t.signatureCombo) {
            basePrice = 35;
        }

        let final = basePrice + currentType.upcharge;

        if (withWax && (baseName === t.exterior || baseName === t.signatureCombo || baseName === t.interior)) {
            final += 2;
        }
        return final;
    };

    // --- AUTOMATISCHE PREISAKTUALISIERUNG IM WARENKORB ---
    useEffect(() => {
        setCart(prevCart => prevCart.map(item => {
            const isInterior = item.name.includes(t.interior);
            const isExterior = item.name.includes(t.exterior);
            const isCombo = item.name.includes(t.signatureCombo);

            if (isInterior || isExterior || isCombo) {
                let baseName = isInterior ? t.interior : isExterior ? t.exterior : t.signatureCombo;
                const newPrice = getPrice(baseName);
                const suffix = withWax ? " + Premium Wax" : "";
                const typeLabel = ` (${CAR_TYPES[carType].label})`;

                return {
                    ...item,
                    name: `${baseName}${suffix}${typeLabel}`,
                    price: newPrice
                };
            }
            return item;
        }));
    }, [withWax, carType]);

    useEffect(() => {
        if (isCartOpen) cartEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [cart?.length, isCartOpen]);

    // --- HANDLERS ---
    const handleSelect = (moduleName) => {
        const finalPrice = getPrice(moduleName);
        const suffix = withWax ? " + Premium Wax" : "";
        const typeLabel = ` (${CAR_TYPES[carType].label})`;

        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: `${moduleName}${suffix}${typeLabel}`,
            price: finalPrice,
            carModel: ''
        };

        setCart(prev => [...prev, newItem]);
        setIsCartOpen(true);
    };

    const updateCarModel = (id, model) => {
        setCart(cart.map(item => item.id === id ? { ...item, carModel: model } : item));
    };

    const removeItem = (id) => {
        const updated = cart.filter(item => item.id !== id);
        setCart(updated);
        if (updated.length === 0) setIsCartOpen(false);
    };

    const scrollToContact = () => {
        setIsCartOpen(false);
        navigate('/#kontakt');
    };

    return (
        <div className={`pt-32 pb-40 px-6 min-h-screen max-w-7xl mx-auto transition-all duration-700 ${textColor}`}>

            {/* --- HEADER --- */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4">
                    {t.tarifeTitle.split(' ')[0]} <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">{t.tarifeTitle.split(' ')[1]}</span>
                </h2>
                <p className={`${subTextColor} font-bold uppercase tracking-[0.5em] text-[10px]`}>{t.tarifeSub}</p>
            </motion.div>

            {/* --- CONFIGURATOR CONTROLS --- */}
            <div className="flex flex-col items-center justify-center gap-8 mb-20">

                {/* ANIMIERTER Car Type Switcher */}
                <div className={`${cardClass} p-2 rounded-[2rem] flex flex-wrap justify-center gap-2 border border-white/5 max-w-3xl relative`}>
                    {Object.values(CAR_TYPES).map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setCarType(type.id)}
                            className={`relative px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors duration-300 z-10 ${carType === type.id ? 'text-white' : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            <span className="relative z-10">{type.label}</span>
                            {carType === type.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Wax Toggle */}
                <button
                    onClick={() => setWithWax(!withWax)}
                    className={`${cardClass} px-10 py-4 rounded-full flex items-center gap-6 border-2 transition-all duration-500 ${withWax ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_40px_rgba(37,99,235,0.3)]' : 'border-transparent hover:border-white/20'}`}
                >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${withWax ? 'bg-blue-500 border-blue-400' : 'border-gray-400'}`}>
                        {withWax && (
                            <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                            </motion.svg>
                        )}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest italic">{t.premiumWax} <span className="text-blue-500 ml-1">+2€</span></span>
                </button>
            </div>

            {/* --- BENTO GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
                <ServiceCard
                    title={t.interior}
                    price={getPrice(t.interior)}
                    onSelect={() => handleSelect(t.interior)}
                    t={t} cardClass={cardClass} icon="interior"
                />
                <ServiceCard
                    title={t.exterior}
                    price={getPrice(t.exterior)}
                    onSelect={() => handleSelect(t.exterior)}
                    t={t} cardClass={cardClass} icon="exterior"
                />
                <ServiceCard
                    title={t.polishing}
                    price={80}
                    isComingSoon={true}
                    t={t} cardClass={cardClass} icon="polish"
                />

                {/* --- SIGNATURE COMBO --- */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`${cardClass} md:col-span-12 p-12 rounded-[3.5rem] bg-gradient-to-r from-blue-600/10 via-transparent to-transparent flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group transition-all duration-500`}
                >
                    <div className="flex-1 z-10">
                        <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 inline-block italic">{t.bestValue}</div>
                        <h3 className="text-5xl md:text-7xl font-black italic uppercase mb-6 leading-tight">
                            {t.signatureCombo.split(' ')[0]} <br />
                            <span className="text-blue-500">{t.signatureCombo.split(' ')[1]}</span>
                        </h3>
                        <div className="flex items-center gap-6">
                            <div className="text-6xl font-black italic text-blue-500">
                                {getPrice(t.signatureCombo)}€
                            </div>
                            {withWax && (
                                <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-400/10 px-3 py-1 rounded-lg animate-bounce">Inkl. Wax</span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 w-full z-10 flex flex-col gap-4">
                        <p className={`${subTextColor} text-[11px] font-bold uppercase tracking-widest leading-loose mb-4`}>{t.comboDesc}</p>
                        <button
                            onClick={() => handleSelect(t.signatureCombo)}
                            className={`w-full py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl ${darkMode ? 'bg-white text-black hover:bg-blue-600 hover:text-white' : 'bg-black text-white hover:bg-blue-600'}`}
                        >
                            {t.kombiBooking}
                        </button>
                    </div>
                </motion.div>

                {/* RS SHOP (Coming Soon) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`${cardClass} md:col-span-12 p-12 rounded-[3.5rem] bg-gradient-to-br from-gray-500/5 to-transparent flex flex-col md:flex-row justify-between items-center gap-12 relative overflow-hidden border-dashed border-2 border-gray-500/20`}
                >
                    <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <h3 className="text-4xl md:text-6xl font-black uppercase italic text-gray-500/50">RS Shop</h3>
                            <span className="bg-blue-500/10 text-blue-500 px-4 py-1 rounded-full text-[10px] font-black uppercase italic tracking-widest border border-blue-500/20">{t.comingSoon}</span>
                        </div>
                        <p className={`${subTextColor} text-xs md:text-sm font-bold uppercase tracking-[0.2em] max-w-xl leading-relaxed`}>
                            Exklusive High-End Pflegeprodukte für zuhause. Demnächst verfügbar.
                        </p>
                    </div>
                    <button disabled className="px-12 py-5 rounded-2xl bg-gray-500/10 text-gray-500 border border-gray-500/20 font-black uppercase text-[10px] tracking-widest cursor-not-allowed italic">
                        Shop Eröffnung folgt
                    </button>
                </motion.div>

                {/* PREMIUM MASTER (Coming Soon) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`${cardClass} md:col-span-12 p-12 rounded-[3.5rem] border-blue-500/20 bg-blue-600/[0.01] transition-all duration-500 opacity-70 group`}
                >
                    <div className="flex flex-col md:flex-row justify-between gap-12">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-6">
                                <h3 className="text-4xl md:text-5xl font-black uppercase italic text-gray-500">{t.premiumMaster}</h3>
                                <span className="bg-blue-500/10 text-blue-500 px-4 py-1 rounded-full text-[10px] font-black uppercase italic tracking-widest border border-blue-500/20">{t.comingSoon}</span>
                            </div>
                            <div className="flex flex-wrap gap-3 mb-8">
                                {t.tags.map(tag => (
                                    <span key={tag} className="text-[9px] font-black border border-gray-500/30 px-4 py-2 rounded-full uppercase opacity-40 group-hover:opacity-100 transition-opacity">
                                        ✓ {tag}
                                    </span>
                                ))}
                            </div>
                            <p className={`${subTextColor} text-xs font-medium uppercase tracking-[0.2em] max-w-2xl`}>{t.masterDesc}</p>
                        </div>
                        <div className="text-right flex flex-col justify-center items-end">
                            <div className="text-8xl font-black italic mb-6 tracking-tighter opacity-10 group-hover:opacity-20 transition-opacity">100€</div>
                            <button disabled className="px-12 py-6 rounded-2xl bg-gray-500/20 text-gray-500 font-black uppercase text-[10px] tracking-[0.3em] cursor-not-allowed italic border border-white/5">
                                Bald Reservieren
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* --- FLOATING WARENKORB --- */}
            <div className="fixed bottom-32 md:bottom-10 left-6 z-[200]">
                <AnimatePresence>
                    {isCartOpen && cart?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -50, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50, scale: 0.9 }}
                            className="bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/20 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] w-[85vw] md:w-[360px] mb-6 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.3em] italic">
                                    {t.cartTitle} ({cart.length})
                                </span>
                                <button onClick={() => setIsCartOpen(false)} className="text-white/20 hover:text-white transition-colors">✕</button>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 custom-scrollbar text-left">
                                {cart.map((item) => (
                                    <div key={item.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl relative group">
                                        <button onClick={() => removeItem(item.id)} className="absolute top-3 right-3 text-white/10 group-hover:text-red-500 transition-colors">✕</button>
                                        <p className="text-blue-400 text-[9px] font-black uppercase mb-1 italic tracking-tighter">{item.name}</p>
                                        <p className="text-white/40 text-[8px] mb-2 font-bold uppercase tracking-widest">{item.price}€</p>
                                        <input
                                            type="text"
                                            placeholder="MARKE & MODELL..."
                                            value={item.carModel}
                                            onChange={(e) => updateCarModel(item.id, e.target.value)}
                                            className="bg-transparent text-white text-[11px] font-bold border-b border-white/10 focus:border-blue-500 outline-none w-full pb-1 uppercase italic placeholder:text-white/10"
                                        />
                                    </div>
                                ))}
                                <div ref={cartEndRef} />
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
                                <div className="text-left">
                                    <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">{t.cartSubtotal}</p>
                                    <p className="text-3xl md:text-4xl font-black italic text-white tracking-tighter">{cart.reduce((s, i) => s + i.price, 0)}€</p>
                                </div>
                                <button onClick={scrollToContact} className="bg-blue-600 hover:bg-blue-500 text-white px-6 md:px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 italic transition-all active:scale-95">
                                    {t.cartAnfragen}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {cart?.length > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsCartOpen(!isCartOpen)}
                        className="bg-blue-600 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] border-4 border-black dark:border-white/5 relative group"
                    >
                        <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="absolute -top-1 -right-1 bg-white text-blue-600 text-[10px] md:text-[12px] font-black w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-600 z-20">
                            {cart.length}
                        </span>
                    </motion.button>
                )}
            </div>
        </div>
    );
}

function ServiceCard({ title, price, onSelect, t, cardClass, icon, isComingSoon }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${cardClass} md:col-span-4 p-8 rounded-[2.5rem] flex flex-col transition-all duration-500 group border-2 border-transparent
            ${isComingSoon ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] hover:border-blue-500/20'}`}
        >
            <div className="flex justify-between items-center mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isComingSoon ? 'grayscale bg-gray-500/10 text-gray-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {icon === 'interior' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" strokeWidth="2.5" /></svg>}
                    {icon === 'exterior' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 19l9 2-9-18-9 18 9-2" strokeWidth="2.5" /></svg>}
                    {icon === 'polish' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5" /></svg>}
                </div>
                {!isComingSoon && (
                    <motion.span
                        key={price} // Sorgt für eine kleine Animation beim Preiswechsel
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-black italic"
                    >
                        {price}€
                    </motion.span>
                )}
                {isComingSoon && <span className="text-[10px] font-black uppercase italic text-blue-500">{t.comingSoon}</span>}
            </div>
            <h3 className="text-3xl font-black uppercase italic mb-8 tracking-tighter leading-none">{title}</h3>
            <button
                onClick={isComingSoon ? null : onSelect}
                disabled={isComingSoon}
                className={`mt-auto w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-colors italic shadow-lg
                ${isComingSoon ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
            >
                {isComingSoon ? t.comingSoon : `${t.chooseModule} +`}
            </button>
        </motion.div>
    );
}