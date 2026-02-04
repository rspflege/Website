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
    const [activeCategory, setActiveCategory] = useState("all"); // 'all' klein geschrieben für Key-Matching
    const [toasts, setToasts] = useState([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const searchInputRef = useRef(null);

    // DYNAMISCHE ÜBERSETZUNG (Wie in Navbar)
    const activeT = {
        ...(translations[lang] || translations.de),
        ...(shopTranslations[lang] || shopTranslations.de)
    };

    // --- MOUSE GLOW EFFECT ---
    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // --- SHORTCUT (STRG+K) ---
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

    // --- TAB TITEL ---
    useEffect(() => {
        const prevTitle = document.title;
        document.title = "RS SHOP | Official Store";
        return () => { document.title = prevTitle; };
    }, []);

    // --- KATEGORIEN (Jetzt nur noch Keys, die Übersetzung kommt aus shopTranslations.js) ---
    const categories = useMemo(() => [
        { name: "All", key: "all" },
        { name: "Scents", key: "care" }, // 'care' gemappt auf deine shopTranslations
        { name: "Exterior", key: "accessories" },
        { name: "Interior", key: "service" },
        { name: "Merch", key: "merch" }, // Falls 'merch' fehlt, in shopTranslations.js ergänzen
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
            message: activeT.sent // Nutzt "Gesendet" oder "Sent" aus den Translations
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
                                {/* Übersetzt den Kategorienamen im Hauptbereich */}
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
                        <button onClick={() => navigate('/')} className="group flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20 group-hover:opacity-100 group-hover:text-blue-500 transition-all duration-500 mb-4">
                                {activeT.mainHub}
                            </span>
                            <span className={`text-5xl md:text-8xl font-black italic uppercase tracking-tighter transition-all duration-700 ${darkMode ? 'text-white group-hover:text-blue-600' : 'text-black group-hover:text-blue-600'}`}>
                                RS-PFLEGE<span className="text-blue-600">.</span>AT
                            </span>
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}