import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from './components/Hero';
import About from './components/About';
import Process from './components/Process'; // Neu importiert
import Gallery from './components/Gallery';
import Contact from './components/Contact';

export default function Home({ darkMode, lang, cart, setCart }) {
    const location = useLocation();

    useEffect(() => {
        // Prüft ob die URL auf #kontakt endet
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
        <main>
            {/* 1. Visueller Einstieg */}
            <Hero darkMode={darkMode} lang={lang} />

            {/* 2. Wer seid ihr? */}
            <section id="about">
                <About darkMode={darkMode} lang={lang} />
            </section>

            {/* 3. Wie arbeitet ihr? (Die neue Methode) */}
            <section id="process">
                <Process darkMode={darkMode} lang={lang} />
            </section>

            {/* 4. Ergebnisse zeigen (Inkl. neuem Vorher-Nachher Slider) */}
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