import { motion } from 'framer-motion';
import { translations } from '../translations';

export default function Process({ darkMode, lang }) {
    const t = translations[lang] || translations.de;

    const stepIcons = ['🚿', '🧼', '💎', '✨'];

    const textColor = darkMode ? 'text-white' : 'text-black';
    const subTextColor = darkMode ? 'text-white/40' : 'text-black/40';
    const glassCard = darkMode
        ? 'bg-white/[0.04] border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
        : 'bg-white/60 border-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)]';

    return (
        <section id="process" className="py-32 px-6 relative overflow-hidden">

            {/* Ambient glow */}
            <motion.div
                animate={{ x: [0, 20, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute top-1/2 -translate-y-1/2 left-0 w-72 h-72 rounded-full blur-[130px] pointer-events-none ${darkMode ? 'bg-blue-600/[0.10]' : 'bg-blue-300/[0.18]'}`}
            />

            <div className="max-w-7xl mx-auto">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, x: -28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-20"
                >
                    <h2 className={`text-4xl md:text-6xl font-black italic uppercase leading-none ${textColor}`}>
                        {t.processTitle}{' '}
                        <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                            {t.processTitleAccent}
                        </span>
                    </h2>
                    <p className={`mt-4 text-xs font-black uppercase tracking-[0.4em] ${subTextColor}`}>
                        {t.processSubtitle}
                    </p>
                </motion.div>

                {/* Step cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {t.processSteps && t.processSteps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 36 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ delay: index * 0.09, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ y: -6, transition: { type: 'spring', stiffness: 280, damping: 20 } }}
                            className={`relative p-8 rounded-[3.5rem] border backdrop-blur-xl ${glassCard} group transition-colors duration-500 hover:border-blue-500/30`}
                        >
                            {/* Shimmer sweep on hover */}
                            <motion.div
                                className="absolute inset-0 rounded-[3.5rem] -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none overflow-hidden"
                                initial={{ x: '-130%' }}
                                whileHover={{ x: '230%' }}
                                transition={{ duration: 0.85, ease: 'easeInOut' }}
                            />

                            {/* Ghost step number */}
                            <span className={`absolute top-8 right-8 text-5xl font-black italic pointer-events-none select-none transition-all duration-500 ${
                                darkMode ? 'text-white/[0.04] group-hover:text-blue-500/[0.20]' : 'text-black/[0.04] group-hover:text-blue-500/[0.18]'
                            }`}>
                                0{index + 1}
                            </span>

                            {/* Emoji icon */}
                            <motion.div
                                whileHover={{ scale: 1.2, rotate: 8 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 14 }}
                                className="text-4xl mb-6 inline-block"
                            >
                                {stepIcons[index]}
                            </motion.div>

                            <h3 className={`text-xl font-black italic uppercase mb-4 ${textColor}`}>
                                {step.title}
                            </h3>

                            <p className={`text-sm leading-relaxed font-bold ${subTextColor} group-hover:text-blue-500/70 transition-colors duration-300`}>
                                {step.desc}
                            </p>

                            {/* Connector arrow between cards — desktop only */}
                            {index < (t.processSteps?.length ?? 0) - 1 && (
                                <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-[2px] z-10 ${
                                    darkMode ? 'bg-gradient-to-r from-blue-500/40 to-transparent' : 'bg-gradient-to-r from-blue-400/50 to-transparent'
                                }`} />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}