import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import ShopHero from './shop-components/ShopHero';
import ProductCard from './shop-components/ProductCard';
import ShopNavbar from './shop-components/ShopNavbar';
import ToastContainer from './shop-components/ToastContainer';

import { translations } from './translations';
import { shopTranslations } from './shopTranslations';

export default function Shop({ darkMode, setDarkMode, lang, setLang, cart, setCart, user, setIsLoginOpen }) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [toasts, setToasts] = useState([]);
    const [scrollY, setScrollY] = useState(0);
    const searchInputRef = useRef(null);

    const activeT = {
        ...(translations[lang] || translations.de),
        ...(shopTranslations[lang] || shopTranslations.de)
    };

    const socialLinks = [
        {
            name: "Instagram",
            url: "https://instagram.com/dein-profil",
            icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
        },
        {
            name: "TikTok",
            url: "https://tiktok.com/@dein-profil",
            icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.31-.75.42-1.24 1.25-1.33 2.1-.1.7.07 1.42.44 2.01.45.83 1.28 1.43 2.2 1.61.83.1 1.68-.02 2.4-.46.74-.47 1.22-1.29 1.27-2.16.02-3.69.02-7.38.03-11.07z"
        },
        {
            name: "YouTube",
            url: "https://youtube.com/dein-kanal",
            icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
        }
    ];

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const prevTitle = document.title;
        document.title = "RS Shop — Official Store";
        return () => { document.title = prevTitle; };
    }, []);

    const categories = useMemo(() => [
        { name: activeT.categories?.all || "All", key: "all" },
        { name: "Scents", key: "care" },
        { name: "Exterior", key: "accessories" },
        { name: "Interior", key: "service" },
        { name: "Merch", key: "merch" },
        { name: "Parts", key: "parts" }
    ], [lang]);

    const products = [
        { id: 's1', name: "Midnight Scents Tree", catKey: "care", price: 4.90, tag: "Top", img: "https://images.unsplash.com/photo-1595079676339-1534802ad6cf?auto=format&fit=crop&q=80&w=400" },
        { id: 's2', name: "Hydro Gloss Wax", catKey: "accessories", price: 24.50, tag: "New", img: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=400" },
        { id: 's3', name: "RS Black Hoodie", catKey: "merch", price: 49.00, tag: "Drop", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400" },
        { id: 's4', name: "Crystal Vision Glass", catKey: "service", price: 12.90, tag: null, img: "https://images.unsplash.com/photo-1552650272-b8a34e21bc4b?auto=format&fit=crop&q=80&w=400" },
    ];

    const filteredProducts = useMemo(() => products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "all" || p.catKey === activeCategory;
        return matchesSearch && matchesCategory;
    }), [searchQuery, activeCategory]);

    const addToCart = (p) => {
        const cartId = Math.random().toString(36).substr(2, 9);
        setCart(prev => [...prev, { ...p, cartId, addedAt: Date.now() }]);
        setToasts(prev => [...prev, { id: cartId, name: p.name, img: p.img, message: activeT.sent }]);
    };

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    return (
        <div
            className={`min-h-screen relative transition-colors duration-700 ${darkMode ? 'bg-black text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'}`}
            style={{ fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' }}
        >
            {/* Ambient glow — whisper-quiet, Apple-style */}
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background: darkMode
                        ? 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(10,132,255,0.06) 0%, transparent 60%)'
                        : 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(0,122,255,0.04) 0%, transparent 60%)',
                }}
            />

            <ToastContainer toasts={toasts} removeToast={removeToast} darkMode={darkMode} />

            <ShopNavbar
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                lang={lang}
                setLang={setLang}
                cart={cart}
                setCart={setCart}
                user={user}
                setIsLoginOpen={setIsLoginOpen}
            />

            <div className="relative z-10">
                <ShopHero
                    lang={lang}
                    setSearchQuery={setSearchQuery}
                    darkMode={darkMode}
                    searchInputRef={searchInputRef}
                />

                {/* ─── Category Chips — Apple pill scrollbar ─── */}
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-10">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {categories.map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${
                                    activeCategory === cat.key
                                        ? 'bg-[#0A84FF] text-white'
                                        : darkMode
                                            ? 'bg-white/[0.07] text-white/60 hover:text-white hover:bg-white/[0.11]'
                                            : 'bg-black/[0.06] text-black/50 hover:text-black/80 hover:bg-black/[0.09]'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <main className="max-w-[1400px] mx-auto px-6 md:px-12 pb-40">

                    {/* Result count — subtle metadata */}
                    <div className="mb-8 flex items-center gap-3">
                        <p className={`text-[13px] font-medium ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                            {filteredProducts.length} {lang === 'en' ? 'results' : lang === 'de' ? 'Produkte' : 'Artikala'}
                        </p>
                        {(searchQuery || activeCategory !== 'all') && (
                            <button
                                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                                className="text-[13px] font-medium text-[#0A84FF] hover:underline underline-offset-2"
                            >
                                {lang === 'en' ? 'Clear' : lang === 'de' ? 'Zurücksetzen' : 'Reset'}
                            </button>
                        )}
                    </div>

                    {filteredProducts.length > 0 ? (
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.map((p) => (
                                    <ProductCard
                                        key={p.id}
                                        p={p}
                                        lang={lang}
                                        onAdd={addToCart}
                                        darkMode={darkMode}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-40 flex flex-col items-center gap-4"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
                                className={`w-12 h-12 ${darkMode ? 'text-white/15' : 'text-black/15'}`}>
                                <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" strokeLinecap="round"/>
                            </svg>
                            <p className={`text-[17px] font-medium ${darkMode ? 'text-white/25' : 'text-black/25'}`}>
                                {lang === 'en' ? 'No results' : lang === 'de' ? 'Keine Ergebnisse' : 'Nema rezultata'}
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                                className="text-[14px] font-medium text-[#0A84FF] hover:underline underline-offset-2"
                            >
                                {lang === 'en' ? 'Reset filter' : lang === 'de' ? 'Filter zurücksetzen' : 'Resetuj filter'}
                            </button>
                        </motion.div>
                    )}
                </main>

                {/* ─── Footer ─── */}
                <footer className={`pt-20 pb-14 border-t ${darkMode ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}>
                    <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col items-center gap-10">

                        {/* Wordmark — clean, confident */}
                        <button
                            onClick={() => navigate('/')}
                            className="group flex flex-col items-center gap-1.5"
                        >
                            <span className={`text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors ${
                                darkMode ? 'text-white/20 group-hover:text-[#0A84FF]' : 'text-black/20 group-hover:text-[#0071E3]'
                            }`}>
                                {activeT.mainHub}
                            </span>
                            <span className={`text-[38px] md:text-[54px] font-semibold tracking-tight leading-none transition-colors ${
                                darkMode ? 'text-white/70 group-hover:text-white' : 'text-[#1d1d1f]/70 group-hover:text-[#1d1d1f]'
                            }`}>
                                RS-Pflege<span className="text-[#0A84FF]">.</span>
                            </span>
                        </button>

                        {/* Social icons — minimal, Apple-style */}
                        <div className="flex gap-3">
                            {socialLinks.map(social => (
                                <motion.a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-200 ${
                                        darkMode
                                            ? 'border-white/[0.10] text-white/40 hover:text-white hover:border-white/20'
                                            : 'border-black/[0.10] text-black/40 hover:text-[#1d1d1f] hover:border-black/20'
                                    }`}
                                >
                                    <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                                        <path d={social.icon} />
                                    </svg>
                                </motion.a>
                            ))}
                        </div>

                        {/* Legal line */}
                        <p className={`text-[12px] font-medium ${darkMode ? 'text-white/15' : 'text-black/15'}`}>
                            © {new Date().getFullYear()} RS Pflege — Alle Rechte vorbehalten.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}