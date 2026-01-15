import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from './components/Hero';
import About from './components/About';
import Gallery from './components/Gallery';
import Contact from './components/Contact';

export default function Home({ darkMode, lang, cart, setCart }) {
    const location = useLocation();

    useEffect(() => {
        // Prüft ob die URL auf #kontakt endet (z.B. nach Klick im Warenkorb/Navbar)
        if (location.hash === '#kontakt') {
            const element = document.getElementById('kontakt');
            if (element) {
                // Ein kleiner Timeout stellt sicher, dass die Seite fertig gerendert ist
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);

    return (
        <main>
            <Hero darkMode={darkMode} lang={lang} />

            <section id="about">
                <About darkMode={darkMode} lang={lang} />
            </section>

            <section id="gallery">
                <Gallery darkMode={darkMode} lang={lang} />
            </section>

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