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

// Reduced motion helper — disables heavy animations on low-end devices / user preference
const prefersReducedMotion =
    typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

const springFast  = prefersReducedMotion ? { duration: 0.01 } : { type: 'spring', damping: 26, stiffness: 220 };
const easeFast    = prefersReducedMotion ? { duration: 0.01 } : { duration: 0.22, ease: [0.4, 0, 0.2, 1] };
const easeQuick   = prefersReducedMotion ? { duration: 0.01 } : { duration: 0.18 };

export default function Navbar({ darkMode, setDarkMode, lang = 'de', setLang, setIsLoginOpen, user, cartCount, t }) {
    const [isOpen, setIsOpen]               = useState(false);
    const [view, setView]                   = useState('menu');
    const [activeSection, setActiveSection] = useState('home');
    const [showPriceMenu, setShowPriceMenu] = useState(false);
    const [isMobile, setIsMobile]           = useState(typeof window !== 'undefined' && window.innerWidth < 640);
    const [supportMsg, setSupportMsg]       = useState('');
    const [supportStatus, setSupportStatus] = useState(null);
    const [tickets, setTickets]             = useState([]);

    const location      = useLocation();
    const navigate      = useNavigate();
    const isHome        = location.pathname === '/';
    const lastScrollTime = useRef(0);

    const activeT = t || translations[lang] || translations.de;
    const isAdmin = user && ADMIN_EMAILS.includes(user.email);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize, { passive: true });
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchTickets = useCallback(async () => {
        if (!isAdmin) return;
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error) setTickets(data || []);
    }, [isAdmin]);

    useEffect(() => {
        if (!isAdmin) return;
        fetchTickets();
        const channel = supabase.channel('admin-inbox')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, fetchTickets)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
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

        const detectSection = () => {
            if (window.scrollY < 100) { setActiveSection('home'); return; }
            const sections  = ['about', 'gallery', 'kontakt'];
            const scrollPos = window.scrollY + 300;
            for (const id of sections) {
                const el = document.getElementById(id);
                if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
                    setActiveSection(id); return;
                }
            }
            setActiveSection('home');
        };

        // Sofort beim Mounten ausführen — kein Warten auf ersten Scroll
        detectSection();

        const handleScroll = () => {
            const now = Date.now();
            if (now - lastScrollTime.current < 80) return;
            lastScrollTime.current = now;
            detectSection();
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHome, location.pathname]);

    const handleLogout = async () => { await supabase.auth.signOut(); setIsOpen(false); };

    const deleteTicket = async (id) => {
        setTickets(prev => prev.filter(tk => tk.id !== id));
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
        { code: 'de', name: 'Deutsch' },   { code: 'en', name: 'English' },
        { code: 'bs', name: 'Bosanski' },  { code: 'sq', name: 'Shqip' },
        { code: 'it', name: 'Italiano' },  { code: 'es', name: 'Español' },
        { code: 'tr', name: 'Türkçe' },    { code: 'fr', name: 'Français' },
        { code: 'hr', name: 'Hrvatski' },  { code: 'sr', name: 'Srpski' },
    ];

    const glassBase = darkMode
        ? 'bg-black/50 border-white/10 text-white shadow-2xl'
        : 'bg-white/70 border-black/5 shadow-xl text-black';

    // ── Nav item ────────────────────────────────────────────────────────────
    const NavItem = ({ id, label }) => {
        const isActive   = activeSection === id;
        const linkPath   = id === 'home' ? '/' : `/#${id}`;

        const inner = (
            <div className={`relative px-2.5 sm:px-3 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors ${
                isActive ? 'text-blue-500' : `${darkMode ? 'text-white/40 hover:text-white/80' : 'text-black/40 hover:text-black/80'}`
            }`}>
                <div className="flex items-center gap-1 whitespace-nowrap relative z-10">
                    {label}
                    {id === 'prices' && cartCount > 0 && (
                        <span className="bg-blue-600 text-white text-[7px] min-w-[13px] h-[13px] rounded-full flex items-center justify-center leading-none">
                            {cartCount}
                        </span>
                    )}
                </div>
                {isActive && (
                    <motion.div
                        layoutId="activeDockTab"
                        initial={false}
                        className="absolute inset-0 bg-blue-500/10 rounded-xl z-0"
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
                    />
                )}
            </div>
        );

        if (id === 'prices') {
            return (
                <button onClick={() => setShowPriceMenu(p => !p)} className="relative">
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
        <>
            {/* ── Top-left: Dark mode + Weather ── */}
            <div className="fixed top-5 left-4 sm:top-6 sm:left-6 z-[110] flex items-center gap-2">
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-3 sm:p-3.5 rounded-2xl active:scale-90 transition-transform border backdrop-blur-xl ${glassBase}`}
                    style={{ willChange: 'transform' }}
                >
                    {darkMode ? (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="5" />
                            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                        </svg>
                    )}
                </button>
                <WeatherWidget darkMode={darkMode} lang={lang} />
            </div>

            {/* ── Top-right: Hamburger ── */}
            <div className="fixed top-5 right-4 sm:top-6 sm:right-6 z-[150]">
                <button
                    onClick={() => { setIsOpen(o => !o); if (!isOpen) setView('menu'); }}
                    className={`relative p-3 sm:p-4 rounded-2xl active:scale-90 transition-transform border backdrop-blur-xl ${glassBase}`}
                    style={{ willChange: 'transform' }}
                    aria-label="Menü"
                >
                    {isAdmin && tickets.length > 0 && !isOpen && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white shadow-lg z-10">
                            {tickets.length}
                        </span>
                    )}
                    <div className="w-5 h-4 sm:w-6 sm:h-5 flex flex-col justify-between items-end">
                        <motion.div animate={isOpen ? { rotate: 45, y: 8, width: '100%' } : { rotate: 0, y: 0, width: '100%' }}
                            transition={easeFast} className="h-0.5 bg-current rounded-full origin-center" />
                        <motion.div animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                            transition={easeQuick} className="h-0.5 bg-current rounded-full" style={{ width: '66%' }} />
                        <motion.div animate={isOpen ? { rotate: -45, y: -8, width: '100%' } : { rotate: 0, y: 0, width: '83%' }}
                            transition={easeFast} className="h-0.5 bg-current rounded-full origin-center" />
                    </div>
                </button>
            </div>

            {/* ── Sidebar ── */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={easeQuick}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 z-[130]"
                            // No backdrop-blur here — huge perf win on mobile
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '110%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '110%', opacity: 0 }}
                            transition={springFast}
                            className={`fixed top-3 right-3 bottom-3 w-full max-w-[320px] sm:max-w-[340px] rounded-[2.5rem] p-7 z-[140] flex flex-col border ${glassBase} backdrop-blur-2xl`}
                            style={{ willChange: 'transform' }}
                        >
                            {/* Panel header */}
                            <div className="flex items-center justify-between mb-7 mt-10">
                                <AnimatePresence mode="wait">
                                    {view !== 'menu' ? (
                                        <motion.button key="back"
                                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                                            transition={easeQuick}
                                            onClick={() => setView('menu')}
                                            className="text-[10px] font-black uppercase text-blue-500 flex items-center gap-2 active:opacity-60 transition-opacity"
                                        >
                                            ← {activeT.back}
                                        </motion.button>
                                    ) : (
                                        <motion.p key="title"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500"
                                        >
                                            {user ? 'ACCOUNT' : 'RS ACCOUNT'}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex-1 overflow-y-auto overscroll-contain">
                                <AnimatePresence mode="wait">

                                    {/* MENU VIEW */}
                                    {view === 'menu' && (
                                        <motion.div key="menu"
                                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                            transition={easeFast} className="space-y-3"
                                        >
                                            {user ? (
                                                <div className="space-y-3 mb-5">
                                                    <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                                                        <p className="text-[8px] font-black uppercase opacity-40 mb-1 tracking-widest">{activeT.loggedInAs}</p>
                                                        <p className="text-[11px] font-bold truncate tracking-tight">{user.email}</p>
                                                    </div>
                                                    {isAdmin && (
                                                        <button onClick={() => setView('inbox')}
                                                            className="w-full py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg active:bg-blue-700 transition-colors">
                                                            📥 Inbox ({tickets.length})
                                                        </button>
                                                    )}
                                                    <button onClick={handleLogout}
                                                        className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest active:bg-red-500 active:text-white transition-colors">
                                                        {activeT.logout}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-3 mb-5">
                                                    <button onClick={() => { setIsLoginOpen(true); setIsOpen(false); }}
                                                        className="py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest active:bg-blue-700 transition-colors">
                                                        {activeT.login}
                                                    </button>
                                                    <button onClick={() => { setIsLoginOpen(true); setIsOpen(false); }}
                                                        className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-colors ${darkMode ? 'border-white/15 text-white/60 active:border-white/30' : 'border-black/12 text-black/50 active:border-black/25'}`}>
                                                        {activeT.register}
                                                    </button>
                                                </div>
                                            )}

                                            {[
                                                { key: 'settings', label: activeT.settings },
                                                { key: 'support',  label: activeT.support },
                                            ].map(item => (
                                                <button key={item.key} onClick={() => setView(item.key)}
                                                    className={`w-full p-5 rounded-2xl flex items-center justify-between transition-colors active:bg-blue-600 active:text-white ${darkMode ? 'bg-white/5 hover:bg-white/8' : 'bg-black/5 hover:bg-black/8'}`}>
                                                    <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                                    <span className="opacity-40">→</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}

                                    {/* SETTINGS VIEW */}
                                    {view === 'settings' && (
                                        <motion.div key="settings"
                                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                            transition={easeFast} className="space-y-3"
                                        >
                                            <p className="text-[10px] opacity-40 font-black uppercase tracking-widest mb-3">{activeT.language}</p>
                                            <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[52vh] overscroll-contain pr-0.5">
                                                {languages.map(l => (
                                                    <button key={l.code} onClick={() => setLang(l.code)}
                                                        className={`p-4 rounded-xl text-left text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-between ${
                                                            lang === l.code
                                                                ? 'bg-blue-600 text-white'
                                                                : darkMode ? 'bg-white/5 active:bg-white/10' : 'bg-black/5 active:bg-black/10'
                                                        }`}>
                                                        {l.name}
                                                        {lang === l.code && <span className="opacity-80">✓</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* SUPPORT VIEW */}
                                    {view === 'support' && (
                                        <motion.div key="support"
                                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                            transition={easeFast} className="space-y-4"
                                        >
                                            <p className={`text-sm font-bold opacity-60 mb-2`}>{activeT.supportMsg}</p>
                                            <textarea
                                                value={supportMsg}
                                                onChange={e => setSupportMsg(e.target.value)}
                                                rows={5}
                                                className={`w-full rounded-2xl p-4 text-xs resize-none outline-none border transition-colors ${
                                                    darkMode
                                                        ? 'bg-white/5 border-white/10 focus:border-blue-500 text-white placeholder:text-white/30'
                                                        : 'bg-black/5 border-black/10 focus:border-blue-500 text-black'
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
                                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-40 active:bg-blue-700 transition-colors"
                                                >
                                                    {supportStatus === 'sending' ? '...' : activeT.sendTicket}
                                                </button>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* INBOX VIEW (Admin) */}
                                    {view === 'inbox' && (
                                        <motion.div key="inbox"
                                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                            transition={easeFast} className="space-y-3"
                                        >
                                            {tickets.length === 0 ? (
                                                <p className="text-center py-10 text-xs font-black uppercase opacity-30">Keine Tickets</p>
                                            ) : tickets.map(ticket => (
                                                <div key={ticket.id} className={`p-4 rounded-2xl border flex gap-3 ${darkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[9px] font-black uppercase text-blue-500 mb-1 truncate">{ticket.user_email}</p>
                                                        <p className="text-xs font-medium leading-relaxed opacity-70 break-words">{ticket.message}</p>
                                                    </div>
                                                    <button onClick={() => deleteTicket(ticket.id)}
                                                        className="text-red-500/40 active:text-red-500 transition-colors flex-shrink-0 text-lg leading-none p-1">
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}

                                </AnimatePresence>
                            </div>

                            <div className="pt-4">
                                <p className="text-[8px] text-center opacity-20 font-black uppercase tracking-[0.4em]">RS Pflege v1.2</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Bottom Floating Dock ── */}
            <div className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100]"
                style={{ width: 'calc(100vw - 32px)', maxWidth: '480px' }}>

                {/* Prices dropdown */}
                <AnimatePresence>
                    {showPriceMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 border rounded-[2rem] p-2 flex flex-col gap-1 backdrop-blur-2xl shadow-2xl ${glassBase}`}
                            style={{ willChange: 'transform, opacity' }}
                        >
                            <Link to="/preise" onClick={() => setShowPriceMenu(false)}
                                className="flex items-center justify-between px-5 py-3.5 active:bg-blue-600 active:text-white rounded-[1.5rem] transition-colors group">
                                <span className="text-[10px] font-black uppercase italic tracking-widest">{activeT.prices}</span>
                                <span className="opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">✨</span>
                            </Link>
                            <div className={`h-px mx-4 ${darkMode ? 'bg-white/8' : 'bg-black/6'}`} />
                            <div className="flex items-center justify-between px-5 py-3.5 opacity-35 cursor-not-allowed">
                                <span className="text-[10px] font-black uppercase italic tracking-widest">Shop</span>
                                <span className="text-[8px] bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full uppercase">{activeT.comingSoon}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Dock ──
                    Mobile: alle 4 Nav-Items + Kontakt auf einer Zeile, aber kompakt.
                    Wir nutzen flex mit overflow-hidden + min-w-0 auf Labels statt fester px.
                    Kontakt-Button ist gekürzt auf Mobile falls nötig.
                */}
                <nav className={`rounded-full px-3 sm:px-5 py-2 flex items-center justify-between backdrop-blur-2xl border transition-all duration-500 ${glassBase}`}
                    style={{ willChange: 'auto' }}>

                    {/* Nav items — shrink together on small screens */}
                    <div className="flex items-center gap-0 sm:gap-1 min-w-0 flex-shrink">
                        <NavItem id="home"    label={activeT.home} />
                        <NavItem id="about"   label={activeT.about} />
                        <NavItem id="gallery" label={activeT.gallery} />
                        <NavItem id="prices"  label={activeT.prices} />
                    </div>

                    {/* Divider */}
                    <div className={`h-5 w-px mx-1.5 sm:mx-3 flex-shrink-0 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />

                    {/* Contact CTA */}
                    <Link
                        to="/#kontakt"
                        onClick={(e) => handleNavClick(e, 'kontakt')}
                        className="flex-shrink-0 bg-blue-600 active:bg-blue-700 text-white px-3.5 sm:px-6 py-2 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] shadow-lg transition-colors whitespace-nowrap"
                        style={{ willChange: 'transform' }}
                    >
                        {/* On very small screens show a shorter label */}
                        <span className="hidden xs:inline">{activeT.contact}</span>
                        <span className="xs:hidden">
                            {/* Abbreviate if translation is long */}
                            {(activeT.contact?.length ?? 0) > 7 ? activeT.contact?.slice(0, 7) + '…' : activeT.contact}
                        </span>
                    </Link>
                </nav>
            </div>
        </>
    );
}