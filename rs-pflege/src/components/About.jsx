import { motion } from 'framer-motion';
import { translations } from '../translations';

export default function About({ darkMode, lang }) {
    const t = translations[lang] || translations.de;

    const textColor = darkMode ? 'text-white' : 'text-[#1d1d1f]';
    const cardGlass = darkMode
        ? 'bg-white/[0.04] border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
        : 'bg-white/70 border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]';

    const trustPoints = lang === 'de' ? [
        { icon: '🧴', title: 'Premium Produkte', desc: 'Ausschließlich professionelle Aufbereitungsprodukte, keine Discounter-Ware.' },
        { icon: '🕐', title: 'Pünktlich & Zuverlässig', desc: 'Vereinbarter Termin bedeutet: Wir erscheinen und liefern — jedes Mal.' },
        { icon: '📸', title: 'Vorher & Nachher Fotos', desc: 'Vollständige Transparenz — Sie sehen das Ergebnis und können es mit dem Ausgangszustand vergleichen.' },
        { icon: '🛡️', title: 'Garantierte Qualität', desc: 'Nicht zufrieden? Wir kommen nochmal — kostenlos. Das ist unser Versprechen.' },
    ] : [
        { icon: '🧴', title: 'Premium Products', desc: 'Only professional detailing products — no discount shelf fillers.' },
        { icon: '🕐', title: 'On Time & Reliable', desc: 'An appointment made is a commitment kept — every single time.' },
        { icon: '📸', title: 'Before & After Photos', desc: 'Full transparency — you see exactly what changed and how.' },
        { icon: '🛡️', title: 'Quality Guaranteed', desc: "Not satisfied? We come back — free of charge. That's our promise." },
    ];

    return (
        <section id="about" className={`py-32 px-6 max-w-7xl mx-auto ${textColor} relative`}>

            {/* Background accent */}
            <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[140px] pointer-events-none ${darkMode ? 'bg-blue-600/8' : 'bg-blue-400/12'}`} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
                {/* Left: Text */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 ${darkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        {lang === 'de' ? 'Wer wir sind' : 'Who we are'}
                    </div>

                    <h2 className="text-5xl md:text-7xl font-black italic uppercase mb-8 leading-[0.9]">
                        {t.aboutTitle}<br />
                        <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.35)]">
                            {t.aboutSubtitle}
                        </span>
                    </h2>

                    <p className={`text-base font-medium leading-relaxed mb-6 ${darkMode ? 'text-white/60' : 'text-black/55'}`}>
                        {t.aboutText}
                    </p>

                    <p className={`text-sm font-medium leading-relaxed mb-10 ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                        {lang === 'de'
                            ? 'Als junges, lokales Team aus Vöcklabruck und Gmunden kennen wir den Anspruch unserer Kunden. Jedes Fahrzeug, das unsere Hände verlässt, soll glänzen wie am ersten Tag — das ist unser Antrieb, nicht nur unser Beruf.'
                            : 'As a young, local team from Vöcklabruck and Gmunden, we understand our customers\' expectations. Every vehicle that leaves our hands should shine like day one — that\'s our drive, not just our job.'}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4">
                        {[
                            { value: '100%', label: t.handwork },
                            { value: 'VÖ, GM', label: t.local },
                            { value: '5★', label: lang === 'de' ? 'Bewertung' : 'Rating' },
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`${cardGlass} p-5 rounded-3xl flex-1 text-center backdrop-blur-xl border transition-all hover:scale-105 duration-500 hover:border-blue-400/30`}
                            >
                                <div className="text-2xl font-black text-blue-500 mb-1 italic">{s.value}</div>
                                <div className={`text-[8px] font-black uppercase tracking-widest ${darkMode ? 'text-white/30' : 'text-black/35'}`}>{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right: Team Photo */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`${cardGlass} aspect-square rounded-[4rem] overflow-hidden group border relative backdrop-blur-xl`}
                >
                    <div className="w-full h-full bg-gradient-to-br from-blue-600/20 via-blue-500/5 to-indigo-600/15 flex items-center justify-center relative">
                        <span className="text-blue-400/60 font-black italic text-xl group-hover:scale-110 transition-transform duration-700 z-10">
                            RS TEAM PHOTO
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-transparent opacity-40 group-hover:opacity-70 transition-opacity duration-700" />
                        {/* Corner badge */}
                        <div className={`absolute top-6 right-6 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-xl border ${darkMode ? 'bg-black/40 border-white/10 text-white/60' : 'bg-white/60 border-white/80 text-black/50'}`}>
                            {lang === 'de' ? 'Unser Team' : 'Our Team'}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Trust Grid */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <div className="text-center mb-10">
                    <h3 className={`text-3xl md:text-4xl font-black italic uppercase mb-3 ${textColor}`}>
                        {lang === 'de' ? 'Warum ' : 'Why '}
                        <span className="text-blue-500">{lang === 'de' ? 'RS Pflege?' : 'RS Care?'}</span>
                    </h3>
                    <p className={`text-xs font-bold uppercase tracking-[0.4em] ${darkMode ? 'text-white/30' : 'text-black/35'}`}>
                        {lang === 'de' ? 'Das unterscheidet uns' : 'What sets us apart'}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {trustPoints.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`${cardGlass} p-7 rounded-[2.5rem] backdrop-blur-xl border group hover:border-blue-400/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.08)] transition-all duration-500`}
                        >
                            <div className={`text-3xl mb-5 transition-transform duration-500 group-hover:scale-110 inline-block`}>{p.icon}</div>
                            <h4 className={`text-sm font-black italic uppercase mb-3 ${textColor}`}>{p.title}</h4>
                            <p className={`text-xs leading-relaxed ${darkMode ? 'text-white/40' : 'text-black/45'}`}>{p.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}