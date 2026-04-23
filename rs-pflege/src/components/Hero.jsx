import { motion } from 'framer-motion';
import { translations } from '../translations';

export default function Hero({ darkMode, lang }) {
    const t = translations[lang] || translations.de;

    const textColor = darkMode ? 'text-white' : 'text-[#1d1d1f]';
    const subTextColor = darkMode ? 'text-white/60' : 'text-black/60';
    const glassClass = darkMode
        ? 'bg-white/[0.06] backdrop-blur-3xl border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]'
        : 'bg-white/50 backdrop-blur-3xl border-white/90 shadow-[0_8px_40px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,1)]';

    const titleParts = t.heroTitle.split(' ');

    return (
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">

            {/* Multi-layer glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px] ${darkMode ? 'bg-blue-600/[0.18]' : 'bg-blue-400/[0.22]'}`} />
                <div className={`absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full blur-[110px] ${darkMode ? 'bg-indigo-500/[0.10]' : 'bg-sky-300/[0.18]'}`} />
                <div className={`absolute bottom-1/3 right-1/3 w-[250px] h-[250px] rounded-full blur-[90px] ${darkMode ? 'bg-cyan-400/[0.07]' : 'bg-blue-200/[0.22]'}`} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
            >
                {/* Logo Glass Card */}
                <motion.div
                    whileHover={{ scale: 1.04, y: -4 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                    className={`${glassClass} p-10 md:p-14 rounded-[5rem] mb-12 inline-block border relative overflow-hidden`}
                >
                    <motion.div
                        className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
                        initial={{ x: '-130%' }}
                        animate={{ x: '230%' }}
                        transition={{ delay: 1.6, duration: 1.2, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
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
                            initial={{ opacity: 0, x: -24 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.18, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                            className="block"
                        >
                            {titleParts[0]}
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, x: 24 }}
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
                        className={`text-lg md:text-2xl font-bold ${subTextColor} mb-16 max-w-2xl mx-auto uppercase tracking-tighter leading-tight italic`}
                    >
                        {t.heroSub1} <br />
                        <span className="text-blue-500 opacity-100">{t.heroSub2}</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scaleX: 0.5 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 0.7, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
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

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.7, ease: 'easeInOut' }}
                    className={`w-px h-10 rounded-full bg-gradient-to-b from-blue-500/50 to-transparent`}
                />
            </motion.div>
        </section>
    );
}