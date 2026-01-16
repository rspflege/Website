import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { translations } from '../translations';

export default function Prices({ darkMode, lang, cart, setCart }) {
    const [withWax, setWithWax] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const cartEndRef = useRef(null);
    const navigate = useNavigate();

    const t = translations[lang] || translations.de;

    const textColor = darkMode ? 'text-white' : 'text-[#1d1d1f]';
    const subTextColor = darkMode ? 'text-white/40' : 'text-black/40';
    const cardClass = darkMode
        ? 'bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 shadow-2xl'
        : 'bg-white/80 backdrop-blur-2xl border border-black/[0.05] shadow-xl';

    // --- AUTOMATISCHE PREISAKTUALISIERUNG IM WARENKORB (Nur für Services) ---
    useEffect(() => {
        setCart(prevCart => prevCart.map(item => {
            if (item.type !== 'service') return item;

            const isEligible = item.name.includes(t.interior) ||
                item.name.includes(t.exterior) ||
                item.name.includes(t.signatureCombo);

            if (isEligible) {
                const baseName = item.name.replace(" + Premium Wax", "");
                const basePrice = baseName.includes(t.signatureCombo) ? 35 : 20;
                return {
                    ...item,
                    name: withWax ? `${baseName} + Premium Wax` : baseName,
                    price: withWax ? basePrice + 2 : basePrice
                };
            }
            return item;
        }));
    }, [withWax]);

    useEffect(() => {
        if (isCartOpen) cartEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [cart?.length, isCartOpen]);

    const addToCart = (name, price, type = 'service') => {
        const isEligibleService = type === 'service' && [t.interior, t.exterior, t.signatureCombo].includes(name);
        const finalName = withWax && isEligibleService ? `${name} + Premium Wax` : name;
        const finalPrice = withWax && isEligibleService ? price + 2 : price;

        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: finalName,
            price: finalPrice,
            type: type, // 'service' oder 'product'
            carModel: type === 'service' ? '' : null // Modell nur für Services nötig
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

    return (
        <div className={`pt-32 pb-40 px-6 min-h-screen max-w-7xl mx-auto transition-all duration-700 ${textColor}`}>

            {/* --- SECTION 1: TARIFE (SERVICES) --- */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4">
                    {t.tarifeTitle?.split(' ')[0] || "PREMIUM"} <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">{t.tarifeTitle?.split(' ')[1] || "TARIFE"}</span>
                </h2>
                <p className={`${subTextColor} font-bold uppercase tracking-[0.5em] text-[10px]`}>{t.tarifeSub}</p>
            </motion.div>

            {/* Wax Toggle */}
            <div className="flex justify-center mb-12">
                <button
                    onClick={() => setWithWax(!withWax)}
                    className={`${cardClass} px-8 py-4 rounded-full flex items-center gap-4 border-2 transition-all duration-500 ${withWax ? 'border-blue-500 bg-blue-500/10' : 'border-transparent hover:border-white/20'}`}
                >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${withWax ? 'bg-blue-500 border-blue-400' : 'border-gray-400'}`}>
                        {withWax && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest italic">{t.premiumWax} <span className="text-blue-500">+2€</span></span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-32">
                <ServiceCard title={t.interior} price={withWax ? 22 : 20} onSelect={() => addToCart(t.interior, 20)} t={t} cardClass={cardClass} icon="interior" />
                <ServiceCard title={t.exterior} price={withWax ? 22 : 20} onSelect={() => addToCart(t.exterior, 20)} t={t} cardClass={cardClass} icon="exterior" />
                <ServiceCard title={t.polishing} price={80} isComingSoon={true} t={t} cardClass={cardClass} icon="polish" />

                {/* Signature Combo */}
                <motion.div className={`${cardClass} md:col-span-12 p-10 rounded-[3rem] bg-gradient-to-r from-blue-600/10 to-transparent flex flex-col md:flex-row items-center gap-8`}>
                    <div className="flex-1">
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase mb-4 inline-block italic">{t.bestValue}</div>
                        <h3 className="text-5xl font-black italic uppercase mb-4">{t.signatureCombo}</h3>
                        <p className="text-4xl font-black text-blue-500 italic">{withWax ? '37€' : '35€'}</p>
                    </div>
                    <button onClick={() => addToCart(t.signatureCombo, 35)} className={`px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest ${darkMode ? 'bg-white text-black' : 'bg-black text-white'} hover:bg-blue-600 hover:text-white transition-all`}>
                        {t.kombiBooking}
                    </button>
                </motion.div>
            </div>

            {/* --- SECTION 2: SHOP (PRODUKTE) --- */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16 pt-16 border-t border-white/5">
                <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4">
                    {lang === 'en' ? 'OUR' : 'UNSERE'} <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">{lang === 'en' ? 'SHOP' : 'PRODUKTE'}</span>
                </h2>
                <p className={`${subTextColor} font-bold uppercase tracking-[0.5em] text-[10px]`}>{lang === 'en' ? 'Professional Equipment' : 'Professionelles Equipment'}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ProductCard name="Detailing Brush Set" price="14.99" t={t} cardClass={cardClass} />
                <ProductCard name="Microfiber Gold" price="9.99" t={t} cardClass={cardClass} />
                <ProductCard name="Premium Wheel Cleaner" price="19.99" t={t} cardClass={cardClass} />
            </div>

            {/* --- WARENKORB LOGIK (BLEIBT GLEICH) --- */}
            {/* ... (Warenkorb-Code wie in deinem Snippet, aber mit Check auf item.type für carModel Input) ... */}
            <div className="fixed bottom-32 md:bottom-10 left-6 z-[200]">
                <AnimatePresence>
                    {isCartOpen && cart?.length > 0 && (
                        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/20 p-6 rounded-[2.5rem] shadow-2xl w-[85vw] md:w-[360px] mb-6">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black uppercase text-blue-500 italic">{t.cartTitle} ({cart.length})</span>
                                <button onClick={() => setIsCartOpen(false)} className="text-white/20 hover:text-white transition-colors">✕</button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                                {cart.map((item) => (
                                    <div key={item.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl relative">
                                        <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-white/10 hover:text-red-500">✕</button>
                                        <p className="text-blue-400 text-[9px] font-black uppercase italic mb-1">{item.name}</p>
                                        <p className="text-white text-xs font-bold mb-2">{item.price}€</p>
                                        {item.type === 'service' && (
                                            <input
                                                type="text"
                                                placeholder="MARKE & MODELL..."
                                                value={item.carModel}
                                                onChange={(e) => updateCarModel(item.id, e.target.value)}
                                                className="bg-transparent text-white text-[10px] border-b border-white/10 outline-none w-full pb-1 uppercase italic placeholder:text-white/5"
                                            />
                                        )}
                                    </div>
                                ))}
                                <div ref={cartEndRef} />
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
                                <div>
                                    <p className="text-[8px] font-black uppercase text-white/30">{t.cartSubtotal}</p>
                                    <p className="text-3xl font-black italic text-white">{cart.reduce((s, i) => s + Number(i.price), 0).toFixed(2)}€</p>
                                </div>
                                <button onClick={() => { setIsCartOpen(false); navigate('/#kontakt'); }} className="bg-blue-600 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase italic transition-all active:scale-95">
                                    {t.cartAnfragen}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {cart?.length > 0 && (
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsCartOpen(!isCartOpen)} className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg relative">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        <span className="absolute -top-1 -right-1 bg-white text-blue-600 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-blue-600">
                            {cart.length}
                        </span>
                    </motion.button>
                )}
            </div>
        </div>
    );
}

// --- HILFS-KOMPONENTEN ---

function ServiceCard({ title, price, onSelect, t, cardClass, icon, isHighlight, isComingSoon }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`${cardClass} md:col-span-4 p-8 rounded-[2.5rem] flex flex-col transition-all group border-2 border-transparent ${isComingSoon ? 'opacity-70 grayscale' : 'hover:border-blue-500/20'}`}>
            <div className="flex justify-between items-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    {icon === 'interior' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" strokeWidth="2.5" /></svg>}
                    {icon === 'exterior' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 19l9 2-9-18-9 18 9-2" strokeWidth="2.5" /></svg>}
                    {icon === 'polish' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5" /></svg>}
                </div>
                <span className="text-2xl font-black italic">{isComingSoon ? '??' : `${price}€`}</span>
            </div>
            <h3 className="text-2xl font-black uppercase italic mb-8">{title}</h3>
            <button onClick={isComingSoon ? null : onSelect} disabled={isComingSoon} className={`w-full py-4 rounded-xl font-black text-[9px] uppercase tracking-widest italic ${isComingSoon ? 'bg-gray-500/20 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                {isComingSoon ? t.comingSoon : `${t.chooseModule} +`}
            </button>
        </motion.div>
    );
}

function ProductCard({ name, price, t, cardClass }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`${cardClass} p-8 rounded-[2.5rem] flex flex-col opacity-60 relative overflow-hidden group`}>
            {/* Coming Soon Overlay für Shop-Produkte */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-black uppercase text-[10px] italic tracking-widest transform -rotate-12 shadow-2xl">
                    {t.comingSoon}
                </span>
            </div>

            <div className="aspect-square bg-white/5 rounded-3xl mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h3 className="text-xl font-black uppercase italic mb-2">{name}</h3>
            <p className="text-blue-500 font-black italic mb-6">{price}€</p>
            <button disabled className="w-full py-4 rounded-xl bg-white/5 text-white/20 font-black text-[9px] uppercase tracking-widest italic">
                {t.comingSoon}
            </button>
        </motion.div>
    );
}