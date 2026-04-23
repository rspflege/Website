import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { translations } from '../translations';

export default function Hero({ darkMode, lang }) {
    const t = translations[lang] || translations.de;
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    const titleParts = t.heroTitle.split(' ');

    const stats = [
        { value: "100%", label: lang === 'de' ? 'Handarbeit' : 'Handwork' },
        { value: "∞", label: lang === 'de' ? 'Liebe zum Detail' : 'Attention to Detail' },
        { value: "24h", label: lang === 'de' ? 'Express-Service' : 'Express Service' },
    ];

    return (
        <section ref={ref} className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">

            {/* Layered Background Glows */}
            <motion.div style={{ y }} className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[180px] ${darkMode ? 'bg-blue-600/15' : 'bg-blue-400/20'}`} />
                <div className={`absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] ${darkMode ? 'bg-indigo-500/10' : 'bg-sky-300/15'}`} />
                <div className={`absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full blur-[100px] ${darkMode ? 'bg-cyan-400/8' : 'bg-blue-200/20'}`} />
            </motion.div>

            {/* Subtle grid overlay */}
            <div className={`absolute inset-0 pointer-events-none ${darkMode ? 'opacity-[0.02]' : 'opacity-[0.04]'}`}
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

            <motion.div style={{ opacity }} className="relative z-10 w-full max-w-6xl mx-auto">

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="flex justify-center mb-8"
                >
                    <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full border backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.25em] ${darkMode ? 'bg-white/5 border-white/10 text-white/70' : 'bg-white/60 border-black/8 text-black/60 shadow-lg'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />
                        {lang === 'de' ? 'Jetzt buchbar in Vöcklabruck' : 'Now booking in Vöcklabruck'}
                        <span className="opacity-40">•</span>
                        <span>Est. 2026</span>
                    </div>
                </motion.div>

                {/* Logo Glass Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-12 flex justify-center"
                >
                    <div className={`relative p-10 md:p-14 rounded-[4rem] inline-block group cursor-default ${darkMode
                        ? 'bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]'
                        : 'bg-white/70 border border-white/80 shadow-[0_20px_80px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]'
                        } backdrop-blur-3xl transition-all duration-700 hover:scale-105 hover:shadow-[0_0_120px_rgba(59,130,246,0.25)]`}>
                        {/* Inner glow on hover */}
                        <div className="absolute inset-0 rounded-[4rem] bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <img
                            src="/logo-rs.png"
                            alt="RS Pflege"
                            className="h-32 md:h-52 w-auto drop-shadow-[0_0_40px_rgba(59,130,246,0.4)] relative z-10"
                        />
                    </div>
                </motion.div>

                {/* Main Title */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-5xl mx-auto mb-8"
                >
                    <h1 className={`text-6xl md:text-[9rem] font-black tracking-[-0.05em] leading-[0.85] mb-10 uppercase italic ${darkMode ? 'text-white' : 'text-[#1d1d1f]'}`}>
                        {titleParts[0]}<br />
                        <span className="text-blue-500 drop-shadow-[0_0_40px_rgba(59,130,246,0.5)] relative">
                            {titleParts[1]}
                            {/* Shine sweep animation */}
                            <motion.span
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                                initial={{ x: '-100%' }}
                                animate={{ x: '200%' }}
                                transition={{ delay: 1.5, duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
                            />
                        </span>
                    </h1>

                    <p className={`text-lg md:text-2xl font-bold mb-6 max-w-2xl mx-auto uppercase tracking-tighter leading-tight italic ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                        {t.heroSub1} <br />
                        <span className="text-blue-500">{t.heroSub2}</span>
                    </p>

                    {/* Extended description */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className={`text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed mb-10 ${darkMode ? 'text-white/35' : 'text-black/40'}`}
                    >
                        {lang === 'de'
                            ? 'Wir behandeln Ihr Fahrzeug wie unser eigenes — mit Präzision, Premium-Produkten und echter Leidenschaft für Perfektion.'
                            : 'We treat your vehicle like our own — with precision, premium products and a genuine passion for perfection.'}
                    </motion.p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                    <a href="#kontakt"
                        className="group relative px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-[0_10px_40px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_60px_rgba(37,99,235,0.6)] transition-all duration-300 active:scale-95 overflow-hidden">
                        <span className="relative z-10">{lang === 'de' ? 'Termin buchen' : 'Book appointment'}</span>
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <a href="#about"
                        className={`px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] border-2 transition-all duration-300 active:scale-95 ${darkMode ? 'border-white/20 text-white/70 hover:border-blue-500 hover:text-blue-400' : 'border-black/15 text-black/60 hover:border-blue-500 hover:text-blue-600'}`}>
                        {lang === 'de' ? 'Mehr erfahren' : 'Learn more'}
                    </a>
                </motion.div>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    className="flex items-center justify-center gap-2 md:gap-4"
                >
                    {stats.map((stat, i) => (
                        <div key={i} className="flex items-center">
                            <div className={`text-center px-6 md:px-8 py-4 rounded-2xl backdrop-blur-xl border transition-all hover:scale-105 duration-300 ${darkMode
                                ? 'bg-white/5 border-white/8 hover:border-blue-500/30'
                                : 'bg-white/60 border-black/5 shadow-lg hover:border-blue-400/30'}`}>
                                <div className="text-xl md:text-2xl font-black italic text-blue-500 mb-0.5">{stat.value}</div>
                                <div className={`text-[8px] font-black uppercase tracking-widest ${darkMode ? 'text-white/30' : 'text-black/30'}`}>{stat.label}</div>
                            </div>
                            {i < stats.length - 1 && <div className={`w-px h-8 mx-1 ${darkMode ? 'bg-white/5' : 'bg-black/5'}`} />}
                        </div>
                    ))}
                </motion.div>

                {/* Bottom divider */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="flex items-center justify-center gap-6 mt-14"
                >
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-blue-500/50 rounded-full" />
                    <span className={`text-[9px] font-black uppercase tracking-[0.8em] ${darkMode ? 'text-white/20' : 'text-black/25'}`}>
                        Vöcklabruck · Gmunden · Oberösterreich
                    </span>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-blue-500/50 rounded-full" />
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className={`text-[8px] font-black uppercase tracking-[0.4em] ${darkMode ? 'text-white/15' : 'text-black/20'}`}>Scroll</span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1 ${darkMode ? 'border-white/10' : 'border-black/10'}`}
                >
                    <div className={`w-1 h-2 rounded-full ${darkMode ? 'bg-white/30' : 'bg-black/30'}`} />
                </motion.div>
            </motion.div>
        </section>
    );
}