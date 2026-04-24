import { motion } from 'framer-motion';
import { translations } from '../translations';

export default function About({ darkMode, lang }) {
    const t = translations[lang] || translations.de;

    const textColor = darkMode ? 'text-white' : 'text-[#1d1d1f]';
    const cardClass = darkMode
        ? 'bg-white/[0.05] backdrop-blur-xl border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]'
        : 'bg-white/70 border-black/5 shadow-xl backdrop-blur-md';

    return (
        <section id="about" className={`py-32 px-6 max-w-7xl mx-auto ${textColor}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                {/* — Left: Text — */}
                <motion.div
                    initial={{ opacity: 0, x: -32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h2 className="text-5xl md:text-7xl font-black italic uppercase mb-8 leading-none">
                        {t.aboutTitle}<br />
                        <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.35)]">
                            {t.aboutSubtitle}
                        </span>
                    </h2>

                    <p className="text-lg font-medium opacity-70 mb-10 leading-relaxed">
                        {t.aboutText}
                    </p>

                    <div className="flex gap-4">
                        <motion.div
                            whileInView={{ opacity: 1, y: 0 }}
                            initial={{ opacity: 0, y: 20 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className={`${cardClass} p-6 rounded-3xl flex-1 text-center border transition-all duration-500 hover:scale-105 hover:shadow-[0_12px_40px_rgba(37,99,235,0.15)]`}
                        >
                            <div className="text-3xl font-black text-blue-500 mb-1 italic">100%</div>
                            <div className="text-[9px] font-black uppercase tracking-widest opacity-50">
                                {t.handwork}
                            </div>
                        </motion.div>

                        <motion.div
                            whileInView={{ opacity: 1, y: 0 }}
                            initial={{ opacity: 0, y: 20 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className={`${cardClass} p-6 rounded-3xl flex-1 text-center border transition-all duration-500 hover:scale-105 hover:shadow-[0_12px_40px_rgba(37,99,235,0.15)]`}
                        >
                            <div className="text-3xl font-black text-blue-500 mb-1 italic">VB, GM</div>
                            <div className="text-[9px] font-black uppercase tracking-widest opacity-50">
                                {t.local}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* — Right: Team photo card — rounder, animated on scroll — */}
                <motion.div
                    initial={{ opacity: 0, x: 32, scale: 0.97 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -6 }}
                    className={`${cardClass} aspect-square rounded-[4rem] overflow-hidden group border relative transition-all duration-700`}
                >
                    <div className="w-full h-full bg-blue-600/10 flex items-center justify-center relative">
                        {/* Swap with <img src="..." className="object-cover w-full h-full" /> when ready */}
                        <span className="text-blue-500 font-black italic text-2xl group-hover:scale-110 transition-transform duration-700 z-10">
                            RS TEAM PHOTO
                        </span>

                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />

                        {/* Shimmer sweep on hover */}
                        <motion.div
                            className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none"
                            initial={{ x: '-130%' }}
                            whileHover={{ x: '230%' }}
                            transition={{ duration: 0.9, ease: 'easeInOut' }}
                        />
                    </div>

                    {/* Floating availability badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className={`absolute bottom-5 left-5 right-5 flex items-center gap-3 px-5 py-3.5 rounded-2xl border ${
                            darkMode ? 'bg-black/60 border-white/10 backdrop-blur-xl' : 'bg-white/80 border-black/5 backdrop-blur-xl shadow-lg'
                        }`}
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse flex-shrink-0" />
                        <p className={`text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-white/70' : 'text-black/60'}`}>
                            {lang === 'de' ? 'Verfügbar für Buchungen' : lang === 'en' ? 'Available for bookings' : 'Disponibil'}
                        </p>
                    </motion.div>
                </motion.div>

            </div>
        </section>
    );
}