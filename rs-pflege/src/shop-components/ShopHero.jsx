import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export default function ShopHero({ lang, setSearchQuery, darkMode, searchInputRef }) {
    // Mouse Tracking für den kranken Parallax-Effekt
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Glättung der Bewegung
    const springConfig = { damping: 25, stiffness: 150 };
    const dx = useSpring(mouseX, springConfig);
    const dy = useSpring(mouseY, springConfig);

    // Transformationen für den Glow und Titel
    const glowX = useTransform(dx, [-500, 500], [-100, 100]);
    const glowY = useTransform(dy, [-500, 500], [-100, 100]);
    const titleRotateX = useTransform(dy, [-500, 500], [5, -5]);
    const titleRotateY = useTransform(dx, [-500, 500], [-5, 5]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX - window.innerWidth / 2);
            mouseY.set(e.clientY - window.innerHeight / 2);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="relative pt-48 pb-32 px-6 max-w-7xl mx-auto overflow-visible perspective-1000">

            {/* DYNAMIC BACKGROUND GLOW (Folgt der Maus) */}
            <motion.div
                style={{ x: glowX, y: glowY }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000
                    ${darkMode ? 'bg-blue-600/20' : 'bg-blue-400/10'}`}
            />

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center relative z-10"
            >
                {/* Badge mit Floating Animation */}
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500 mb-8 bg-blue-500/10 px-6 py-2.5 rounded-full border border-blue-500/20 backdrop-blur-md inline-block">
                        {lang === 'en' ? 'Exclusive Access' : 'Exklusiver Zugang'}
                    </span>
                </motion.div>

                {/* Main Title mit 3D Tilt-Effekt */}
                <motion.div
                    style={{ rotateX: titleRotateX, rotateY: titleRotateY }}
                    className="relative mb-16 select-none"
                >
                    <h1 className={`text-7xl md:text-[11rem] font-black italic tracking-[-0.06em] leading-[0.8] text-center uppercase`}>
                        <span className={`${darkMode ? 'text-white' : 'text-black'} opacity-90`}>The </span>
                        <span className="relative inline-block">
                            <span className="text-blue-600 drop-shadow-[0_0_60px_rgba(37,99,235,0.4)]">RS SHOP</span>
                            {/* Subtiler Text-Schatten für Tiefe */}
                            <span className="absolute inset-0 text-blue-800/10 blur-xl translate-y-4 -z-10 uppercase">RS SHOP</span>
                        </span>
                    </h1>
                </motion.div>

                {/* Search Bar Container */}
                <div className="w-full max-w-2xl relative group">
                    {/* Pulsierender Border-Glow */}
                    <motion.div
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-[3rem] blur-lg transition duration-1000 group-hover:duration-200"
                    />

                    <div className="relative">
                        <input
                            ref={searchInputRef} // Verknüpfung mit der Ref aus Shop.jsx
                            type="text"
                            placeholder={lang === 'en' ? "Search Collection..." : "Kollektion durchsuchen..."}
                            className={`w-full backdrop-blur-[40px] border transition-all duration-700 rounded-[3rem] p-8 px-12 text-xl md:text-2xl outline-none font-bold tracking-tight text-center shadow-2xl
                                ${darkMode
                                    ? 'bg-black/40 border-white/10 text-white focus:bg-black/60 focus:border-blue-500/50'
                                    : 'bg-white/40 border-black/5 text-black focus:bg-white/60 focus:border-blue-500/30'
                                }`}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        {/* Animated Search Icon */}
                        <div className={`absolute left-8 top-1/2 -translate-y-1/2 transition-all duration-500 group-hover:scale-110 
                            ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Keyboard Shortcut Indicator */}
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-40 hidden md:block">
                            <span className={`text-[10px] font-black border rounded-lg px-2 py-1 flex items-center gap-1 ${darkMode ? 'border-white/20 text-white/50' : 'border-black/10 text-black/50'}`}>
                                <span>{navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'CTRL'}</span>
                                <span>+</span>
                                <span>K</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Info unter der Suche */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-12 overflow-hidden">
                    {[
                        { en: "Tracked Shipping", de: "Versicherter Versand" },
                        { en: "Premium Quality", de: "Premium Qualität" },
                        { en: "Secure Payment", de: "Sichere Zahlung" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 0.3, y: 0 }}
                            transition={{ delay: 0.6 + (i * 0.1) }}
                            className="flex items-center gap-2"
                        >
                            <span className="w-1 h-1 bg-blue-500 rounded-full" />
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-white' : 'text-black'}`}>
                                {lang === 'en' ? item.en : item.de}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}