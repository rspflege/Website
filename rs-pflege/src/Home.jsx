import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
    motion, useScroll, useTransform, useSpring,
    useInView, AnimatePresence,
} from 'framer-motion';
import Hero from './components/Hero';
import About from './components/About';
import Process from './components/Process';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { translations } from './translations';

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME INTRO — letter-by-letter, then slides up
// ─────────────────────────────────────────────────────────────────────────────
function WelcomeIntro({ darkMode, lang, onDone }) {
    const [lettersDone, setLettersDone] = useState(false);
    const [taglineDone, setTaglineDone]  = useState(false);
    const [leaving,     setLeaving]      = useState(false);

    const title  = lang === 'en' ? 'Welcome' : lang === 'ro' ? 'Bun venit' : lang === 'sq' ? 'Mirë se vini' : 'Willkommen';
    const brand  = 'RS Pflege';
    const tagline = lang === 'en'
        ? 'Professional car care · Vöcklabruck'
        : lang === 'ro'
        ? 'Îngrijire profesională auto · Vöcklabruck'
        : 'Professionelle Fahrzeugpflege · Vöcklabruck';

    const letters = title.split('');
    const letterDuration = letters.length * 0.055 + 0.5;

    useEffect(() => {
        const t1 = setTimeout(() => setLettersDone(true), letterDuration * 1000);
        const t2 = setTimeout(() => setTaglineDone(true),  (letterDuration + 0.4) * 1000);
        const t3 = setTimeout(() => setLeaving(true),      (letterDuration + 1.5) * 1000);
        const t4 = setTimeout(() => onDone(),               (letterDuration + 2.3) * 1000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }, []);

    return (
        <motion.div
            animate={leaving ? { y: '-100%' } : { y: 0 }}
            transition={leaving
                ? { duration: 0.9, ease: [0.76, 0, 0.24, 1] }
                : { duration: 0 }}
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none ${
                darkMode ? 'bg-[#030303]' : 'bg-[#f2f2f7]'
            }`}
            style={{ fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' }}
        >
            {/* Dot grid bg */}
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `radial-gradient(circle, ${darkMode ? 'rgba(59,130,246,0.09)' : 'rgba(37,99,235,0.07)'} 1px, transparent 1px)`,
                backgroundSize: '44px 44px',
            }} />

            {/* Center glow — CSS only, no framer */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[130px] pointer-events-none ${
                darkMode ? 'bg-blue-600/25' : 'bg-blue-400/18'
            }`} style={{ animation: 'pulse 3s ease-in-out infinite' }} />

            {/* Logo */}
            <motion.img
                src="/logo-rs.png"
                alt="RS Pflege"
                initial={{ opacity: 0, scale: 0.8, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-20 md:h-28 w-auto mb-8 relative z-10"
                style={{ filter: 'drop-shadow(0 0 28px rgba(59,130,246,0.45))' }}
            />

            {/* Title letters */}
            <div className="flex items-end relative z-10 overflow-hidden mb-2" style={{ gap: '0.02em' }}>
                {letters.map((char, i) => (
                    <motion.span
                        key={i}
                        initial={{ y: '105%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 + i * 0.055, ease: [0.16, 1, 0.3, 1] }}
                        className={`font-black italic uppercase leading-none inline-block ${
                            darkMode ? 'text-white' : 'text-[#0a0a0a]'
                        }`}
                        style={{ fontSize: 'clamp(3.5rem, 11vw, 8.5rem)', letterSpacing: '-0.04em' }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                ))}
            </div>

            {/* Brand */}
            <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={lettersDone ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 font-black mb-4"
                style={{
                    fontSize: 'clamp(1.8rem, 5vw, 3.5rem)',
                    letterSpacing: '-0.03em',
                    color: '#3b82f6',
                    textShadow: '0 0 28px rgba(59,130,246,0.55)',
                }}
            >
                {brand}
            </motion.p>

            {/* Tagline */}
            <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={taglineDone ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`relative z-10 font-bold uppercase text-center ${
                    darkMode ? 'text-white/35' : 'text-black/35'
                }`}
                style={{ fontSize: 'clamp(0.6rem, 1.4vw, 0.85rem)', letterSpacing: '0.32em' }}
            >
                {tagline}
            </motion.p>

            {/* Loading bar — CSS animation so no JS overhead */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: letterDuration + 1.2, ease: 'linear' }}
                    style={{ originX: 0 }}
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600"
                />
            </div>

            {/* Corner marks */}
            {['top-5 left-5 border-t-2 border-l-2', 'top-5 right-5 border-t-2 border-r-2',
              'bottom-5 left-5 border-b-2 border-l-2', 'bottom-5 right-5 border-b-2 border-r-2'].map((cls, i) => (
                <motion.div key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.25 }}
                    transition={{ delay: 0.2 + i * 0.07, duration: 0.4 }}
                    className={`absolute w-7 h-7 border-blue-500 ${cls}`}
                />
            ))}
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL PROGRESS BAR — pure CSS transform, no spring
// ─────────────────────────────────────────────────────────────────────────────
function ScrollProgressBar() {
    const { scrollYProgress } = useScroll();
    // No spring — springs add latency on slow devices
    return (
        <motion.div
            style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
            className="fixed top-0 left-0 right-0 h-[2px] z-[9998] bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600"
            style={{ scaleX: scrollYProgress, transformOrigin: 'left', boxShadow: '0 0 8px rgba(59,130,246,0.6)' }}
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3D — rotateX on scroll-in, but ONLY opacity+y for Gallery
// (3D perspective + images = GPU overload → Gallery gets simpler reveal)
// ─────────────────────────────────────────────────────────────────────────────
function Section3D({ children, id, is2D = false }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start 0.95', 'start 0.1'],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
    const y       = useTransform(scrollYProgress, [0, 1], [50, 0]);
    // 3D only for non-image sections
    const rotateX = useTransform(scrollYProgress, [0, 1], is2D ? [0, 0] : [12, 0]);
    const scale   = useTransform(scrollYProgress, [0, 1], is2D ? [1, 1] : [0.94, 1]);

    return (
        <div ref={ref} id={id} className="scroll-mt-24" style={is2D ? {} : { perspective: '1000px' }}>
            <motion.div style={{ opacity, y, rotateX, scale, willChange: 'opacity, transform' }}>
                {children}
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PARALLAX DIVIDER — lightweight, no spring
// ─────────────────────────────────────────────────────────────────────────────
function ParallaxDivider({ darkMode, index }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], [-20, 20]);

    const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#6366f1'];
    const color  = colors[index % colors.length];

    return (
        <div ref={ref} className="relative h-24 overflow-hidden pointer-events-none">
            <motion.div
                style={{ y, background: `linear-gradient(to bottom, transparent, ${color}55, transparent)` }}
                className="absolute left-1/2 -translate-x-1/2 w-px h-full"
            />
            <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-1/2 left-0 right-0 h-px"
                style={{ background: darkMode ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)' : 'linear-gradient(to right, transparent, rgba(0,0,0,0.05), transparent)' }}
            />
            {/* Diamond */}
            <motion.div
                initial={{ scale: 0, rotate: 0 }}
                whileInView={{ scale: 1, rotate: 45 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5"
                style={{ background: color, boxShadow: `0 0 12px 3px ${color}55` }}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────────────────────
const INTRO_KEY = 'rs_intro_v2';

export default function Home({ darkMode, lang, cart, setCart }) {
    const location = useLocation();
    const [showIntro, setShowIntro] = useState(true); // always show, cleared after done
    const [introDone, setIntroDone] = useState(false);
    const [mouseX, setMouseX]       = useState(50);
    const [mouseY, setMouseY]       = useState(30);

    const t = translations[lang] || translations.de;

    const handleIntroDone = useCallback(() => {
        setIntroDone(true);
        setTimeout(() => setShowIntro(false), 100);
    }, []);

    useEffect(() => {
        const onMove = (e) => {
            setMouseX((e.clientX / window.innerWidth)  * 100);
            setMouseY((e.clientY / window.innerHeight) * 100);
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    useEffect(() => {
        if (!location.hash) return;
        const id = location.hash.replace('#', '');
        const el = document.getElementById(id);
        if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    }, [location]);

    return (
        <>
            {/* Welcome intro — always shown, no session storage gate */}
            {showIntro && (
                <WelcomeIntro darkMode={darkMode} lang={lang} onDone={handleIntroDone} />
            )}

            <main
                className={`relative transition-colors duration-700 ${
                    darkMode ? 'bg-black text-white' : 'bg-[#fafafa] text-[#1d1d1f]'
                }`}
                style={{ fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' }}
            >
                <ScrollProgressBar />

                {/* Ambient mouse-follow glow — CSS variable, no spring needed */}
                <div
                    className="pointer-events-none fixed inset-0 z-0 transition-none"
                    style={{
                        background: darkMode
                            ? `radial-gradient(ellipse 50% 50% at ${mouseX}% ${mouseY}%, rgba(10,132,255,0.07) 0%, transparent 70%)`
                            : `radial-gradient(ellipse 50% 50% at ${mouseX}% ${mouseY}%, rgba(0,122,255,0.05) 0%, transparent 70%)`,
                    }}
                />

                {/* Noise */}
                <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.018]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat', backgroundSize: '128px',
                }} />

                <div className="relative z-10">

                    {/* HERO */}
                    <Hero darkMode={darkMode} lang={lang} t={t} />

                    <ParallaxDivider darkMode={darkMode} index={0} />

                    {/* ABOUT — 3D tilt on scroll */}
                    <Section3D id="about">
                        <About darkMode={darkMode} lang={lang} t={t} />
                    </Section3D>

                    <ParallaxDivider darkMode={darkMode} index={1} />

                    {/* PROCESS — has its own sticky scroll engine, just fade wrapper */}
                    <motion.div
                        id="process"
                        className="scroll-mt-24"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7 }}
                    >
                        <Process darkMode={darkMode} lang={lang} t={t} />
                    </motion.div>

                    <ParallaxDivider darkMode={darkMode} index={2} />

                    {/* GALLERY — is2D=true: no rotateX, no perspective, no GPU thrash */}
                    <Section3D id="gallery" is2D={true}>
                        <Gallery darkMode={darkMode} lang={lang} t={t} />
                    </Section3D>

                    <ParallaxDivider darkMode={darkMode} index={3} />

                    {/* CONTACT — 3D */}
                    <Section3D id="kontakt">
                        <Contact darkMode={darkMode} lang={lang} cart={cart} setCart={setCart} t={t} />
                    </Section3D>

                    {/* FOOTER */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Footer darkMode={darkMode} lang={lang} cart={cart} setCart={setCart} />
                    </motion.div>
                </div>
            </main>
        </>
    );
}