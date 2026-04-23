import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from './components/Hero';
import About from './components/About';
import Process from './components/Process';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { translations } from './translations';

export default function Home({ darkMode, lang, cart, setCart }) {
    const location = useLocation();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [scrollY, setScrollY] = useState(0);

    const t = translations[lang] || translations.de;

    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        }
    }, [location]);

    return (
        <main
            className={`relative overflow-hidden transition-colors duration-700 ${darkMode ? 'bg-black text-white' : 'bg-[#fafafa] text-[#1d1d1f]'}`}
            style={{ fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' }}
        >
            {/* Apple-style ambient glow — subtle, slow, organic */}
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background: darkMode
                        ? `radial-gradient(ellipse 120% 80% at ${mousePos.x * 0.05 + 45}% ${mousePos.y * 0.03 + 10}%,
                            rgba(10, 132, 255, 0.07) 0%,
                            rgba(10, 132, 255, 0.03) 40%,
                            transparent 70%)`
                        : `radial-gradient(ellipse 120% 80% at ${mousePos.x * 0.05 + 45}% ${mousePos.y * 0.03 + 10}%,
                            rgba(0, 122, 255, 0.05) 0%,
                            rgba(0, 122, 255, 0.02) 40%,
                            transparent 70%)`,
                    transition: 'background 1.2s cubic-bezier(0.4,0,0.2,1)',
                }}
            />

            {/* Subtle noise texture for depth — Apple does this on macOS */}
            <div
                className="pointer-events-none fixed inset-0 z-0 opacity-[0.018]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '128px',
                }}
            />

            <div className="relative z-10">
                <Hero darkMode={darkMode} lang={lang} t={t} />

                <section id="about" className="relative">
                    {/* Section divider — hairline, Apple-style */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-24
                        ${darkMode ? 'bg-gradient-to-b from-transparent via-white/10 to-transparent' : 'bg-gradient-to-b from-transparent via-black/8 to-transparent'}`}
                    />
                    <About darkMode={darkMode} lang={lang} t={t} />
                </section>

                <section id="process" className="relative">
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-24
                        ${darkMode ? 'bg-gradient-to-b from-transparent via-white/10 to-transparent' : 'bg-gradient-to-b from-transparent via-black/8 to-transparent'}`}
                    />
                    <Process darkMode={darkMode} lang={lang} t={t} />
                </section>

                <section id="gallery" className="relative">
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-24
                        ${darkMode ? 'bg-gradient-to-b from-transparent via-white/10 to-transparent' : 'bg-gradient-to-b from-transparent via-black/8 to-transparent'}`}
                    />
                    <Gallery darkMode={darkMode} lang={lang} t={t} />
                </section>

                <section id="kontakt" className="relative">
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-24
                        ${darkMode ? 'bg-gradient-to-b from-transparent via-white/10 to-transparent' : 'bg-gradient-to-b from-transparent via-black/8 to-transparent'}`}
                    />
                    <Contact darkMode={darkMode} lang={lang} cart={cart} setCart={setCart} t={t} />
                </section>

                <Footer darkMode={darkMode} lang={lang} cart={cart} setCart={setCart} />
            </div>
        </main>
    );
}