import { motion } from 'framer-motion';
import { translations } from '../translations';

export default function About({ darkMode, lang }) {
    const t = translations[lang] || translations.de;

    const textColor = darkMode ? 'text-white' : 'text-[#1d1d1f]';
    const cardClass = darkMode
        ? 'bg-white/[0.05] border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.07)]'
        : 'bg-white/70 border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)]';

    return (
        <section id="about" className={`py-32 px-6 max-w-7xl mx-auto ${textColor} relative`}>

            {/* Ambient glow */}
            <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[130px] pointer-events-none ${darkMode ? 'bg-blue-600/[0.09]' : 'bg-blue-300/[0.18]'}`} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                {/* Left: Text */}
                <motion.div
                    initial={{ opacity: 0, x: -28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h2 className="text-5xl md:text-7xl font-black italic uppercase mb-8 leading-none">
                        {t.aboutTitle}<br />
                        <span className="text-blue-500 drop-shadow-[0_0_18px_rgba(59,130,246,0.35)]">
                            {t.aboutSubtitle}
                        </span>
                    </h2>

                    <p className={`text-lg font-medium opacity-70 mb-8 leading-relaxed`}>
                        {t.aboutText}
                    </p>

                    <div className="flex gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                            className={`${cardClass} p-6 rounded-3xl flex-1 text-center backdrop-blur-xl border`}
                        >
                            <div className="text-3xl font-black text-blue-500 mb-1 italic">100%</div>
                            <div className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                                {t.handwork}
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                            className={`${cardClass} p-6 rounded-3xl flex-1 text-center backdrop-blur-xl border`}
                        >
                            <div className="text-3xl font-black text-blue-500 mb-1 italic">VÖ, GM</div>
                            <div className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                                {t.local}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Right: Team Photo */}
                <motion.div
                    initial={{ opacity: 0, x: 28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`${cardClass} aspect-square rounded-[4rem] overflow-hidden group border relative backdrop-blur-xl`}
                >
                    <div className="w-full h-full bg-gradient-to-br from-blue-600/[0.15] via-blue-500/[0.05] to-indigo-600/[0.12] flex items-center justify-center relative">
                        {/* Swap with: <img src="/path/to/photo.jpg" className="object-cover w-full h-full" /> */}
                        <span className="text-blue-400/50 font-black italic text-xl group-hover:scale-110 transition-transform duration-700 z-10">
                            RS TEAM PHOTO
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/25 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
                        <motion.div
                            className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none"
                            initial={{ x: '-130%' }}
                            whileHover={{ x: '230%' }}
                            transition={{ duration: 0.9, ease: 'easeInOut' }}
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}