import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { translations } from '../translations';

// ─── Static config (outside component — never re-created) ─────────────────────
const COLORS = [
    { accent: '#06b6d4', tw: 'bg-cyan-500'   },
    { accent: '#3b82f6', tw: 'bg-blue-500'   },
    { accent: '#8b5cf6', tw: 'bg-violet-500' },
    { accent: '#6366f1', tw: 'bg-indigo-500' },
];

const FALLBACK_DETAILS = [
    [
        { label: 'Hochdruckreinigung', text: 'Präziser Wasserdruck entfernt Schmutz, schonend für alle Lacke.' },
        { label: 'Vor-Wäsche',         text: 'Einweichen & Einschäumen löst hartnäckige Rückstände.' },
        { label: 'Vorbereitung',        text: 'Radkästen & Felgen werden separat vorbehandelt.' },
    ],
    [
        { label: 'Zwei-Eimer-Methode', text: 'Verhindert Kratzer durch sauberes Waschwasser.' },
        { label: 'pH-neutral',          text: 'Premium-Shampoo schützt Lack und Versiegelung.' },
        { label: 'Hand-Wäsche',         text: 'Jeder Zentimeter wird sorgfältig von Hand gereinigt.' },
    ],
    [
        { label: 'Politur',             text: 'Maschinengestützte Politur entfernt Swirls & Mikrokratzer.' },
        { label: 'Tiefenglanz',         text: 'Schicht-für-Schicht-Aufbau für maximale Strahlkraft.' },
        { label: 'Lackpflege',          text: 'Natürliche Farbe wird wiederhergestellt & verstärkt.' },
    ],
    [
        { label: 'Versiegelung',        text: 'Langzeit-Schutz bis zu 12 Monate – hydrophob & UV-fest.' },
        { label: 'Lotuseffekt',         text: 'Wasser perlt ab, Schmutz haftet kaum noch.' },
        { label: 'UV-Schutz',           text: 'Konserviert Farbe und Glanz langfristig.' },
    ],
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function Process({ darkMode, lang }) {
    const t     = translations[lang] || translations.de;
    const steps = t.processSteps || [];
    const total = steps.length;

    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target:  containerRef,
        offset: ['start start', 'end end'],
    });

    const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.4 });
    const isDark = darkMode;

    return (
        <div ref={containerRef} style={{ height: `${(total + 1) * 100}vh` }}>
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col">

                {/* Background */}
                <div className="absolute inset-0 z-0 pointer-events-none" style={{
                    background: isDark
                        ? 'radial-gradient(ellipse 90% 70% at 15% 20%, rgba(59,130,246,0.09) 0%, transparent 65%), radial-gradient(ellipse 70% 60% at 85% 75%, rgba(139,92,246,0.07) 0%, transparent 65%)'
                        : 'radial-gradient(ellipse 90% 70% at 15% 20%, rgba(59,130,246,0.07) 0%, transparent 65%), radial-gradient(ellipse 70% 60% at 85% 75%, rgba(139,92,246,0.05) 0%, transparent 65%)',
                }} />

                {/* Dot grid */}
                <div className="absolute inset-0 z-0 pointer-events-none" style={{
                    backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'} 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                }} />

                {/* ── Header ── */}
                <header className="relative z-20 pt-8 pb-4 px-5 md:px-14 w-full max-w-7xl mx-auto">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.32em] border mb-4 ${
                                isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/25' : 'bg-blue-50 text-blue-600 border-blue-200'
                            }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                {lang === 'de' ? 'Unser Ablauf' : 'Our process'}
                            </div>
                            <h2 className={`text-4xl md:text-[3.5rem] lg:text-[4.8rem] font-black italic uppercase leading-[0.86] tracking-tighter ${isDark ? 'text-white' : 'text-[#0a0a0a]'}`}>
                                {t.processTitle}{' '}
                                <span style={{ color: '#3b82f6', textShadow: isDark ? '0 0 40px rgba(59,130,246,0.55)' : 'none' }}>
                                    {t.processTitleAccent}
                                </span>
                            </h2>
                        </div>
                        <StepCounter smooth={smooth} total={total} isDark={isDark} />
                    </div>
                    {/* Gradient divider */}
                    <div className="mt-5 h-px w-full" style={{
                        background: isDark
                            ? 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4) 30%, rgba(139,92,246,0.3) 70%, transparent)'
                            : 'linear-gradient(90deg, transparent, rgba(59,130,246,0.25) 30%, rgba(139,92,246,0.2) 70%, transparent)',
                    }} />
                </header>

                {/* ── Body ── */}
                <div className="relative flex-1 flex min-h-0 w-full max-w-7xl mx-auto">
                    <SideBar smooth={smooth} total={total} isDark={isDark} />
                    <div className="relative flex-1 px-4 md:px-10 py-4 overflow-hidden">
                        {steps.map((step, i) => (
                            <StepCard
                                key={i}
                                step={step}
                                index={i}
                                total={total}
                                smooth={smooth}
                                colors={COLORS[i] || COLORS[0]}
                                details={(step.details || FALLBACK_DETAILS[i] || []).slice(0, 3)}
                                isDark={isDark}
                                lang={lang}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Vertical sidebar progress ────────────────────────────────────────────────
// Uses a single height transform — extremely cheap
function SideBar({ smooth, total, isDark }) {
    const trackH = useTransform(smooth, [0, 1], ['0%', '100%']);
    const seg    = 1 / (total + 0.2);

    return (
        <div className="relative z-20 flex-shrink-0 w-8 md:w-12 flex flex-col items-center py-3">
            {/* BG line */}
            <div className={`absolute inset-y-3 w-[2px] rounded-full left-1/2 -translate-x-1/2 ${isDark ? 'bg-white/8' : 'bg-black/8'}`} />

            {/* Filled */}
            <motion.div
                className="absolute top-3 w-[2px] rounded-full left-1/2 -translate-x-1/2 bg-gradient-to-b from-cyan-500 via-blue-500 to-indigo-500"
                style={{ height: trackH, originY: 0 }}
            />

            {/* Nodes — each is its own cheap motion div, only scale + opacity */}
            {Array.from({ length: total }, (_, i) => {
                const pct = total > 1 ? (i / (total - 1)) * 100 : 50;
                const mid = i * seg + seg * 0.5;
                const sc  = useTransform(smooth, [mid - seg * 0.4, mid, mid + seg * 0.4], [0.7, 1.6, 0.7]);
                const op  = useTransform(smooth, [mid - seg * 0.4, mid, mid + seg * 0.4], [0.3, 1,   0.3]);
                return (
                    <motion.div
                        key={i}
                        style={{
                            scale: sc, opacity: op,
                            position: 'absolute',
                            top: `calc(${pct}% + 0.75rem - 5px)`,
                            left: '50%', translateX: '-50%',
                            width: 10, height: 10,
                            borderRadius: '50%',
                            border: `2px solid ${COLORS[i]?.accent}`,
                            background: COLORS[i]?.accent,
                            willChange: 'transform, opacity',
                        }}
                    />
                );
            })}
        </div>
    );
}

// ─── Individual step card ─────────────────────────────────────────────────────
function StepCard({ step, index, total, smooth, colors, details, isDark, lang }) {
    const seg = 1 / (total + 0.2);

    const isFirst = index === 0;
    const isLast  = index === total - 1;

    const eS = isFirst ? 0         : index * seg - seg * 0.06;
    const eE = isFirst ? seg * 0.3 : index * seg + seg * 0.2;
    const xS = isLast  ? 1.1       : (index + 1) * seg - seg * 0.06;
    const xE = isLast  ? 1.2       : (index + 1) * seg + seg * 0.1;

    const opacity = useTransform(smooth, [eS, eE, xS, xE], [0, 1, 1, 0]);
    const y       = useTransform(smooth, [eS, eE, xS, xE], [24, 0, 0, -16]);
    const scale   = useTransform(smooth, [eS, eE, xS, xE], [0.96, 1, 1, 0.97]);

    const tc = isDark ? 'text-white'   : 'text-[#0a0a0a]';
    const mc = isDark ? 'text-white/45' : 'text-black/45';

    return (
        <motion.div
            style={{
                opacity, y, scale,
                position: 'absolute', inset: 0,
                zIndex: index + 1,
                willChange: 'transform, opacity',
            }}
        >
            {/* Ghost number */}
            <div className="absolute bottom-0 right-0 select-none pointer-events-none overflow-hidden" aria-hidden>
                <span
                    className="font-black italic leading-none tabular-nums block"
                    style={{
                        fontSize: 'clamp(120px, 22vw, 280px)',
                        color: colors.accent,
                        opacity: isDark ? 0.04 : 0.045,
                        letterSpacing: '-0.06em',
                        lineHeight: 0.8,
                    }}
                >
                    {String(index + 1).padStart(2, '0')}
                </span>
            </div>

            {/* Card content */}
            <div className="relative h-full flex flex-col py-4 md:py-6">

                {/* ── Top: number + title ── */}
                <div className="flex items-start gap-5 md:gap-7 mb-5">
                    {/* Outlined number with accent glow */}
                    <div className="relative flex-shrink-0 mt-1">
                        <span
                            className="text-[3rem] md:text-[5rem] font-black italic leading-none select-none tabular-nums"
                            style={{
                                WebkitTextStroke: `2px ${colors.accent}`,
                                color: 'transparent',
                                letterSpacing: '-0.04em',
                                filter: `drop-shadow(0 0 16px ${colors.accent}55)`,
                            }}
                        >
                            {String(index + 1).padStart(2, '0')}
                        </span>
                    </div>

                    <div className="pt-1 md:pt-3 flex-1">
                        <p className={`text-[8px] font-black uppercase tracking-[0.42em] mb-2 ${mc}`}>
                            {lang === 'de' ? `Schritt ${index + 1} von ${total}` : `Step ${index + 1} of ${total}`}
                        </p>
                        <h3 className={`text-2xl md:text-[2.6rem] lg:text-[3rem] font-black italic uppercase leading-[0.88] tracking-tight ${tc}`}>
                            {step.title}
                        </h3>
                    </div>
                </div>

                {/* Accent divider */}
                <div className="mb-5 h-px flex-shrink-0" style={{
                    background: `linear-gradient(90deg, ${colors.accent}60, ${colors.accent}15, transparent)`,
                }} />

                {/* Description */}
                <p className={`text-sm md:text-[15px] leading-relaxed mb-6 max-w-2xl ${mc}`}>
                    {step.desc}
                </p>

                {/* ── Detail cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                    {details.map((d, di) => {
                        const label = typeof d === 'string' ? null : d.label;
                        const text  = typeof d === 'string' ? d    : d.text;
                        return (
                            <div
                                key={di}
                                className="flex flex-col gap-2.5 p-4 md:p-5 rounded-2xl"
                                style={{
                                    background: isDark
                                        ? `linear-gradient(145deg, ${colors.accent}0d 0%, rgba(255,255,255,0.02) 100%)`
                                        : `linear-gradient(145deg, ${colors.accent}0a 0%, rgba(0,0,0,0.015) 100%)`,
                                    border: `1px solid ${colors.accent}22`,
                                }}
                            >
                                {label && (
                                    <span className="text-[8px] font-black uppercase tracking-[0.35em]" style={{ color: colors.accent }}>
                                        {label}
                                    </span>
                                )}
                                <span className={`text-[11px] md:text-xs leading-relaxed ${mc}`}>
                                    {text}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom accent */}
                <div className="mt-5 flex-shrink-0 flex items-center gap-3">
                    <div className="h-[2px] w-12 rounded-full" style={{
                        background: `linear-gradient(90deg, ${colors.accent}, transparent)`,
                        boxShadow: `0 0 12px 2px ${colors.accent}55`,
                    }} />
                    <div className="h-[1px] flex-1 rounded-full" style={{
                        background: `linear-gradient(90deg, ${colors.accent}20, transparent)`,
                    }} />
                </div>
            </div>
        </motion.div>
    );
}

// ─── Step counter (desktop top-right) ─────────────────────────────────────────
function StepCounter({ smooth, total, isDark }) {
    const seg = 1 / (total + 0.2);
    return (
        <div className="hidden md:flex flex-col items-end gap-1.5 pb-1 flex-shrink-0">
            {Array.from({ length: total }, (_, i) => {
                const mid = i * seg + seg * 0.5;
                const op  = useTransform(smooth, [mid - seg * 0.4, mid, mid + seg * 0.4], [0.1, 1, 0.1]);
                const sc  = useTransform(smooth, [mid - seg * 0.4, mid, mid + seg * 0.4], [0.82, 1, 0.82]);
                return (
                    <motion.div
                        key={i}
                        style={{ opacity: op, scale: sc, willChange: 'transform, opacity' }}
                        className="text-[9px] font-black uppercase tracking-[0.3em] tabular-nums"
                    >
                        <span style={{ color: COLORS[i]?.accent }}>{String(i + 1).padStart(2, '0')}</span>
                        <span className={isDark ? 'text-white/15' : 'text-black/15'}>{' / '}{String(total).padStart(2, '0')}</span>
                    </motion.div>
                );
            })}
        </div>
    );
}