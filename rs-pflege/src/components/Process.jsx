// ═══════════════════════════════════════════════════════════
// Process.jsx
// ═══════════════════════════════════════════════════════════
import { motion } from 'framer-motion';
import { translations } from '../translations';

const sf = { fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' };

const stepIcons = [
    // Snow foam
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/></svg>,
    // Hand wash
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M18 11.5V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v1.4M14 10.5V8a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" strokeLinecap="round"/><path d="M10 10.5V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v9" strokeLinecap="round"/><path d="M6 14v0c-.5 0-2 .5-2 2.5 0 2.485 1.343 4.5 3 5.5h8c1.657-1 3-3.015 3-5.5 0-2-1.5-2.5-2-2.5h-3v-1" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    // Clay bar
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M12 22V12M12 12 6.5 6.5M12 12l5.5-5.5" strokeLinecap="round"/><circle cx="12" cy="5" r="3"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/></svg>,
    // Wax / sealing
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M12 3 L4 9 L12 15 L20 9 Z" strokeLinejoin="round"/><path d="M4 14l8 5 8-5" strokeLinecap="round"/><path d="M4 19l8 5 8-5" strokeLinecap="round" className="opacity-50"/></svg>,
];

export function Process({ darkMode, lang }) {
    const t = translations[lang] || translations.de;

    return (
        <section id="process" className="py-32 px-6 relative overflow-hidden" style={sf}>
            {/* Ambient left glow */}
            <div className={`absolute top-1/2 -translate-y-1/2 -left-32 w-64 h-64 rounded-full blur-[120px] pointer-events-none ${darkMode ? 'bg-blue-600/[0.08]' : 'bg-blue-300/[0.14]'}`} />

            <div className="max-w-6xl mx-auto">
                {/* Section heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-16"
                >
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] mb-4 ${darkMode ? 'text-[#0A84FF]' : 'text-[#0071E3]'}`}>
                        {t.processSubtitle}
                    </p>
                    <h2
                        className={`font-semibold leading-[0.90] tracking-[-0.04em] ${darkMode ? 'text-white' : 'text-[#1d1d1f]'}`}
                        style={{ fontSize: 'clamp(38px, 5.5vw, 62px)' }}
                    >
                        {t.processTitle}{' '}
                        <span className="text-[#0A84FF]">{t.processTitleAccent}</span>
                    </h2>
                </motion.div>

                {/* Step cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {t.processSteps && t.processSteps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ delay: i * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ y: -4 }}
                            className={`relative p-7 rounded-2xl border transition-all duration-300 group ${
                                darkMode
                                    ? 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.12]'
                                    : 'bg-white border-black/[0.06] shadow-sm hover:shadow-md'
                            }`}
                        >
                            {/* Step number — large ghost text */}
                            <span
                                className={`absolute top-5 right-6 text-[42px] font-semibold tracking-tight select-none pointer-events-none transition-colors duration-300 ${
                                    darkMode
                                        ? 'text-white/[0.04] group-hover:text-[#0A84FF]/[0.12]'
                                        : 'text-black/[0.04] group-hover:text-[#0071E3]/[0.10]'
                                }`}
                            >
                                0{i + 1}
                            </span>

                            {/* Icon */}
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 ${
                                darkMode ? 'bg-[#0A84FF]/[0.12] text-[#0A84FF]' : 'bg-[#0071E3]/[0.08] text-[#0071E3]'
                            }`}>
                                {stepIcons[i]}
                            </div>

                            <h3 className={`text-[17px] font-semibold tracking-[-0.02em] mb-2.5 ${darkMode ? 'text-white' : 'text-[#1d1d1f]'}`}>
                                {step.title}
                            </h3>
                            <p className={`text-[14px] leading-[1.6] ${darkMode ? 'text-white/45' : 'text-black/45'}`}>
                                {step.desc}
                            </p>

                            {/* Connector line — only between cards on lg */}
                            {i < (t.processSteps.length - 1) && (
                                <div className={`hidden lg:block absolute top-[3.5rem] -right-2 w-4 h-[1px] ${darkMode ? 'bg-white/[0.10]' : 'bg-black/[0.08]'}`} />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Process;