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

    // Die aktuelle Übersetzung basierend auf der Sprache laden
    const t = translations[lang] || translations.de;

    // --- MOUSE GLOW EFFECT LOGIC ---
    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);

    return (
        <main className={`relative overflow-hidden transition-colors duration-700 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>

            {/* DER MOUSE GLOW EFFEKT */}
            <div
                className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000"
                style={{
                    background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, 
                        ${darkMode
                            ? 'rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.05) 30%, transparent 70%'
                            : 'rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.02) 40%, transparent 80%'}
                    )`,
                    mixBlendMode: darkMode ? 'screen' : 'multiply',
                }}
            />

            {/* Content in relativen Containern halten, damit sie über dem Glow liegen */}
            <div className="relative z-10">
                {/* 1. Visueller Einstieg */}
                <Hero darkMode={darkMode} lang={lang} t={t} />

                {/* 2. Wer seid ihr? */}
                <section id="about">
                    <About darkMode={darkMode} lang={lang} t={t} />
                </section>

                {/* 3. Wie arbeitet ihr? */}
                <section id="process">
                    <Process darkMode={darkMode} lang={lang} t={t} />
                </section>

                {/* 4. Ergebnisse zeigen */}
                <section id="gallery">
                    <Gallery darkMode={darkMode} lang={lang} t={t} />
                </section>

                {/* 5. Abschluss & Buchung */}
                <section id="kontakt">
                    <Contact
                        darkMode={darkMode}
                        lang={lang}
                        cart={cart}
                        setCart={setCart}
                        t={t}
                    />
                </section>

                <Footer
                    darkMode={darkMode}
                    lang={lang}
                    cart={cart}
                    setCart={setCart}
                />
            </div>
        </main>
    );
}