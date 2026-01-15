import { motion } from 'framer-motion';
import { translations } from '../translations';

export default function Hero({ darkMode, lang }) {
    const t = translations[lang] || translations.de;

    const textColor = darkMode ? 'text-white' : 'text-[#1d1d1f]';
    const subTextColor = darkMode ? 'text-white/60' : 'text-black/60';
    const glassClass = darkMode ? 'apple-glass border-white/10' : 'bg-white/40 backdrop-blur-3xl border-black/5 shadow-2xl';

    // Teilt den Titel in zwei Wörter (für das blaue Highlight)
    const titleParts = t.heroTitle.split(' ');

    return (
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
            {/* Hintergrund-Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[150px] rounded-full z-0`}></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative z-10"
            >
                {/* Logo Glass Card */}
                <div className={`${glassClass} p-10 md:p-14 rounded-[5rem] mb-12 inline-block transition-transform hover:scale-105 duration-700`}>
                    <img
                        src="/logo-rs.png"
                        alt="RS Pflege"
                        className={`h-32 md:h-52 w-auto drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] ${darkMode ? '' : 'brightness-0'}`}
                    />
                </div>

                <div className="max-w-5xl">
                    <h1 className={`text-6xl md:text-[10rem] font-black tracking-[-0.05em] leading-[0.85] mb-10 uppercase italic ${textColor}`}>
                        {titleParts[0]} <br />
                        <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                            {titleParts[1]}
                        </span>
                    </h1>

                    <p className={`text-lg md:text-2xl font-bold ${subTextColor} mb-16 max-w-2xl mx-auto uppercase tracking-tighter leading-tight italic`}>
                        {t.heroSub1} <br />
                        <span className="text-blue-500 opacity-100">{t.heroSub2}</span>
                    </p>

                    <div className="flex items-center justify-center gap-6">
                        <div className="h-[2px] w-16 bg-blue-600 rounded-full"></div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.8em] ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                            Est. Vöcklabruck 2026
                        </span>
                        <div className="h-[2px] w-16 bg-blue-600 rounded-full"></div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}