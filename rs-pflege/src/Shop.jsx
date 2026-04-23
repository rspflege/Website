import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Komponenten
import ShopHero from './shop-components/ShopHero';
import ProductCard from './shop-components/ProductCard';
import ShopNavbar from './shop-components/ShopNavbar';
import ToastContainer from './shop-components/ToastContainer';

// NEU: Importiere die Übersetzungen
import { translations } from './translations';
import { shopTranslations } from './shopTranslations';

export default function Shop({ darkMode, setDarkMode, lang, setLang, cart, setCart, user, setIsLoginOpen }) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [toasts, setToasts] = useState([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const prevTitle = document.title;
        document.title = "RS SHOP | Official Store";
        return () => { document.title = prevTitle; };
    }, []);

    const categories = useMemo(() => [
        { name: "All", key: "all" },
        { name: "Scents", key: "care" },
        { name: "Exterior", key: "accessories" },
        { name: "Interior", key: "service" },
        { name: "Merch", key: "merch" },
        { name: "Parts", key: "parts" }
    ], []);

    const products = [
        { id: 's1', name: "Midnight Scents Tree", catKey: "care", price: 4.90, tag: "Top", img: "https://images.unsplash.com/photo-1595079676339-1534802ad6cf?auto=format&fit=crop&q=80&w=400" },
        { id: 's2', name: "Hydro Gloss Wax", catKey: "accessories", price: 24.50, tag: "New", img: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=400" },
        { id: 's3', name: "RS Black Hoodie", catKey: "merch", price: 49.00, tag: "Drop", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400" },
        { id: 's4', name: "Crystal Vision Glass", catKey: "service", price: 12.90, tag: null, img: "https://images.unsplash.com/photo-1552650272-b8a34e21bc4b?auto=format&fit=crop&q=80&w=400" },
    ];

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === "all" || p.catKey === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    const addToCart = (p) => {
        const cartId = Math.random().toString(36).substr(2, 9);
        const newItem = { ...p, cartId, addedAt: new Date().getTime() };
        setCart(prev => [...prev, newItem]);

        setToasts(prev => [...prev, {
            id: cartId,
            name: p.name,
            img: p.img,
            message: activeT.sent
        }]);
    };

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors duration-700 ${darkMode ? 'bg-[#050505] text-white' : 'bg-[#fcfcfc] text-black'} selection:bg-blue-500`}>

            <div
                className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000"
                style={{
                    background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, 
                        ${darkMode
                            ? 'rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0.1) 30%, transparent 70%'
                            : 'rgba(37, 99, 235, 0.12) 0%, rgba(37, 99, 235, 0.04) 40%, transparent 80%'}
                    )`,
                    mixBlendMode: darkMode ? 'screen' : 'multiply',
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

                <main className="max-w-[1600px] mx-auto px-6 md:px-12 pb-40 relative">
                    <div className="mb-12 flex justify-between items-end">
                        <div className="space-y-1">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Collection</h2>
                            <p className="text-sm font-bold tracking-tight">
                                {activeT.categories?.[activeCategory] || activeCategory}
                                <span className="mx-2 opacity-30">/</span>
                                {filteredProducts.length} {lang === 'en' ? 'Items' : (lang === 'de' ? 'Produkte' : 'Artikala')}
                            </p>
                        </div>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16">
                            <AnimatePresence mode='popLayout'>
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
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center">
                            <p className="text-4xl font-black italic opacity-10 uppercase tracking-tighter">
                                {lang === 'en' ? "No results found" : (lang === 'de' ? "Keine Ergebnisse" : "Nema rezultata")}
                            </p>
                            <button
                                onClick={() => { setSearchQuery(""); setActiveCategory("all") }}
                                className="mt-4 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:underline"
                            >
                                {lang === 'en' ? "Reset Filter" : (lang === 'de' ? "Zurücksetzen" : "Resetuj")}
                            </button>
                        </motion.div>
                    )}
                </main>

                <footer className={`py-32 border-t ${darkMode ? 'border-white/5' : 'border-black/5'} relative`}>
                    <div className="max-w-[1600px] mx-auto px-6 flex flex-col items-center">



                        {/* NAV BUTTON */}
                        <button onClick={() => navigate('/')} className="group flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20 group-hover:opacity-100 group-hover:text-blue-500 transition-all duration-500 mb-4">
                                {activeT.mainHub}
                            </span>
                            <span className={`text-5xl md:text-8xl font-black italic uppercase tracking-tighter transition-all duration-700 ${darkMode ? 'text-white group-hover:text-blue-600' : 'text-black group-hover:text-blue-600'}`}>
                                RS-PFLEGE<span className="text-blue-600">.</span>AT
                            </span>
                        </button>

                        <div className={`mt-5 text-[9px] font-bold uppercase tracking-[0.4em] ${darkMode ? 'text-white/10' : 'text-black/10'}`}>
                            © {new Date().getFullYear()} RS PFLEGE — ALL RIGHTS RESERVED.
                        </div>

                        {/* SOCIAL MEDIA ICONS */}
                        <div className="mt-16 flex gap-6 mb-16">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ y: -5, scale: 1.1 }}
                                    className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-center
                                        ${darkMode
                                            ? 'bg-white/5 border-white/10 text-white hover:border-blue-500 hover:text-blue-500'
                                            : 'bg-black/5 border-black/5 text-black hover:border-blue-600 hover:text-blue-600'
                                        }`}
                                >
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d={social.icon} />
                                    </svg>
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}