import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './Home';
import Preise from './components/Prices';
import LoginModal from './components/LoginModal';
import { translations } from './translations';
import { supabase } from './supabaseClient';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState('de');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(null);

  // GLOBALER STATE MIT INITIALISIERUNG AUS DEM SPEICHER
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('rs_pflege_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const location = useLocation();

  // --- PERSISTENZ: SPEICHERN BEI JEDER ÄNDERUNG ---
  useEffect(() => {
    localStorage.setItem('rs_pflege_cart', JSON.stringify(cart));
  }, [cart]);

  // --- AUTH LOGIK ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-[#050505] text-white' : 'bg-[#f5f5f7] text-black'}`}>

      {/* Navbar mit Warenkorb-Zähler */}
      <Navbar
        darkMode={darkMode} setDarkMode={setDarkMode}
        lang={lang} setLang={setLang}
        setIsLoginOpen={setIsLoginOpen} user={user}
        cartCount={cart.length}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* STARTSEITE (Home) */}
          <Route path="/" element={
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <Home
                darkMode={darkMode}
                lang={lang}
                cart={cart}
                setCart={setCart}
              />
            </motion.div>
          } />

          {/* PREISE SEITE */}
          <Route path="/preise" element={
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <Preise
                darkMode={darkMode}
                lang={lang}
                cart={cart}
                setCart={setCart}
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