import { motion } from 'framer-motion';
import { translations } from '../translations';

export default function Process({ darkMode, lang }) {
    const t = translations[lang] || translations.de;

    // Icons bleiben hier, da sie sprachneutral sind
    const stepIcons = ['🚿', '🧼', '💎', '✨'];

    const textColor = darkMode ? 'text-white' : 'text-black';
    const subTextColor = darkMode ? 'text-white/40' : 'text-black/40';
    const glassClass = darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5';

    return (
        <section id="process" className="py-32 px-6 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="mb-20"
                >
                    {/* Übersetzungen aus t.processTitle und t.processTitleAccent */}
                    <h2 className={`text-4xl md:text-6xl font-black italic uppercase leading-none ${textColor}`}>
                        {t.processTitle} <span className="text-blue-500">{t.processTitleAccent}</span>
                    </h2>
                    <p className={`mt-4 text-xs font-black uppercase tracking-[0.4em] ${subTextColor}`}>
                        {t.processSubtitle}
                    </p>
                </motion.div>

                {/* Timeline Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Wir mappen direkt über das Array aus der translations.js */}
                    {t.processSteps && t.processSteps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            line="true"
                            viewport={{ once: true }}
                            className={`relative p-8 rounded-[3rem] border ${glassClass} backdrop-blur-sm group hover:border-blue-500/50 transition-colors duration-500`}
                        >
                            {/* Nummerierung dynamisch generieren (01, 02, etc.) */}
                            <span className="absolute top-8 right-8 text-5xl font-black italic opacity-5 text-blue-500 group-hover:opacity-20 transition-opacity uppercase">
                                0{index + 1}
                            </span>

                            <div className="text-4xl mb-6">{stepIcons[index]}</div>

                            <h3 className={`text-xl font-black italic uppercase mb-4 ${textColor}`}>
                                {step.title}
                            </h3>

                            <p className={`text-sm leading-relaxed font-bold ${subTextColor} group-hover:text-blue-500/80 transition-colors`}>
                                {step.desc}
                            </p>

                            {/* Connecting Line (Desktop) */}
                            {index < t.processSteps.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[2px] bg-gradient-to-r from-blue-500/50 to-transparent z-10"></div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}