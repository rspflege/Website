import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../translations';
import { supabase } from '../supabaseClient';
import WeatherWidget from './WeatherWidget';

const ADMIN_EMAILS = [
    'spahiu.endrit09@hotmail.com',
    'rspflege.office@gmail.com',
    'rekicsead6@gmail.com'
];

export default function Navbar({ darkMode, setDarkMode, lang = 'de', setLang, setIsLoginOpen, user, cartCount, t }) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('menu');
    const [activeSection, setActiveSection] = useState('home');
    const [showPriceMenu, setShowPriceMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    const [supportMsg, setSupportMsg] = useState("");
    const [supportStatus, setSupportStatus] = useState(null);
    const [tickets, setTickets] = useState([]);

    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === "/";

    // Synchronisation mit deiner translation.js Struktur
    const activeT = t || translations[lang] || translations.de;

    const lastScrollTime = useRef(0);
    const isAdmin = user && ADMIN_EMAILS.includes(user.email);

    // Responsive Check
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Support Tickets Fetching (Admin)
    const fetchTickets = useCallback(async () => {
        if (!isAdmin) return;
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error) setTickets(data || []);
    }, [isAdmin]);

    useEffect(() => {
        if (isAdmin) {
            fetchTickets();
            const channel = supabase.channel('admin-inbox')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => fetchTickets())
                .subscribe();
            return () => { supabase.removeChannel(channel); };
        }
    }, [isAdmin, fetchTickets]);

    // Navigation & Scroll Handling
    const handleNavClick = (e, id) => {
        setShowPriceMenu(false);
        if (isOpen) setIsOpen(false);

        if (id === 'prices') return; // Preise öffnet das Menu, kein Scroll

        if (isHome) {
            if (id === 'home') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setActiveSection('home');
            } else {
                const element = document.getElementById(id);
                if (element) {
                    e.preventDefault();
                    const offset = 80;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = element.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        }
    };

    // Scroll-Spy Logik
    useEffect(() => {
        if (!isHome) {
            if (location.pathname === "/preise") setActiveSection('prices');
            else setActiveSection('');
            return;
        }

        const handleScroll = () => {
            const now = Date.now();
            if (now - lastScrollTime.current < 50) return;
            lastScrollTime.current = now;

            if (window.scrollY < 100) { setActiveSection('home'); return; }

            const sections = ['about', 'gallery', 'contact'];
            const scrollPos = window.scrollY + 300;

            for (const id of sections) {
                const el = document.getElementById(id);
                if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
                    setActiveSection(id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHome, location.pathname]);

    const glassBase = darkMode
        ? "bg-black/40 border-white/10 text-white shadow-2xl"
        : "bg-white/60 border-black/5 shadow-xl text-black";

    // Nav-Item Komponente (Nutzt jetzt exakt deine Keys)
    const navItem = (id, label, isRoute = false) => {
        const isActive = activeSection === id;
        let linkPath = isRoute ? `/${id}` : `/#${id}`;
        if (id === 'home') linkPath = '/';

        const content = (
            <div className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all block relative z-10
                ${isActive ? 'text-blue-500' : 'opacity-40 hover:opacity-100'}`}>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                    {label}
                    {id === 'prices' && cartCount > 0 && (
                        <span className="bg-blue-600 text-white text-[8px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center border border-white/20">
                            {cartCount}
                        </span>
                    )}
                </div>
                {isActive && (
                    <motion.div layoutId="activeDockTab" className="absolute inset-0 bg-blue-500/10 rounded-xl z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
            </div>
        );

        if (id === 'prices') {
            return (
                <button key={id} onClick={() => setShowPriceMenu(!showPriceMenu)} className="relative">
                    {content}
                </button>
            );
        }

        return (
            <Link key={id} to={linkPath} onClick={(e) => handleNavClick(e, id)}>
                {content}
            </Link>
        );
    };

    const handleLogout = async () => { await supabase.auth.signOut(); setIsOpen(false); };

    const deleteTicket = async (id) => {
        setTickets(prev => prev.filter(t => t.id !== id));
        await supabase.from('support_tickets').delete().eq('id', id);
    };

    const clearAllTickets = async () => {
        if (!window.confirm("Alle löschen?")) return;
        setTickets([]);
        await supabase.from('support_tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    };

    const sendSupportTicket = async () => {
        if (!supportMsg.trim()) return;
        setSupportStatus('sending');
        const { error } = await supabase.from('support_tickets').insert([{
            user_email: user?.email || 'Anonym',
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

    const languages = [
        { code: 'de', name: 'Deutsch' }, { code: 'en', name: 'English' },
        { code: 'bs', name: 'Bosanski' }, { code: 'sq', name: 'Shqip' },
        { code: 'it', name: 'Italiano' }, { code: 'es', name: 'Español' },
        { code: 'tr', name: 'Türkçe' }, { code: 'fr', name: 'Français' },
        { code: 'hr', name: 'Hrvatski' }, { code: 'sr', name: 'Srpski' }
    ];

    return (
        <>
            {/* Dark Mode & Weather */}
            <div className="fixed top-6 left-6 z-[110] flex items-center gap-2 sm:gap-3">
                <button onClick={() => setDarkMode(!darkMode)} className={`apple-glass p-3.5 sm:p-4 rounded-2xl active:scale-90 transition-all border backdrop-blur-md ${glassBase}`}>
                    {darkMode ? (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    ) : (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                    )}
                </button>
                <WeatherWidget darkMode={darkMode} lang={lang} />
            </div>

            {/* Hamburger Menu Trigger */}
            <div className="fixed top-6 right-6 z-[150]">
                <button onClick={() => setIsOpen(!isOpen)} className={`relative apple-glass p-4 rounded-2xl active:scale-90 transition-all border backdrop-blur-md ${glassBase}`}>
                    {isAdmin && tickets.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white animate-bounce shadow-lg">{tickets.length}</span>
                    )}
                    <div className="w-6 h-5 flex flex-col justify-between items-end">
                        <div className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`}></div>
                        <div className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'w-4'}`}></div>
                        <div className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-6 -rotate-45 -translate-y-2.5' : 'w-5'}`}></div>
                    </div>
                </button>
            </div>

            {/* Sidebar Overlay & Content */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[130]" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className={`fixed top-4 right-4 bottom-4 w-full max-w-[340px] rounded-[2.5rem] p-8 z-[140] flex flex-col border ${glassBase}`}>
                            <div className="flex items-center justify-between mb-8 mt-10">
                                {view !== 'menu' ? (
                                    <button onClick={() => setView('menu')} className="text-[10px] font-black uppercase text-blue-500 flex items-center gap-2">← {activeT.back}</button>
                                ) : (
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">{user ? "ACCOUNT" : "RS ACCOUNT"}</p>
                                )}
                            </div>

                            <AnimatePresence mode="wait">
                                {view === 'menu' && (
                                    <motion.div key="menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                        {user ? (
                                            <div className="space-y-3 mb-6">
                                                <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                                                    <p className="text-[8px] font-black uppercase opacity-40 mb-1 tracking-widest">{activeT.loggedInAs}</p>
                                                    <p className="text-[11px] font-bold truncate tracking-tight">{user.email}</p>
                                                </div>
                                                {isAdmin && (
                                                    <button onClick={() => setView('inbox')} className="w-full py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">📥 Inbox ({tickets.length})</button>
                                                )}
                                                <button onClick={handleLogout} className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">{activeT.logout}</button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3 mb-6">
                                                <button onClick={() => { setIsLoginOpen(true); setIsOpen(false); }} className="py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">{activeT.login}</button>
                                                <button onClick={() => { setIsLoginOpen(true); setIsOpen(false); }} className="py-4 rounded-2xl border border-current opacity-60 text-[10px] font-black uppercase tracking-widest">{activeT.register}</button>
                                            </div>
                                        )}
                                        <button onClick={() => setView('settings')} className={`w-full p-5 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-black/5'} flex items-center justify-between hover:bg-blue-600 hover:text-white group transition-all`}>
                                            <span className="text-[11px] font-black uppercase tracking-widest">{activeT.settings}</span>
                                            <span>→</span>
                                        </button>
                                        <button onClick={() => setView('support')} className={`w-full p-5 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-black/5'} flex items-center justify-between hover:bg-blue-600 hover:text-white group transition-all`}>
                                            <span className="text-[11px] font-black uppercase tracking-widest">{activeT.support}</span>
                                            <span>→</span>
                                        </button>
                                    </motion.div>
                                )}

                                {view === 'settings' && (
                                    <motion.div key="settings" className="space-y-6">
                                        <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">{activeT.language}</p>
                                        <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
                                            {languages.map((l) => (
                                                <button key={l.code} onClick={() => setLang(l.code)} className={`p-4 rounded-xl text-left text-[10px] font-black uppercase transition-all ${lang === l.code ? 'bg-blue-600 text-white' : 'bg-current/5 hover:bg-current/10'}`}>
                                                    {l.name}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {view === 'support' && (
                                    <motion.div key="support" className="space-y-6">
                                        <textarea value={supportMsg} onChange={(e) => setSupportMsg(e.target.value)} className={`w-full h-32 rounded-2xl p-4 text-xs resize-none outline-none ${darkMode ? 'bg-white/5' : 'bg-black/5'}`} placeholder="..." />
                                        <button onClick={sendSupportTicket} disabled={supportStatus === 'sending'} className="w-full py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                                            {supportStatus === 'sending' ? '...' : "Senden"}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="mt-auto pt-4"><p className="text-[8px] text-center opacity-20 font-black uppercase tracking-[0.4em]">RS Pflege v1.2</p></div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Floating Dock */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] sm:w-auto px-1">
                <AnimatePresence>
                    {showPriceMenu && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className={`absolute bottom-full left-0 right-0 mb-4 mx-auto w-fit min-w-[220px] apple-glass border rounded-[2rem] p-2 flex flex-col gap-1 backdrop-blur-3xl shadow-2xl ${glassBase}`}>
                            <Link to="/preise" onClick={() => setShowPriceMenu(false)} className="flex items-center justify-between px-6 py-4 hover:bg-blue-600 hover:text-white rounded-[1.5rem] transition-all group">
                                <span className="text-[10px] font-black uppercase italic tracking-widest">{activeT.prices}</span>
                                <span className="opacity-0 group-hover:opacity-100">✨</span>
                            </Link>
                            <div className="h-[1px] w-full bg-current opacity-5" />
                            <div className="flex items-center justify-between px-6 py-4 opacity-50 cursor-not-allowed">
                                <span className="text-[10px] font-black uppercase italic tracking-widest">Shop</span>
                                <span className="text-[8px] bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full uppercase">{activeT.comingSoon}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <nav className={`apple-glass rounded-full px-2 sm:px-6 py-2 flex items-center justify-between sm:justify-center gap-1 sm:gap-2 backdrop-blur-3xl border transition-all duration-500 ${glassBase}`}>
                    <div className="flex gap-0.5 sm:gap-1 items-center overflow-x-hidden">
                        {navItem('home', activeT.home)}
                        {navItem('about', activeT.about)}
                        {navItem('gallery', activeT.gallery)}
                        {navItem('prices', activeT.prices)}
                    </div>

                    <div className="h-6 w-[1px] bg-current opacity-10 mx-0.5 sm:mx-1"></div>

                    <Link to="/#kontakt" onClick={(e) => handleNavClick(e, 'contact')}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-7 py-2.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-tighter sm:tracking-[0.15em] shadow-lg active:scale-95 transition-all whitespace-nowrap">
                        {activeT.contact}
                    </Link>
                </nav>
            </div>
        </>
    );
}