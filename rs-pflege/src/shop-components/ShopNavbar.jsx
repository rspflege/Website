import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import WeatherWidget from '../components/WeatherWidget';
import { translations } from '../translations';
import { shopTranslations } from '../shopTranslations';

export default function ShopNavbar({
    categories,
    activeCategory,
    setActiveCategory,
    darkMode,
    setDarkMode,
    lang,
    setLang,
    cart,
    setCart,
    user: initialUser,
    setIsLoginOpen
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('menu'); // 'menu' | 'settings' | 'support'
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [user, setUser] = useState(initialUser);
    const [supportMsg, setSupportMsg] = useState("");
    const [supportStatus, setSupportStatus] = useState(null);
    const navigate = useNavigate();

    const activeT = {
        ...(translations[lang] || translations.de),
        ...(shopTranslations[lang] || shopTranslations.de)
    };

    const cartCount = cart.length;
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

    const languages = [
        { code: 'de', name: 'Deutsch' }, { code: 'en', name: 'English' },
        { code: 'bs', name: 'Bosanski' }, { code: 'sq', name: 'Shqip' },
        { code: 'it', name: 'Italiano' }, { code: 'es', name: 'Español' },
        { code: 'tr', name: 'Türkçe' }, { code: 'fr', name: 'Français' },
        { code: 'hr', name: 'Hrvatski' }, { code: 'sr', name: 'Serpski' }
    ];

    // UPDATED: Bleibt im Menü und ändert nur die Sprache
    const changeLanguage = (code) => {
        setLang(code);
        // setView('menu') entfernt, damit das Sprachmenü offen bleibt
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setUser(session.user);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => { setUser(initialUser); }, [initialUser]);

    const glassEffect = darkMode
        ? "bg-[#0A0A0A]/80 border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        : "bg-white/80 border-black/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.05)]";

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsOpen(false);
    };

    const sendSupportTicket = async () => {
        if (!supportMsg.trim()) return;
        setSupportStatus('sending');
        const { error } = await supabase.from('support_tickets').insert([{
            user_email: user?.email || 'Anonym (Shop)',
            message: supportMsg,
            status: 'neu'
        }]);
        if (error) setSupportStatus('error');
        else {
            setSupportStatus('success');
            setSupportMsg("");
            setTimeout(() => { setSupportStatus(null); setView('menu'); }, 2000);
        }
    };

    const removeItem = (idx) => { setCart(prev => prev.filter((_, i) => i !== idx)); };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                ::-webkit-scrollbar { display: none !important; }
                * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
            `}} />

            {/* TOP HUD */}
            <div className="fixed top-8 left-0 w-screen z-[150] pointer-events-none px-6">
                <div className="flex justify-between items-start w-full">
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-4 rounded-[1.5rem] border backdrop-blur-3xl transition-all duration-500 flex items-center justify-center shrink-0 ${darkMode ? 'bg-[#0A0A0A]/90 border-white/10 text-white' : 'bg-white/90 border-black/5 text-black'}`}
                        >
                            {darkMode ? (
                                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" /></svg>
                            ) : (
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                            )}
                        </motion.button>
                        <div className="hidden lg:block">
                            <WeatherWidget darkMode={darkMode} lang={lang} />
                        </div>
                    </div>

                    <div className="pointer-events-auto">
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setIsOpen(!isOpen);
                                setView('menu');
                                if (isCartOpen) setIsCartOpen(false);
                            }}
                            className={`p-4 rounded-[1.5rem] border backdrop-blur-3xl flex items-center justify-center shrink-0 transition-all duration-500 ${darkMode ? 'bg-[#0A0A0A]/90 border-white/10 text-white' : 'bg-white/90 border-black/5 text-black'}`}
                        >
                            <div className="w-6 h-4 flex flex-col justify-between items-end">
                                <motion.div animate={{ width: "1.5rem", rotate: isOpen ? 45 : 0, y: isOpen ? 7 : 0 }} className="h-0.5 bg-current rounded-full" />
                                <motion.div animate={{ opacity: isOpen ? 0 : 1, width: "1rem" }} className="h-0.5 bg-current rounded-full" />
                                <motion.div animate={{ width: isOpen ? "1.5rem" : "1.2rem", rotate: isOpen ? -45 : 0, y: isOpen ? -7 : 0 }} className="h-0.5 bg-current rounded-full" />
                            </div>
                        </motion.button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {(isOpen || isCartOpen) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsOpen(false); setIsCartOpen(false); }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[130]" />
                )}

                {/* ACCESS TERMINAL (Sidebar) */}
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 28, stiffness: 200 }}
                        className={`fixed top-4 right-4 bottom-4 w-[calc(100%-2rem)] max-w-[400px] rounded-[2.5rem] p-10 pt-32 z-[140] flex flex-col border backdrop-blur-[50px] ${glassEffect}`}
                    >
                        <div className="flex items-center justify-between mb-8">
                            {view !== 'menu' ? (
                                <motion.button
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => setView('menu')}
                                    className="text-[10px] font-black uppercase text-blue-500 flex items-center gap-2 hover:text-blue-400 transition-colors"
                                >
                                    ← {activeT.back}
                                </motion.button>
                            ) : (
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600">Access Terminal</p>
                            )}
                        </div>

                        <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                            <AnimatePresence mode="wait">
                                {view === 'menu' && (
                                    <motion.div key="menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                        {user ? (
                                            <div className="space-y-3">
                                                <div className={`p-8 rounded-[2rem] border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
                                                    <p className="text-[9px] font-black uppercase opacity-30 mb-2">{activeT.loggedInAs}</p>
                                                    <p className="text-base font-bold truncate tracking-tight">{user.email}</p>
                                                </div>
                                                <button onClick={handleLogout} className="w-full py-5 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">{activeT.logout}</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setIsLoginOpen(true); setIsOpen(false); }} className="w-full py-8 rounded-[2rem] bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] transition-transform">{activeT.connectId}</button>
                                        )}

                                        <button onClick={() => setView('settings')} className={`w-full p-8 rounded-[2rem] border flex items-center justify-between group transition-all text-[11px] font-black uppercase tracking-widest ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-black/5 hover:bg-black/5'}`}>
                                            <span>{activeT.language}</span>
                                            <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                                        </button>

                                        <button onClick={() => setView('support')} className={`w-full p-8 rounded-[2rem] border flex items-center justify-between group transition-all text-[11px] font-black uppercase tracking-widest ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-black/5 hover:bg-black/5'}`}>
                                            <span>{activeT.support}</span>
                                            <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                                        </button>

                                        <button onClick={() => { navigate('/'); setIsOpen(false); }} className={`w-full p-8 rounded-[2rem] border flex items-center justify-between group transition-all text-[11px] font-black uppercase tracking-widest ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-black/5 hover:bg-black/5'}`}>
                                            <span>{activeT.mainHub}</span>
                                            <span className="group-hover:translate-x-2 transition-transform italic text-blue-600">→</span>
                                        </button>
                                    </motion.div>
                                )}

                                {view === 'settings' && (
                                    <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
                                        <div className="grid grid-cols-1 gap-2">
                                            {languages.map((l) => (
                                                <button
                                                    key={l.code}
                                                    onClick={() => changeLanguage(l.code)}
                                                    className={`p-5 rounded-2xl text-left text-[10px] font-black uppercase transition-all relative overflow-hidden group ${lang === l.code ? 'text-white' : 'hover:bg-current/5'}`}
                                                >
                                                    <span className="relative z-10 flex items-center justify-between">
                                                        {l.name}
                                                        {lang === l.code && (
                                                            <motion.span
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"
                                                            />
                                                        )}
                                                    </span>
                                                    {/* Layout Animation für den Sprachwechsel */}
                                                    {lang === l.code && (
                                                        <motion.div
                                                            layoutId="activeLangBG"
                                                            className="absolute inset-0 bg-blue-600"
                                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {view === 'support' && (
                                    <motion.div key="support" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                        <textarea value={supportMsg} onChange={(e) => setSupportMsg(e.target.value)} className={`w-full h-40 rounded-[2rem] p-6 text-sm resize-none outline-none border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`} placeholder={activeT.supportMsg} />
                                        <button onClick={sendSupportTicket} disabled={supportStatus === 'sending'} className="w-full py-6 bg-blue-600 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                                            {supportStatus === 'sending' ? '...' : (supportStatus === 'success' ? activeT.sent : activeT.sendTicket)}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="mt-auto pt-6"><p className="text-[8px] text-center opacity-20 font-black uppercase tracking-[0.4em]">RS Shop v1.2</p></div>
                    </motion.div>
                )}

                {/* INVENTORY SIDEBAR */}
                {isCartOpen && (
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 28, stiffness: 200 }}
                        className={`fixed top-4 right-4 bottom-4 w-[calc(100%-2rem)] max-w-[480px] rounded-[2.5rem] p-10 z-[160] flex flex-col border backdrop-blur-[50px] ${glassEffect}`}
                    >
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">{activeT.inventory} <span className="text-blue-600">[{cartCount}]</span></h2>
                            <button onClick={() => setIsCartOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-current/10 transition-colors">✕</button>
                        </div>
                        <div className="flex-grow overflow-y-auto space-y-4 pr-1">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 py-20">
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">{activeT.emptySlot}</p>
                                </div>
                            ) : (
                                cart.map((item, idx) => (
                                    <motion.div layout key={idx} className={`p-5 rounded-[2rem] border flex items-center gap-5 ${darkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/20 shrink-0">
                                            <img src={item.img} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="text-[11px] font-black uppercase truncate max-w-[180px]">{item.name}</h4>
                                            <p className="text-blue-600 font-black italic text-base">{item.price.toFixed(2)}€</p>
                                        </div>
                                        <button onClick={() => removeItem(idx)} className="p-3 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">✕</button>
                                    </motion.div>
                                ))
                            )}
                        </div>
                        {cart.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-current/10">
                                <div className="flex justify-between items-end mb-8 px-2">
                                    <span className="text-[10px] font-black uppercase opacity-40">{activeT.subtotal}</span>
                                    <span className="text-4xl font-black italic text-blue-600">{subtotal.toFixed(2)}€</span>
                                </div>
                                <button className="w-full py-6 rounded-[1.8rem] bg-blue-600 text-white text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">{activeT.checkout}</button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BOTTOM DOCK */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-auto max-w-[95%]">
                <nav className={`rounded-[2.5rem] p-2 flex items-center gap-2 border backdrop-blur-3xl transition-all duration-700 ${glassEffect}`}>
                    <div className="flex items-center px-2 gap-1 overflow-x-auto hide-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                className={`px-6 py-3.5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all relative shrink-0 ${activeCategory === cat.key ? 'text-blue-500' : 'opacity-40 hover:opacity-100'}`}
                            >
                                <span className="relative z-10">{activeT.categories?.[cat.key] || cat.name}</span>
                                {activeCategory === cat.key && (
                                    <motion.div layoutId="dockIndicator" className={`absolute inset-0 rounded-[1.8rem] ${darkMode ? 'bg-white/10 border border-white/10' : 'bg-black/5 border border-black/5'}`} transition={{ type: "spring", bounce: 0.25, duration: 0.5 }} />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className={`h-10 w-[1px] ${darkMode ? 'bg-white/10' : 'bg-black/10'} mx-2`} />
                    <motion.button
                        onClick={() => { setIsCartOpen(true); if (isOpen) setIsOpen(false); }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 text-white h-14 px-7 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-4 transition-all shrink-0"
                    >
                        <span className="hidden md:inline">{activeT.inventory}</span>
                        <div className="bg-white text-blue-600 px-3 py-1 rounded-xl text-[11px] font-black">{cartCount}</div>
                    </motion.button>
                </nav>
            </div>
        </>
    );
}