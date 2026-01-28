import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from './components/Hero';
import About from './components/About';
import Process from './components/Process';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import WeatherWidget from './components/WeatherWidget';

export default function Home({ darkMode, lang, cart, setCart }) {
    const location = useLocation();

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
        <main className={darkMode ? 'bg-black' : 'bg-white'}>

            {/* 1. Visueller Einstieg */}
            <Hero darkMode={darkMode} lang={lang} />

            {/* 2. Wer seid ihr? */}
            <section id="about">
                <About darkMode={darkMode} lang={lang} />
            </section>

            {/* 3. Wie arbeitet ihr? */}
            <section id="process">
                <Process darkMode={darkMode} lang={lang} />
            </section>

            {/* 4. Ergebnisse zeigen */}
            <section id="gallery">
                <Gallery darkMode={darkMode} lang={lang} />
            </section>

            {/* 5. Abschluss & Buchung */}
            <section id="kontakt">
                <Contact
                    darkMode={darkMode}
                    lang={lang}
                    cart={cart}
                    setCart={setCart}
                />
            </section>
        </main>
    );
}