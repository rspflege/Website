import { motion } from 'framer-motion';
import { translations } from '../translations';

export default function Hero({ darkMode, lang }) {
    const t = translations[lang] || translations.de;

    const textColor = darkMode ? 'text-white' : 'text-[#1d1d1f]';
    const subTextColor = darkMode ? 'text-white/60' : 'text-black/60';
    const glassClass = darkMode
        ? 'bg-white/[0.06] backdrop-blur-3xl border-white/[0.08] shadow-[0_8px_60px_rgba(37,99,235,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]'
        : 'bg-white/50 backdrop-blur-3xl border-white/90 shadow-[0_8px_60px_rgba(37,99,235,0.12),inset_0_1px_0_rgba(255,255,255,1)]';

    const titleParts = t.heroTitle.split(' ');

    return (
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">

            {/* Glows — the big bottom one bleeds seamlessly into the next section */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.07, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[180px] ${darkMode ? 'bg-blue-600/[0.16]' : 'bg-blue-400/[0.20]'}`}
                />
                <motion.div
                    animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute top-1/3 left-1/4 w-[350px] h-[350px] rounded-full blur-[120px] ${darkMode ? 'bg-indigo-500/[0.10]' : 'bg-sky-300/[0.16]'}`}
                />
                <motion.div
                    animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
                    transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className={`absolute bottom-1/3 right-1/4 w-[250px] h-[250px] rounded-full blur-[100px] ${darkMode ? 'bg-cyan-400/[0.07]' : 'bg-blue-200/[0.20]'}`}
                />
                {/* The key fix: bottom fade dissolves hero into the next section */}
                <div className={`absolute bottom-0 left-0 right-0 h-56 pointer-events-none ${
                    darkMode
                        ? 'bg-gradient-to-t from-black via-black/70 to-transparent'
                        : 'bg-gradient-to-t from-[#fafafa] via-[#fafafa]/70 to-transparent'
                }`} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
            >
                {/* Logo card — rounded-[4rem] matches the cards in About/Process */}
                <motion.div
                    whileHover={{ scale: 1.04, y: -6 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className={`${glassClass} p-10 md:p-14 rounded-[4rem] mb-12 inline-block border relative overflow-hidden`}
                >
                    <motion.div
                        className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent pointer-events-none"
                        initial={{ x: '-130%' }}
                        animate={{ x: '230%' }}
                        transition={{ delay: 1.8, duration: 1.2, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
                    />
                    <img
                        src="/logo-rs.png"
                        alt="RS Pflege"
                        className="h-32 md:h-52 w-auto drop-shadow-[0_0_30px_rgba(59,130,246,0.32)] relative z-10"
                    />
                </motion.div>

                <div className="max-w-5xl">
                    <h1 className={`text-6xl md:text-[10rem] font-black tracking-[-0.05em] leading-[0.85] mb-10 uppercase italic ${textColor}`}>
                        <motion.span
                            initial={{ opacity: 0, x: -28 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.18, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                            className="block"
                        >
                            {titleParts[0]}
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, x: 28 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.32, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                            className="block text-blue-500 drop-shadow-[0_0_35px_rgba(59,130,246,0.45)]"
                        >
                            {titleParts[1]}
                        </motion.span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className={`text-lg md:text-2xl font-bold ${subTextColor} mb-14 max-w-2xl mx-auto uppercase tracking-tighter leading-tight italic`}
                    >
                        {t.heroSub1} <br />
                        <span className="text-blue-500 opacity-100">{t.heroSub2}</span>
                    </motion.p>

                    {/* CTA row — new addition, original style */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.7 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
                    >
                        <a
                            href="#kontakt"
                            onClick={(e) => { e.preventDefault(); document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' }); }}
                            className="px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-[0.25em] transition-all shadow-[0_6px_30px_rgba(37,99,235,0.4)] active:scale-95"
                        >
                            {t.contact}
                        </a>
                        <a
                            href="#about"
                            onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}
                            className={`px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.25em] border transition-all active:scale-95 ${
                                darkMode
                                    ? 'border-white/15 text-white/50 hover:border-white/30 hover:text-white'
                                    : 'border-black/12 text-black/40 hover:border-black/25 hover:text-black'
                            }`}
                        >
                            {t.about}
                        </a>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scaleX: 0.5 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 0.75, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center justify-center gap-6"
                    >
                        <div className="h-[2px] w-16 bg-gradient-to-r from-transparent to-blue-600 rounded-full" />
                        <span className={`text-[10px] font-black uppercase tracking-[0.8em] ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                            Est. Vöcklabruck 2026
                        </span>
                        <div className="h-[2px] w-16 bg-gradient-to-l from-transparent to-blue-600 rounded-full" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Scroll cue */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    className="w-px h-10 rounded-full bg-gradient-to-b from-blue-500/60 to-transparent"
                />
            </motion.div>
        </section>
    );
}