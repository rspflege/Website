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
        { code: 'de', name: 'Deutsch' }, { code: 'en', name: 'English' },
        { code: 'bs', name: 'Bosanski' }, { code: 'sq', name: 'Shqip' },
        { code: 'it', name: 'Italiano' }, { code: 'es', name: 'Español' },
        { code: 'tr', name: 'Türkçe' }, { code: 'fr', name: 'Français' },
        { code: 'hr', name: 'Hrvatski' }, { code: 'sr', name: 'Srpski' }
    ];

    const glassBase = darkMode
        ? 'bg-black/40 border-white/10 text-white shadow-2xl'
        : 'bg-white/60 border-black/5 shadow-xl text-black';

    // Nav item — original exact style
    const navItem = (id, label) => {
        const isActive = activeSection === id;
        let linkPath = `/#${id}`;
        if (id === 'home') linkPath = '/';

        const content = (
            <div className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${
                isActive ? 'text-blue-500' : 'opacity-40 hover:opacity-100'
            }`}>
                <div className="flex items-center gap-1.5 whitespace-nowrap relative z-10">
                    {label}
                    {id === 'prices' && cartCount > 0 && (
                        <span className="bg-blue-600 text-white text-[8px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center">
                            {cartCount}
                        </span>
                    )}
                </div>
                {isActive && (
                    <motion.div
                        layoutId="activeDockTab"
                        className="absolute inset-0 bg-blue-500/10 rounded-xl z-0"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.55 }}
                    />
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

    return (
        <>
            {/* Dark mode toggle + weather */}
            <div className="fixed top-6 left-6 z-[110] flex items-center gap-2 sm:gap-3">
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`apple-glass p-3.5 sm:p-4 rounded-2xl active:scale-90 transition-all border backdrop-blur-md ${glassBase}`}
                >
                    {darkMode ? (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="5" />
                            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                        </svg>
                    )}
                </button>
                <WeatherWidget darkMode={darkMode} lang={lang} />
            </div>

            {/* Hamburger — shows 3 lines when closed, X when open. No X rendered until isOpen */}
            <div className="fixed top-6 right-6 z-[150]">
                <button
                    onClick={() => { setIsOpen(!isOpen); if (!isOpen) setView('menu'); }}
                    className={`relative apple-glass p-4 rounded-2xl active:scale-90 transition-all border backdrop-blur-md ${glassBase}`}
                >
                    {isAdmin && tickets.length > 0 && !isOpen && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white animate-bounce shadow-lg">
                            {tickets.length}
                        </span>
                    )}
                    <div className="w-6 h-5 flex flex-col justify-between items-end relative">
                        <motion.div
                            animate={isOpen ? { rotate: 45, y: 9, width: '100%' } : { rotate: 0, y: 0, width: '100%' }}
                            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                            className="h-0.5 bg-current rounded-full origin-center"
                        />
                        <motion.div
                            animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                            transition={{ duration: 0.18 }}
                            className="h-0.5 bg-current rounded-full"
                            style={{ width: '66%' }}
                        />
                        <motion.div
                            animate={isOpen ? { rotate: -45, y: -9, width: '100%' } : { rotate: 0, y: 0, width: '83%' }}
                            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                            className="h-0.5 bg-current rounded-full origin-center"
                        />
                    </div>
                </button>
            </div>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[130]"
                        />
                        <motion.div
                            initial={{ x: '110%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '110%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            className={`fixed top-4 right-4 bottom-4 w-full max-w-[340px] rounded-[2.5rem] p-8 z-[140] flex flex-col border ${glassBase} backdrop-blur-3xl`}
                        >
                            {/* Sidebar header — no X button here since the hamburger IS the toggle */}
                            <div className="flex items-center justify-between mb-8 mt-10">
                                <AnimatePresence mode="wait">
                                    {view !== 'menu' ? (
                                        <motion.button
                                            key="back"
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -8 }}
                                            transition={{ duration: 0.18 }}
                                            onClick={() => setView('menu')}
                                            className="text-[10px] font-black uppercase text-blue-500 flex items-center gap-2 hover:opacity-70 transition-opacity"
                                        >
                                            ← {activeT.back}
                                        </motion.button>
                                    ) : (
                                        <motion.p
                                            key="title"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500"
                                        >
                                            {user ? 'ACCOUNT' : 'RS ACCOUNT'}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <AnimatePresence mode="wait">
                                    {/* MENU */}
                                    {view === 'menu' && (
                                        <motion.div
                                            key="menu"
                                            initial={{ opacity: 0, x: 24 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -24 }}
                                            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                                            className="space-y-4"
                                        >
                                            {user ? (
                                                <div className="space-y-3 mb-6">
                                                    <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                                                        <p className="text-[8px] font-black uppercase opacity-40 mb-1 tracking-widest">{activeT.loggedInAs}</p>
                                                        <p className="text-[11px] font-bold truncate tracking-tight">{user.email}</p>
                                                    </div>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => setView('inbox')}
                                                            className="w-full py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-500 transition-all"
                                                        >
                                                            📥 Inbox ({tickets.length})
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        {activeT.logout}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-3 mb-6">
                                                    <button
                                                        onClick={() => { setIsLoginOpen(true); setIsOpen(false); }}
                                                        className="py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all"
                                                    >
                                                        {activeT.login}
                                                    </button>
                                                    <button
                                                        onClick={() => { setIsLoginOpen(true); setIsOpen(false); }}
                                                        className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${darkMode ? 'border-white/15 text-white/60 hover:border-white/30' : 'border-black/12 text-black/50 hover:border-black/25'}`}
                                                    >
                                                        {activeT.register}
                                                    </button>
                                                </div>
                                            )}

                                            {[
                                                { key: 'settings', label: activeT.settings },
                                                { key: 'support', label: activeT.support },
                                            ].map(item => (
                                                <button
                                                    key={item.key}
                                                    onClick={() => setView(item.key)}
                                                    className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all group hover:bg-blue-600 hover:text-white ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}
                                                >
                                                    <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                                    <motion.span
                                                        animate={{ x: 0 }}
                                                        whileHover={{ x: 4 }}
                                                        className="transition-transform"
                                                    >→</motion.span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}

                                    {/* SETTINGS */}
                                    {view === 'settings' && (
                                        <motion.div
                                            key="settings"
                                            initial={{ opacity: 0, x: 24 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -24 }}
                                            transition={{ duration: 0.22 }}
                                            className="space-y-4"
                                        >
                                            <p className="text-[10px] opacity-40 font-black uppercase tracking-widest mb-4">{activeT.language}</p>
                                            <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[55vh] pr-1">
                                                {languages.map(l => (
                                                    <button
                                                        key={l.code}
                                                        onClick={() => setLang(l.code)}
                                                        className={`p-4 rounded-xl text-left text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${
                                                            lang === l.code
                                                                ? 'bg-blue-600 text-white'
                                                                : darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'
                                                        }`}
                                                    >
                                                        {l.name}
                                                        {lang === l.code && <span className="opacity-80">✓</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* SUPPORT */}
                                    {view === 'support' && (
                                        <motion.div
                                            key="support"
                                            initial={{ opacity: 0, x: 24 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -24 }}
                                            transition={{ duration: 0.22 }}
                                            className="space-y-4"
                                        >
                                            <p className={`text-sm font-bold opacity-60 mb-2`}>{activeT.supportMsg}</p>
                                            <textarea
                                                value={supportMsg}
                                                onChange={e => setSupportMsg(e.target.value)}
                                                rows={5}
                                                className={`w-full rounded-2xl p-4 text-xs resize-none outline-none border transition-all ${
                                                    darkMode ? 'bg-white/5 border-white/10 focus:border-blue-500 text-white placeholder:text-white/30' : 'bg-black/5 border-black/10 focus:border-blue-500 text-black'
                                                }`}
                                                placeholder="..."
                                            />
                                            {supportStatus === 'success' ? (
                                                <div className="py-4 rounded-2xl bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest text-center border border-green-500/20">
                                                    {activeT.sent} ✓
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={sendSupportTicket}
                                                    disabled={supportStatus === 'sending' || !supportMsg.trim()}
                                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-blue-500 transition-all"
                                                >
                                                    {supportStatus === 'sending' ? '...' : activeT.sendTicket}
                                                </button>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* INBOX (Admin) */}
                                    {view === 'inbox' && (
                                        <motion.div
                                            key="inbox"
                                            initial={{ opacity: 0, x: 24 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -24 }}
                                            transition={{ duration: 0.22 }}
                                            className="space-y-3"
                                        >
                                            {tickets.length === 0 ? (
                                                <p className={`text-center py-10 text-xs font-black uppercase opacity-30`}>Keine Tickets</p>
                                            ) : tickets.map(ticket => (
                                                <div key={ticket.id} className={`p-4 rounded-2xl border flex gap-3 ${darkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[9px] font-black uppercase text-blue-500 mb-1 truncate">{ticket.user_email}</p>
                                                        <p className="text-xs font-medium leading-relaxed opacity-70 break-words">{ticket.message}</p>
                                                    </div>
                                                    <button onClick={() => deleteTicket(ticket.id)} className="text-red-500/40 hover:text-red-500 transition-colors flex-shrink-0 text-lg leading-none">×</button>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="mt-auto pt-4">
                                <p className="text-[8px] text-center opacity-20 font-black uppercase tracking-[0.4em]">RS Pflege v1.2</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Floating Dock */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] sm:w-auto">
                {/* Prices dropdown — spring animation, centered above dock */}
                <AnimatePresence>
                    {showPriceMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[220px] apple-glass border rounded-[2rem] p-2 flex flex-col gap-1 backdrop-blur-3xl shadow-2xl ${glassBase}`}
                        >
                            <Link
                                to="/preise"
                                onClick={() => setShowPriceMenu(false)}
                                className="flex items-center justify-between px-6 py-4 hover:bg-blue-600 hover:text-white rounded-[1.5rem] transition-all group"
                            >
                                <span className="text-[10px] font-black uppercase italic tracking-widest">{activeT.prices}</span>
                                <motion.span
                                    initial={{ x: 0 }}
                                    whileHover={{ x: 3 }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >✨</motion.span>
                            </Link>
                            <div className="h-[1px] w-full bg-current opacity-5 mx-3" style={{ width: 'calc(100% - 24px)' }} />
                            <div className="flex items-center justify-between px-6 py-4 opacity-40 cursor-not-allowed">
                                <span className="text-[10px] font-black uppercase italic tracking-widest">Shop</span>
                                <span className="text-[8px] bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full uppercase">{activeT.comingSoon}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dock */}
                <nav className={`apple-glass rounded-full px-2 sm:px-6 py-2 flex items-center justify-between sm:justify-center gap-1 sm:gap-2 backdrop-blur-3xl border transition-all duration-500 ${glassBase}`}>
                    <div className="flex gap-0.5 sm:gap-1 items-center">
                        {navItem('home', activeT.home)}
                        {navItem('about', activeT.about)}
                        {navItem('gallery', activeT.gallery)}
                        {navItem('prices', activeT.prices)}
                    </div>

                    <div className="h-6 w-[1px] bg-current opacity-10 mx-1 sm:mx-2 flex-shrink-0" />

                    <Link
                        to="/#kontakt"
                        onClick={(e) => handleNavClick(e, 'kontakt')}
                        className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-7 py-2.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] shadow-lg active:scale-95 transition-all whitespace-nowrap"
                    >
                        {activeT.contact}
                    </Link>
                </nav>
            </div>
        </>
    );
}