import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { translations } from '../translations';

export default function About({ darkMode, lang }) {
    const t = translations[lang] || translations.de;

    // 3D tilt for the photo card
    const cardRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 160, damping: 28 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 160, damping: 28 });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

    const stats = [
        { value: '100%', label: t.handwork },
        { value: 'VB, GM', label: t.local },
    ];

    return (
        <section
            id="about"
            className="py-32 px-6"
            style={{ fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' }}
        >
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* — Left: Text — */}
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Eyebrow */}
                        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] mb-5 ${darkMode ? 'text-[#0A84FF]' : 'text-[#0071E3]'}`}>
                            {lang === 'de' ? 'Über uns' : lang === 'en' ? 'About us' : 'Rreth nesh'}
                        </p>

                        {/* Headline — Apple large serif weight */}
                        <h2
                            className={`font-semibold leading-[0.90] tracking-[-0.04em] mb-8 ${darkMode ? 'text-white' : 'text-[#1d1d1f]'}`}
                            style={{ fontSize: 'clamp(40px, 6vw, 68px)' }}
                        >
                            {t.aboutTitle}
                            <br />
                            <span className="text-[#0A84FF]">{t.aboutSubtitle}</span>
                        </h2>

                        {/* Body */}
                        <p
                            className={`text-[17px] leading-[1.65] mb-12 ${darkMode ? 'text-white/55' : 'text-[#1d1d1f]/55'}`}
                            style={{ letterSpacing: '-0.01em' }}
                        >
                            {t.aboutText}
                        </p>

                        {/* Stat pills */}
                        <div className="flex gap-4">
                            {stats.map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.15 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                    className={`flex-1 rounded-2xl px-6 py-5 border transition-all duration-300 ${
                                        darkMode
                                            ? 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.07]'
                                            : 'bg-white border-black/[0.06] shadow-sm hover:shadow-md'
                                    }`}
                                >
                                    <p className={`text-[22px] font-semibold tracking-tight text-[#0A84FF] mb-1`}>
                                        {s.value}
                                    </p>
                                    <p className={`text-[11px] font-medium uppercase tracking-[0.14em] ${darkMode ? 'text-white/35' : 'text-black/35'}`}>
                                        {s.label}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* — Right: 3D Photo Card — */}
                    <motion.div
                        ref={cardRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1200 }}
                        initial={{ opacity: 0, x: 24, scale: 0.96 }}
                        whileInView={{ opacity: 1, x: 0, scale: 1 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="cursor-default"
                    >
                        <div
                            className={`aspect-square rounded-[3rem] overflow-hidden border relative group ${
                                darkMode
                                    ? 'border-white/[0.10] shadow-[0_40px_100px_rgba(0,0,0,0.5)]'
                                    : 'border-white/70 shadow-[0_40px_100px_rgba(0,0,0,0.09)]'
                            }`}
                            style={{ backdropFilter: 'blur(20px)' }}
                        >
                            {/* Placeholder — replace with actual <img> */}
                            <div
                                className={`w-full h-full flex items-center justify-center relative ${
                                    darkMode ? 'bg-[#111]' : 'bg-[#f0f0f2]'
                                }`}
                            >
                                {/* Decorative grid */}
                                <div
                                    className="absolute inset-0 opacity-[0.025]"
                                    style={{
                                        backgroundImage: `linear-gradient(${darkMode ? 'white' : 'black'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? 'white' : 'black'} 1px, transparent 1px)`,
                                        backgroundSize: '48px 48px',
                                    }}
                                />

                                {/* Center icon */}
                                <div className="relative z-10 flex flex-col items-center gap-4">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border ${darkMode ? 'bg-white/[0.06] border-white/[0.10]' : 'bg-black/[0.04] border-black/[0.08]'}`}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
                                            className={`w-8 h-8 ${darkMode ? 'text-white/25' : 'text-black/20'}`}>
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" strokeLinecap="round"/>
                                        </svg>
                                    </div>
                                    <p className={`text-[12px] font-medium tracking-wide ${darkMode ? 'text-white/20' : 'text-black/20'}`}>
                                        RS Team Photo
                                    </p>
                                </div>

                                {/* Overlay gradient on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A84FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </div>

                            {/* Floating badge — "3D depth layer" */}
                            <motion.div
                                style={{ translateZ: 30 }}
                                className={`absolute bottom-6 left-6 right-6 px-5 py-4 rounded-2xl border flex items-center gap-3 ${
                                    darkMode
                                        ? 'bg-black/60 border-white/10'
                                        : 'bg-white/80 border-black/[0.06]'
                                }`}
                                style={{ backdropFilter: 'blur(20px)' }}
                            >
                                <div className="w-2.5 h-2.5 rounded-full bg-[#32D74B] shadow-[0_0_8px_rgba(50,215,75,0.8)] animate-pulse flex-shrink-0" />
                                <p className={`text-[12px] font-medium ${darkMode ? 'text-white/70' : 'text-black/60'}`}>
                                    {lang === 'de' ? 'Verfügbar für Buchungen' : lang === 'en' ? 'Available for bookings' : 'Disponibil para reservas'}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}