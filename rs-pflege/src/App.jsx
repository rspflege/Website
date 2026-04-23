import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './Home';
import Preise from './components/Prices';
import LoginModal from './components/LoginModal';
import Shop from './Shop';
import AdminPanel from './AdminPanel';
import { translations } from './translations';
import { supabase } from './supabaseClient';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState('de');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(null);

  // 1. Warenkorb für Services (Home/Preise)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('rs_pflege_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // 2. Warenkorb für den Shop (NEU & GETRENNT)
  const [shopCart, setShopCart] = useState(() => {
    const saved = localStorage.getItem('rs_pflege_shop_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const location = useLocation();
  const isShop = location.pathname === '/shop';
  const isAdminPage = location.pathname === '/admin';

  const adminEmails = [
    'spahiu.endrit09@hotmail.com',
    'rspflege.office@gmail.com',
    'rekicsead6@gmail.com'
  ];

  const isAdmin = user && adminEmails.includes(user.email);

  // LocalStorage für beide Warenkörbe synchronisieren
  useEffect(() => {
    localStorage.setItem('rs_pflege_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('rs_pflege_shop_cart', JSON.stringify(shopCart));
  }, [shopCart]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const t = translations[lang] || translations.de;

  return (
    <div className={`min-h-screen transition-colors duration-700 ${darkMode ? 'bg-[#050505] text-white' : 'bg-[#f5f5f7] text-black'}`}>

      <ScrollToTop />

      {/* Die Haupt-Navbar zeigt NUR den Service-Cart an */}
      {!isShop && !isAdminPage && (
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          lang={lang}
          setLang={setLang}
          setIsLoginOpen={setIsLoginOpen}
          user={user}
          cartCount={cart.length} // Zeigt nur Service-Items
          t={t}
        />
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          <Route path="/" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <Home darkMode={darkMode} lang={lang} cart={cart} setCart={setCart} t={t} />
            </motion.div>
          } />

          <Route path="/preise" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <Preise darkMode={darkMode} lang={lang} cart={cart} setCart={setCart} t={t} />
            </motion.div>
          } />

          <Route path="/shop" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <Shop
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                lang={lang}
                setLang={setLang}
                cart={shopCart}    /* Übergibt den Shop-Warenkorb */
                setCart={setShopCart} /* Nutzt den Shop-Setter */
                user={user}
                setIsLoginOpen={setIsLoginOpen}
                t={t}
              />
            </motion.div>
          } />

          <Route path="/admin" element={
            isAdmin ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AdminPanel darkMode={darkMode} />
              </motion.div>
            ) : (
              <Navigate to="/" replace />
            )
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