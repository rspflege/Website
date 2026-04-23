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

const sf = { fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' };

export default function Navbar({ darkMode, setDarkMode, lang = 'de', setLang, setIsLoginOpen, user, cartCount, t }) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('menu');
    const [activeSection, setActiveSection] = useState('home');
    const [showPriceMenu, setShowPriceMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640);
    const [supportMsg, setSupportMsg] = useState('');
    const [supportStatus, setSupportStatus] = useState(null);
    const [tickets, setTickets] = useState([]);

    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';
    const lastScrollTime = useRef(0);

    const activeT = t || translations[lang] || translations.de;
    const isAdmin = user && ADMIN_EMAILS.includes(user.email);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchTickets = useCallback(async () => {
        if (!isAdmin) return;
        const { data, error } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
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

    const handleNavClick = (e, id) => {
        setShowPriceMenu(false);
        if (isOpen) setIsOpen(false);
        if (id === 'prices') return;
        if (isHome) {
            if (id === 'home') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setActiveSection('home');
            } else {
                const element = document.getElementById(id);
                if (element) {
                    e.preventDefault();
                    const offsetPosition = element.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            }
        }
    };

    useEffect(() => {
        if (!isHome) {
            setActiveSection(location.pathname === '/preise' ? 'prices' : '');
            return;
        }
        const handleScroll = () => {
            const now = Date.now();
            if (now - lastScrollTime.current < 50) return;
            lastScrollTime.current = now;
            if (window.scrollY < 100) { setActiveSection('home'); return; }
            const sections = ['about', 'gallery', 'kontakt'];
            const scrollPos = window.scrollY + 300;
            for (const id of sections) {
                const el = document.getElementById(id);
                if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
                    setActiveSection(id); break;
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHome, location.pathname]);

    const handleLogout = async () => { await supabase.auth.signOut(); setIsOpen(false); };

    const deleteTicket = async (id) => {
        setTickets(prev => prev.filter(t => t.id !== id));
        await supabase.from('support_tickets').delete().eq('id', id);
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
            setSupportMsg('');
            setTimeout(() => { setSupportStatus(null); setView('menu'); }, 2000);
        }
    };

    const languages = [
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' }, { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'bs', name: 'Bosanski', flag: '🇧🇦' }, { code: 'sq', name: 'Shqip', flag: '🇦🇱' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹' }, { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }, { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' }, { code: 'sr', name: 'Srpski', flag: '🇷🇸' }
    ];

    // Glass style for floating elements
    const glass = darkMode
        ? 'bg-black/50 border-white/[0.10] text-white'
        : 'bg-white/70 border-black/[0.08] text-[#1d1d1f]';

    const sidebarGlass = darkMode
        ? 'bg-[#1c1c1e]/95 border-white/[0.10] text-white'
        : 'bg-white/95 border-black/[0.07] text-[#1d1d1f]';

    const NavItem = ({ id, label, isRoute = false }) => {
        const isActive = activeSection === id;
        let linkPath = isRoute ? `/${id}` : `/#${id}`;
        if (id === 'home') linkPath = '/';

        const inner = (
            <div className="relative px-4 py-2 rounded-full">
                <span className={`relative z-10 text-[13px] font-medium transition-colors duration-200 ${isActive ? 'text-[#0A84FF]' : darkMode ? 'text-white/50 hover:text-white/80' : 'text-black/40 hover:text-black/70'}`}>
                    {label}
                    {id === 'prices' && cartCount > 0 && (
                        <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0A84FF] text-white text-[9px] font-semibold">
                            {cartCount}
                        </span>
                    )}
                </span>
                {isActive && (
                    <motion.div
                        layoutId="activeTab"
                        className={`absolute inset-0 rounded-full ${darkMode ? 'bg-white/[0.09]' : 'bg-black/[0.05]'}`}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.55 }}
                    />
                )}
            </div>
        );

        if (id === 'prices') {
            return (
                <button onClick={() => setShowPriceMenu(!showPriceMenu)}>
                    {inner}
                </button>
            );
        }
        return (
            <Link to={linkPath} onClick={(e) => handleNavClick(e, id)}>
                {inner}
            </Link>
        );
    };

    return (
        <div style={sf}>
            {/* — Top-left: Dark mode toggle + Weather — */}
            <div className="fixed top-5 left-5 z-[110] flex items-center gap-2">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-200 ${glass}`}
                    style={{ backdropFilter: 'blur(24px) saturate(180%)' }}
                >
                    {darkMode ? (
                        <svg className="w-4 h-4 text-[#FFD60A]" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="4.5"/>
                            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 text-[#0071E3]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                        </svg>
                    )}
                </motion.button>
                <WeatherWidget darkMode={darkMode} lang={lang} />
            </div>

            {/* — Top-right: Menu trigger — */}
            <div className="fixed top-5 right-5 z-[150]">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setIsOpen(!isOpen); if (!isOpen) setView('menu'); }}
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-200 ${glass}`}
                    style={{ backdropFilter: 'blur(24px) saturate(180%)' }}
                >
                    {isAdmin && tickets.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF3B30] text-white text-[9px] font-semibold flex items-center justify-center border border-white/20">
                            {tickets.length}
                        </span>
                    )}
                    <div className="w-4 h-3 flex flex-col justify-between">
                        <div className={`h-[1.5px] bg-current rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
                        <div className={`h-[1.5px] bg-current rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : 'w-[75%]'}`} />
                        <div className={`h-[1.5px] bg-current rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[5px]' : 'w-[60%]'}`} />
                    </div>
                </motion.button>
            </div>

            {/* — Sidebar — */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/30 z-[130]"
                            style={{ backdropFilter: 'blur(4px)' }}
                        />
                        <motion.div
                            initial={{ x: '110%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '110%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                            className={`fixed top-4 right-4 bottom-4 w-[300px] rounded-[28px] border z-[140] flex flex-col overflow-hidden ${sidebarGlass}`}
                            style={{ backdropFilter: 'blur(40px) saturate(200%)' }}
                        >
                            <div className="flex items-center justify-between px-6 pt-6 pb-4">
                                <AnimatePresence mode="wait">
                                    {view !== 'menu' ? (
                                        <motion.button
                                            key="back"
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -8 }}
                                            onClick={() => setView('menu')}
                                            className={`flex items-center gap-1.5 text-[13px] font-medium text-[#0A84FF]`}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                                <path d="M15 18l-6-6 6-6" strokeLinecap="round"/>
                                            </svg>
                                            {activeT.back}
                                        </motion.button>
                                    ) : (
                                        <motion.p
                                            key="title"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${darkMode ? 'text-white/30' : 'text-black/30'}`}
                                        >
                                            RS Pflege
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/[0.08] text-white/40' : 'bg-black/[0.06] text-black/40'} transition-colors`}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                                        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden px-4">
                                <AnimatePresence mode="wait">
                                    {/* — MENU VIEW — */}
                                    {view === 'menu' && (
                                        <motion.div
                                            key="menu"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-2"
                                        >
                                            {user ? (
                                                <>
                                                    {/* User card */}
                                                    <div className={`flex items-center gap-3 p-4 rounded-2xl mb-4 ${darkMode ? 'bg-white/[0.06]' : 'bg-black/[0.04]'}`}>
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0">
                                                            {user.email?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className={`text-[10px] font-medium uppercase tracking-wide mb-0.5 ${darkMode ? 'text-white/30' : 'text-black/30'}`}>{activeT.loggedInAs}</p>
                                                            <p className={`text-[13px] font-medium truncate ${darkMode ? 'text-white/80' : 'text-[#1d1d1f]/80'}`}>{user.email}</p>
                                                        </div>
                                                    </div>
                                                    {isAdmin && (
                                                        <SidebarButton
                                                            onClick={() => setView('inbox')}
                                                            darkMode={darkMode}
                                                            badge={tickets.length}
                                                            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z"/><path d="m22 6-10 7L2 6" strokeLinecap="round"/></svg>}
                                                        >
                                                            Inbox
                                                        </SidebarButton>
                                                    )}
                                                    <SidebarButton onClick={() => setView('settings')} darkMode={darkMode}
                                                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" strokeLinecap="round"/></svg>}
                                                    >
                                                        {activeT.settings}
                                                    </SidebarButton>
                                                    <SidebarButton onClick={() => setView('support')} darkMode={darkMode}
                                                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" strokeLinecap="round"/></svg>}
                                                    >
                                                        {activeT.support}
                                                    </SidebarButton>
                                                    <SidebarButton onClick={handleLogout} darkMode={darkMode} danger
                                                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round"/></svg>}
                                                    >
                                                        {activeT.logout}
                                                    </SidebarButton>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => { setIsLoginOpen(true); setIsOpen(false); }}
                                                        className="w-full py-3.5 rounded-2xl bg-[#0A84FF] text-white text-[13px] font-medium transition-all hover:bg-[#0071E3] active:scale-[0.98] mb-2"
                                                    >
                                                        {activeT.login}
                                                    </button>
                                                    <button
                                                        onClick={() => { setIsLoginOpen(true); setIsOpen(false); }}
                                                        className={`w-full py-3.5 rounded-2xl text-[13px] font-medium border transition-all active:scale-[0.98] ${darkMode ? 'border-white/15 text-white/70 hover:bg-white/[0.06]' : 'border-black/12 text-black/60 hover:bg-black/[0.04]'}`}
                                                    >
                                                        {activeT.register}
                                                    </button>
                                                    <div className={`h-[0.5px] my-3 ${darkMode ? 'bg-white/[0.08]' : 'bg-black/[0.06]'}`} />
                                                    <SidebarButton onClick={() => setView('settings')} darkMode={darkMode}
                                                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" strokeLinecap="round"/></svg>}
                                                    >
                                                        {activeT.settings}
                                                    </SidebarButton>
                                                    <SidebarButton onClick={() => setView('support')} darkMode={darkMode}
                                                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" strokeLinecap="round"/></svg>}
                                                    >
                                                        {activeT.support}
                                                    </SidebarButton>
                                                </>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* — SETTINGS VIEW — */}
                                    {view === 'settings' && (
                                        <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                                            <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] mb-4 px-1 ${darkMode ? 'text-white/30' : 'text-black/30'}`}>{activeT.language}</p>
                                            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
                                                {languages.map((l) => (
                                                    <button
                                                        key={l.code}
                                                        onClick={() => setLang(l.code)}
                                                        className={`w-full px-4 py-3 rounded-xl text-left text-[14px] font-medium transition-all flex items-center gap-3 ${
                                                            lang === l.code
                                                                ? 'bg-[#0A84FF] text-white'
                                                                : darkMode ? 'text-white/60 hover:bg-white/[0.07]' : 'text-black/60 hover:bg-black/[0.04]'
                                                        }`}
                                                    >
                                                        <span>{l.flag}</span>
                                                        {l.name}
                                                        {lang === l.code && (
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 ml-auto">
                                                                <path d="M5 13l4 4L19 7" strokeLinecap="round"/>
                                                            </svg>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* — SUPPORT VIEW — */}
                                    {view === 'support' && (
                                        <motion.div key="support" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                                            <p className={`text-[14px] font-medium mb-4 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>{activeT.supportMsg}</p>
                                            <textarea
                                                value={supportMsg}
                                                onChange={(e) => setSupportMsg(e.target.value)}
                                                rows={5}
                                                className={`w-full rounded-2xl p-4 text-[14px] resize-none outline-none border transition-all ${darkMode ? 'bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 focus:border-[#0A84FF]/50' : 'bg-black/[0.04] border-black/[0.08] text-[#1d1d1f] placeholder:text-black/25 focus:border-[#0A84FF]/50'}`}
                                                placeholder="..."
                                            />
                                            {supportStatus === 'success' ? (
                                                <div className="py-3.5 rounded-2xl bg-[#32D74B]/15 text-[#32D74B] text-[13px] font-medium text-center border border-[#32D74B]/20">
                                                    {activeT.sent} ✓
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={sendSupportTicket}
                                                    disabled={supportStatus === 'sending' || !supportMsg.trim()}
                                                    className="w-full py-3.5 rounded-2xl bg-[#0A84FF] text-white text-[14px] font-medium transition-all hover:bg-[#0071E3] disabled:opacity-40 active:scale-[0.98]"
                                                >
                                                    {supportStatus === 'sending' ? '…' : activeT.sendTicket}
                                                </button>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* — INBOX VIEW (Admin) — */}
                                    {view === 'inbox' && (
                                        <motion.div key="inbox" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-2 overflow-y-auto max-h-[calc(100vh-180px)]">
                                            {tickets.length === 0 ? (
                                                <p className={`text-[13px] py-8 text-center ${darkMode ? 'text-white/25' : 'text-black/25'}`}>Keine Tickets</p>
                                            ) : tickets.map(ticket => (
                                                <div key={ticket.id} className={`p-4 rounded-2xl border flex gap-3 items-start ${darkMode ? 'bg-white/[0.04] border-white/[0.07]' : 'bg-black/[0.03] border-black/[0.06]'}`}>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-semibold text-[#0A84FF] mb-1 truncate">{ticket.user_email}</p>
                                                        <p className={`text-[13px] leading-relaxed ${darkMode ? 'text-white/70' : 'text-black/70'}`}>{ticket.message}</p>
                                                    </div>
                                                    <button onClick={() => deleteTicket(ticket.id)} className="text-red-400/50 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="px-6 pb-6 pt-4">
                                <p className={`text-[11px] text-center font-medium ${darkMode ? 'text-white/15' : 'text-black/15'}`}>RS Pflege v1.2</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* — Floating Dock — */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
                {/* Prices submenu */}
                <AnimatePresence>
                    {showPriceMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.18 }}
                            className={`absolute bottom-full left-0 mb-3 w-[200px] rounded-2xl border overflow-hidden ${darkMode ? 'bg-black/80 border-white/[0.10]' : 'bg-white/90 border-black/[0.08] shadow-lg'}`}
                            style={{ backdropFilter: 'blur(30px) saturate(200%)' }}
                        >
                            <Link
                                to="/preise"
                                onClick={() => setShowPriceMenu(false)}
                                className={`flex items-center justify-between px-5 py-3.5 text-[13px] font-medium transition-colors ${darkMode ? 'text-white/80 hover:bg-white/[0.07]' : 'text-[#1d1d1f]/80 hover:bg-black/[0.04]'}`}
                            >
                                {activeT.prices}
                                <span className="text-[#0A84FF]">→</span>
                            </Link>
                            <div className={`h-[0.5px] ${darkMode ? 'bg-white/[0.07]' : 'bg-black/[0.06]'}`} />
                            <div className={`flex items-center justify-between px-5 py-3.5 text-[13px] font-medium opacity-40 cursor-not-allowed`}>
                                Shop
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${darkMode ? 'bg-[#0A84FF]/15 text-[#0A84FF]' : 'bg-[#0071E3]/10 text-[#0071E3]'}`}>
                                    {activeT.comingSoon}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <nav
                    className={`flex items-center gap-1 px-2 py-2 rounded-full border transition-all duration-500 ${glass}`}
                    style={{ backdropFilter: 'blur(30px) saturate(200%)' }}
                >
                    <NavItem id="home" label={activeT.home} />
                    <NavItem id="about" label={activeT.about} />
                    <NavItem id="gallery" label={activeT.gallery} />
                    <NavItem id="prices" label={activeT.prices} />

                    <div className={`w-[0.5px] h-5 mx-1 ${darkMode ? 'bg-white/[0.12]' : 'bg-black/[0.10]'}`} />

                    <Link
                        to="/#kontakt"
                        onClick={(e) => handleNavClick(e, 'contact')}
                        className="px-5 py-2 rounded-full bg-[#0A84FF] text-white text-[13px] font-medium transition-all hover:bg-[#0071E3] active:scale-[0.95] whitespace-nowrap"
                    >
                        {activeT.contact}
                    </Link>
                </nav>
            </div>
        </div>
    );
}

// Sidebar button helper
function SidebarButton({ children, onClick, darkMode, danger, badge, icon }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all active:scale-[0.98] ${
                danger
                    ? 'text-[#FF3B30] hover:bg-[#FF3B30]/[0.08]'
                    : darkMode ? 'text-white/60 hover:bg-white/[0.07] hover:text-white/90' : 'text-black/55 hover:bg-black/[0.04] hover:text-black/80'
            }`}
        >
            <span className="flex-shrink-0">{icon}</span>
            <span>{children}</span>
            {badge > 0 && (
                <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-[#FF3B30] text-white text-[10px] font-semibold">
                    {badge}
                </span>
            )}
            {!badge && !danger && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 ml-auto opacity-30">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round"/>
                </svg>
            )}
        </button>
    );
}