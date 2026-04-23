import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { translations } from '../translations';

export default function Hero({ darkMode, lang }) {
    const t = translations[lang] || translations.de;
    const cardRef = useRef(null);

    // 3D tilt values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 30 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 30 });
    const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
    const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const titleWords = t.heroTitle.split(' ');

    return (
        <section
            className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
            style={{ fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' }}
        >
            {/* Background — layered, depth-giving */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Primary glow orb */}
                <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.85, 0.6] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[130px] ${darkMode ? 'bg-blue-600/[0.14]' : 'bg-blue-400/[0.18]'}`}
                />
                {/* Secondary orb */}
                <motion.div
                    animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full blur-[100px] ${darkMode ? 'bg-indigo-500/[0.08]' : 'bg-sky-300/[0.14]'}`}
                />
            </div>

            {/* — Main content — */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 flex flex-col items-center"
            >
                {/* 3D Logo Card */}
                <motion.div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
                    initial={{ opacity: 0, y: 40, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-14 cursor-default"
                >
                    <div
                        className={`relative px-14 py-12 md:px-20 md:py-16 rounded-[3.5rem] border overflow-hidden ${
                            darkMode
                                ? 'bg-white/[0.05] border-white/[0.10] shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.10)]'
                                : 'bg-white/60 border-white shadow-[0_32px_80px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,1)]'
                        }`}
                        style={{ backdropFilter: 'blur(40px) saturate(180%)' }}
                    >
                        {/* Glare layer — moves with mouse */}
                        <motion.div
                            className="absolute inset-0 pointer-events-none rounded-[3.5rem]"
                            style={{
                                background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.12) 0%, transparent 65%)`,
                            }}
                        />

                        {/* Shimmer sweep on mount */}
                        <motion.div
                            className="absolute inset-0 -skew-x-12 pointer-events-none"
                            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)' }}
                            initial={{ x: '-130%' }}
                            animate={{ x: '230%' }}
                            transition={{ delay: 1.2, duration: 1.0, ease: 'easeInOut' }}
                        />

                        <img
                            src="/logo-rs.png"
                            alt="RS Pflege"
                            className="h-28 md:h-44 w-auto relative z-10"
                            style={{ filter: 'drop-shadow(0 4px 24px rgba(59,130,246,0.28))' }}
                        />
                    </div>
                </motion.div>

                {/* Headline — SF Pro Display proportions */}
                <div className="max-w-4xl mb-8">
                    <h1
                        className={`font-semibold leading-[0.88] tracking-[-0.04em] mb-0 ${darkMode ? 'text-white' : 'text-[#1d1d1f]'}`}
                        style={{ fontSize: 'clamp(52px, 10vw, 112px)' }}
                    >
                        <motion.span
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="block"
                        >
                            {titleWords[0]}
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.34, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="block text-[#0A84FF]"
                        >
                            {titleWords[1]}
                        </motion.span>
                    </h1>
                </div>

                {/* Subline — Apple-style marketing copy */}
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`text-[19px] md:text-[24px] font-normal leading-[1.4] max-w-xl mx-auto mb-14 ${darkMode ? 'text-white/55' : 'text-[#1d1d1f]/55'}`}
                    style={{ letterSpacing: '-0.01em' }}
                >
                    {t.heroSub1}
                    <br />
                    <span className={darkMode ? 'text-white/85' : 'text-[#1d1d1f]/85'}>{t.heroSub2}</span>
                </motion.p>

                {/* CTA row */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65, duration: 0.7 }}
                    className="flex flex-col sm:flex-row items-center gap-4"
                >
                    <a
                        href="#kontakt"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-8 py-4 rounded-full bg-[#0A84FF] text-white font-medium text-[15px] tracking-[-0.01em] transition-all duration-200 hover:bg-[#0071E3] active:scale-[0.97]"
                        style={{ boxShadow: '0 4px 24px rgba(10,132,255,0.35)' }}
                    >
                        {t.contact} →
                    </a>
                    <a
                        href="#about"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`px-8 py-4 rounded-full font-medium text-[15px] tracking-[-0.01em] border transition-all duration-200 active:scale-[0.97] ${
                            darkMode
                                ? 'border-white/15 text-white/80 hover:border-white/30 hover:bg-white/[0.06]'
                                : 'border-black/12 text-[#1d1d1f]/70 hover:border-black/20 hover:bg-black/[0.04]'
                        }`}
                    >
                        {t.about}
                    </a>
                </motion.div>

                {/* Established badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.8 }}
                    className="mt-16 flex items-center gap-4"
                >
                    <div className={`h-[1px] w-10 ${darkMode ? 'bg-white/15' : 'bg-black/12'}`} />
                    <p className={`text-[11px] font-medium tracking-[0.18em] uppercase ${darkMode ? 'text-white/25' : 'text-black/25'}`}>
                        Est. Vöcklabruck 2026
                    </p>
                    <div className={`h-[1px] w-10 ${darkMode ? 'bg-white/15' : 'bg-black/12'}`} />
                </motion.div>
            </motion.div>

            {/* Scroll cue — minimal line */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <motion.div
                    animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2.0, ease: 'easeInOut' }}
                    className={`w-[1px] h-12 rounded-full ${darkMode ? 'bg-white/25' : 'bg-black/20'}`}
                />
            </motion.div>
        </section>
    );
}