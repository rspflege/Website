import { motion } from 'framer-motion';
import { translations } from '../translations';

export default function Process({ darkMode, lang }) {
    const t = translations[lang] || translations.de;

    const stepIcons = ['🚿', '🧼', '💎', '✨'];
    const stepDetails = lang === 'de' ? [
        'Wir entfernen zuerst groben Schmutz und Sand schonend mit einem Hochdruckreiniger — bevor eine Bürste das Fahrzeug berührt.',
        'Zwei-Eimer-Methode und pH-neutrale Shampoos sorgen dafür, dass keine neuen Kratzer entstehen.',
        'Feinste Oberflächenbehandlung mit Profi-Produkten, die den Klarlack versiegeln und langfristig schützen.',
        'Wir dokumentieren das Ergebnis und Sie übernehmen ein Fahrzeug, das dem Showroom-Zustand entspricht.',
    ] : [
        'We first gently remove coarse dirt and sand with a pressure washer — before any brush ever touches the vehicle.',
        'Two-bucket method and pH-neutral shampoos ensure no new scratches are introduced.',
        'Fine surface treatment with professional products that seal and long-term protect the clear coat.',
        'We document the result and you receive a vehicle in true showroom condition.',
    ];

    const textColor = darkMode ? 'text-white' : 'text-black';
    const subTextColor = darkMode ? 'text-white/40' : 'text-black/40';
    const cardGlass = darkMode
        ? 'bg-white/[0.04] border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
        : 'bg-white/70 border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.9)]';

    return (
        <section id="process" className="py-32 px-6 relative overflow-hidden">
            {/* Background glows */}
            <div className={`absolute top-1/2 left-0 w-72 h-72 rounded-full blur-[130px] pointer-events-none ${darkMode ? 'bg-blue-600/10' : 'bg-blue-300/15'}`} />
            <div className={`absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-[120px] pointer-events-none ${darkMode ? 'bg-indigo-500/8' : 'bg-sky-300/12'}`} />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-20"
                >
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 ${darkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {lang === 'de' ? 'Unser Ablauf' : 'Our process'}
                    </div>
                    <h2 className={`text-4xl md:text-6xl font-black italic uppercase leading-none ${textColor}`}>
                        {t.processTitle} <span className="text-blue-500">{t.processTitleAccent}</span>
                    </h2>
                    <p className={`mt-4 text-xs font-black uppercase tracking-[0.4em] ${subTextColor}`}>
                        {t.processSubtitle}
                    </p>
                    <p className={`mt-6 text-sm leading-relaxed max-w-2xl font-medium ${darkMode ? 'text-white/45' : 'text-black/45'}`}>
                        {lang === 'de'
                            ? 'Jeder Handgriff folgt einem bewährten System. So stellen wir sicher, dass Ihr Fahrzeug immer das bestmögliche Ergebnis erhält — unabhängig vom Ausgangszustand.'
                            : 'Every step follows a proven system. This ensures your vehicle always receives the best possible result — regardless of its starting condition.'}
                    </p>
                </motion.div>

                {/* Timeline Steps */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {t.processSteps && t.processSteps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className={`relative p-8 rounded-[3rem] border ${cardGlass} backdrop-blur-xl group hover:border-blue-500/40 hover:shadow-[0_0_50px_rgba(59,130,246,0.08)] transition-all duration-500`}
                        >
                            {/* Step number */}
                            <span className={`absolute top-7 right-7 text-6xl font-black italic pointer-events-none transition-all duration-500 ${darkMode ? 'text-white/[0.04] group-hover:text-blue-500/20' : 'text-black/[0.04] group-hover:text-blue-500/20'}`}>
                                0{index + 1}
                            </span>

                            {/* Icon bubble */}
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl transition-transform duration-500 group-hover:scale-110 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                {stepIcons[index]}
                            </div>

                            {/* Step badge */}
                            <div className={`text-[8px] font-black uppercase tracking-[0.3em] mb-3 ${darkMode ? 'text-blue-400/60' : 'text-blue-500/70'}`}>
                                {lang === 'de' ? `Schritt ${index + 1}` : `Step ${index + 1}`}
                            </div>

                            <h3 className={`text-xl font-black italic uppercase mb-4 ${textColor}`}>
                                {step.title}
                            </h3>

                            <p className={`text-xs leading-relaxed font-medium mb-4 ${subTextColor} group-hover:text-blue-500/70 transition-colors duration-300`}>
                                {step.desc}
                            </p>

                            {/* Detail text */}
                            <p className={`text-[10px] leading-relaxed font-medium ${darkMode ? 'text-white/25' : 'text-black/30'}`}>
                                {stepDetails[index]}
                            </p>

                            {/* Connector */}
                            {index < (t.processSteps.length - 1) && (
                                <div className="hidden md:block absolute top-1/2 -right-3 z-10">
                                    <div className={`w-6 h-[2px] ${darkMode ? 'bg-gradient-to-r from-blue-500/40 to-transparent' : 'bg-gradient-to-r from-blue-400/50 to-transparent'}`} />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Bottom trust bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className={`mt-12 p-8 rounded-[2.5rem] border ${cardGlass} backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${darkMode ? 'bg-green-500/10' : 'bg-green-50'}`}>✅</div>
                        <div>
                            <p className={`text-sm font-black italic uppercase ${textColor}`}>
                                {lang === 'de' ? 'Ergebnis garantiert' : 'Result guaranteed'}
                            </p>
                            <p className={`text-[10px] font-medium mt-0.5 ${darkMode ? 'text-white/35' : 'text-black/40'}`}>
                                {lang === 'de' ? 'Nicht zufrieden? Wir kommen nochmal — kostenlos.' : 'Not satisfied? We come back — for free.'}
                            </p>
                        </div>
                    </div>
                    <div className={`h-px md:h-10 w-full md:w-px ${darkMode ? 'bg-white/5' : 'bg-black/5'}`} />
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>⏱️</div>
                        <div>
                            <p className={`text-sm font-black italic uppercase ${textColor}`}>
                                {lang === 'de' ? 'Express in 24h' : 'Express in 24h'}
                            </p>
                            <p className={`text-[10px] font-medium mt-0.5 ${darkMode ? 'text-white/35' : 'text-black/40'}`}>
                                {lang === 'de' ? 'Auf Wunsch auch Termin am gleichen Tag.' : 'Same-day appointments available on request.'}
                            </p>
                        </div>
                    </div>
                    <div className={`h-px md:h-10 w-full md:w-px ${darkMode ? 'bg-white/5' : 'bg-black/5'}`} />
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${darkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>🌍</div>
                        <div>
                            <p className={`text-sm font-black italic uppercase ${textColor}`}>
                                {lang === 'de' ? 'Vor Ort Service' : 'On-location service'}
                            </p>
                            <p className={`text-[10px] font-medium mt-0.5 ${darkMode ? 'text-white/35' : 'text-black/40'}`}>
                                {lang === 'de' ? 'Wir kommen zu Ihnen — VÖ, GM und Umgebung.' : 'We come to you — VÖ, GM and surrounding area.'}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}