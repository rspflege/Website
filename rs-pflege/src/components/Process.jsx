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

            {/* Ambient glow — drifts slowly left/right */}
            <motion.div
                animate={{ x: [0, 30, 0], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute top-1/2 -translate-y-1/2 -left-20 w-80 h-80 rounded-full blur-[140px] pointer-events-none ${darkMode ? 'bg-blue-600/[0.10]' : 'bg-blue-300/[0.18]'}`}
            />
            <motion.div
                animate={{ x: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                className={`absolute top-1/4 right-0 w-64 h-64 rounded-full blur-[120px] pointer-events-none ${darkMode ? 'bg-indigo-500/[0.07]' : 'bg-sky-300/[0.12]'}`}
            />

            <div className="max-w-7xl mx-auto">

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-20"
                >
                    <h2 className={`text-4xl md:text-6xl font-black italic uppercase leading-none ${textColor}`}>
                        {t.processTitle}{' '}
                        <span className="text-blue-500 drop-shadow-[0_0_24px_rgba(59,130,246,0.45)]">
                            {t.processTitleAccent}
                        </span>
                    </h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.7 }}
                        className={`mt-4 text-xs font-black uppercase tracking-[0.4em] ${subTextColor}`}
                    >
                        {t.processSubtitle}
                    </motion.p>
                </motion.div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {t.processSteps && t.processSteps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 48, scale: 0.96 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{
                                delay: index * 0.1,
                                duration: 0.75,
                                ease: [0.16, 1, 0.3, 1]
                            }}
                            whileHover={{
                                y: -8,
                                transition: { type: 'spring', stiffness: 300, damping: 22 }
                            }}
                            className={`relative p-8 rounded-[3.5rem] border backdrop-blur-xl overflow-hidden ${glassCard} group cursor-default
                                transition-shadow duration-500
                                hover:shadow-[0_20px_60px_rgba(37,99,235,0.18),inset_0_1px_0_rgba(255,255,255,0.10)]
                                hover:border-blue-500/30`}
                        >
                            {/* Shimmer sweep on hover */}
                            <motion.div
                                className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none"
                                initial={{ x: '-140%' }}
                                whileHover={{ x: '240%' }}
                                transition={{ duration: 0.9, ease: 'easeInOut' }}
                            />

                            {/* Blue inner glow on hover */}
                            <motion.div
                                className="absolute inset-0 rounded-[3.5rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: darkMode
                                        ? 'radial-gradient(circle at 30% 30%, rgba(37,99,235,0.12) 0%, transparent 70%)'
                                        : 'radial-gradient(circle at 30% 30%, rgba(37,99,235,0.07) 0%, transparent 70%)'
                                }}
                            />

                            {/* Ghost step number */}
                            <motion.span
                                className={`absolute top-8 right-8 text-5xl font-black italic pointer-events-none select-none ${
                                    darkMode ? 'text-white/[0.04]' : 'text-black/[0.04]'
                                }`}
                                whileHover={{ color: darkMode ? 'rgba(59,130,246,0.22)' : 'rgba(37,99,235,0.18)' }}
                                transition={{ duration: 0.4 }}
                            >
                                0{index + 1}
                            </motion.span>

                            {/* Emoji */}
                            <motion.div
                                whileHover={{ scale: 1.22, rotate: 10 }}
                                transition={{ type: 'spring', stiffness: 340, damping: 14 }}
                                className="text-4xl mb-6 inline-block relative z-10"
                            >
                                {stepIcons[index]}
                            </motion.div>

                            <h3 className={`text-xl font-black italic uppercase mb-4 relative z-10 ${textColor}`}>
                                {step.title}
                            </h3>

                            <p className={`text-sm leading-relaxed font-bold relative z-10 ${subTextColor} group-hover:text-blue-500/70 transition-colors duration-400`}>
                                {step.desc}
                            </p>

                            {/* Connector line between cards */}
                            {index < (t.processSteps?.length ?? 0) - 1 && (
                                <motion.div
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    whileInView={{ scaleX: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    style={{ originX: 0 }}
                                    className={`hidden md:block absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-[2px] z-20 ${
                                        darkMode
                                            ? 'bg-gradient-to-r from-blue-500/50 to-transparent'
                                            : 'bg-gradient-to-r from-blue-400/60 to-transparent'
                                    }`}
                                />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}