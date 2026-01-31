import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './Home';
import Preise from './components/Prices';
import LoginModal from './components/LoginModal';
import { translations } from './translations';
import { supabase } from './supabaseClient';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState('de');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('rs_pflege_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('rs_pflege_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Aktuelle Übersetzung basierend auf lang auswählen
  const t = translations[lang] || translations.de;

  return (
    <div className={`min-h-screen transition-colors duration-700 ${darkMode ? 'bg-[#050505] text-white' : 'bg-[#f5f5f7] text-black'}`}>

      <ScrollToTop />

      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        lang={lang}
        setLang={setLang}
        setIsLoginOpen={setIsLoginOpen}
        user={user}
        cartCount={cart.length}
        t={t} // Hier wird das Übersetzungsobjekt übergeben
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Home
                darkMode={darkMode}
                lang={lang}
                cart={cart}
                setCart={setCart}
                t={t}
              />
            </motion.div>
          } />

          <Route path="/preise" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Preise
                darkMode={darkMode}
                lang={lang}
                cart={cart}
                setCart={setCart}
                t={t} // Übergebe t auch hier sicherheitshalber
              />
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        darkMode={darkMode}
        lang={lang}
        translations={translations}
      />
    </div>
  );
}