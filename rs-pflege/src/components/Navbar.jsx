import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../translations';
import { supabase } from '../supabaseClient';

// HIER WEITERE ADMINS HINZUFÜGEN
const ADMIN_EMAILS = [
    'spahiu.endrit09@hotmail.com',
    'rspflege.office@gmail.com',
    'rekicsead6@gmail.com'
];

export default function Navbar({ darkMode, setDarkMode, lang = 'de', setLang, setIsLoginOpen, user, cartCount }) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('menu');
    const [activeSection, setActiveSection] = useState('home');

    // Support & Inbox State
    const [supportMsg, setSupportMsg] = useState("");
    const [supportStatus, setSupportStatus] = useState(null);
    const [tickets, setTickets] = useState([]);

    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === "/";
    const t = translations[lang] || translations.de;

    // Admin Check
    const isAdmin = user && ADMIN_EMAILS.includes(user.email);

    // --- LOGIK FÜR TICKETS ---

    const fetchTickets = async () => {
        if (!isAdmin) return;
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) {
            setTickets(data || []);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchTickets();
            const channel = supabase
                .channel('admin-inbox')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
                    fetchTickets();
                })
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [user, isAdmin]);

    // Einzelnes Ticket löschen
    const deleteTicket = async (id) => {
        setTickets(prev => prev.filter(t => t.id !== id));
        const { error } = await supabase
            .from('support_tickets')
            .delete()
            .eq('id', id);

        if (error) {
            alert("Fehler beim Löschen: " + error.message);
            fetchTickets();
        }
    };

    // Alle Tickets löschen
    const clearAllTickets = async () => {
        if (!window.confirm("Wirklich ALLE Tickets unwiderruflich löschen?")) return;
        setTickets([]);
        const { error } = await supabase
            .from('support_tickets')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) {
            alert("Fehler: " + error.message);
            fetchTickets();
        }
    };

    const sendSupportTicket = async () => {
        if (!supportMsg.trim()) return;
        setSupportStatus('sending');
        const { error } = await supabase.from('support_tickets').insert([{
            user_email: user?.email || 'Anonym',
            message: supportMsg,
            status: 'neu'
        }]);
        if (error) {
            setSupportStatus('error');
        } else {
            setSupportStatus('success');
            setSupportMsg("");
            setTimeout(() => { setSupportStatus(null); setView('menu'); }, 2000);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsOpen(false);
    };

    // --- NAVIGATION HELPER ---

    useEffect(() => {
        if (!isHome) { setActiveSection('preise'); return; }
        const handleScroll = () => {
            if (window.scrollY < 100) { setActiveSection('home'); return; }
            const sections = ['about', 'gallery', 'kontakt'];
            const scrollPos = window.scrollY + 300;
            sections.forEach(id => {
                const el = document.getElementById(id);
                if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
                    setActiveSection(id);
                }
            });
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHome, location.pathname]);

    const glassBase = darkMode
        ? "bg-black/40 border-white/10 text-white shadow-2xl"
        : "bg-white/60 border-black/5 shadow-xl text-black";

    const navItem = (id, label, isLink = false, to = "", mobileHide = false) => {
        const isActive = isLink ? location.pathname === to : (activeSection === id && isHome);
        const handleClick = (e) => {
            if (id === 'home') {
                if (isHome) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
                else { navigate('/'); window.scrollTo(0, 0); }
            }
            if (isOpen) setIsOpen(false);
        };

        const content = (
            <div className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all block relative z-10 
                ${mobileHide ? 'hidden sm:block' : 'block'}
                ${isActive ? 'text-blue-500' : 'opacity-40 hover:opacity-100'}`}>
                <div className="flex items-center gap-1.5">
                    {label}
                    {id === 'preise' && cartCount > 0 && (
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
        return isLink ? (<Link to={to} onClick={handleClick}>{content}</Link>) : (<a href={`#${id}`} onClick={handleClick}>{content}</a>);
    };

    return (
        <>
            {/* THEME TOGGLE */}
            <div className="fixed top-6 left-6 z-[110]">
                <button onClick={() => setDarkMode(!darkMode)} className={`apple-glass p-4 rounded-2xl active:scale-90 transition-all border backdrop-blur-md ${glassBase}`}>
                    {darkMode ? <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> : <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>}
                </button>
            </div>

            {/* MENU TOGGLE MIT ADMIN INBOX BLASE */}
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

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[130]" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className={`fixed top-4 right-4 bottom-4 w-full max-w-[340px] rounded-[2.5rem] p-8 z-[140] flex flex-col border ${glassBase}`}>

                            <div className="flex items-center justify-between mb-8 mt-10">
                                {view !== 'menu' ? (
                                    <button onClick={() => setView('menu')} className="text-[10px] font-black uppercase text-blue-500 flex items-center gap-2">← {t.back}</button>
                                ) : (
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">{user ? 'Account' : 'RS Account'}</p>
                                )}
                            </div>

                            <AnimatePresence mode="wait">
                                {view === 'menu' && (
                                    <motion.div key="menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                        {user ? (
                                            <div className="space-y-3 mb-6">
                                                <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                                                    <p className="text-[8px] font-black uppercase opacity-40 mb-1 tracking-widest">{t.loggedInAs}</p>
                                                    <p className="text-[11px] font-bold truncate tracking-tight">{user.email}</p>
                                                </div>
                                                {isAdmin && (
                                                    <button onClick={() => setView('inbox')} className="w-full py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">📥 Support Inbox ({tickets.length})</button>
                                                )}
                                                <button onClick={handleLogout} className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">{t.logout}</button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3 mb-6">
                                                <button onClick={() => { setIsLoginOpen(true); setIsOpen(false); }} className="py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">{t.login}</button>
                                                <button onClick={() => { setIsLoginOpen(true); setIsOpen(false); }} className="py-4 rounded-2xl border border-current opacity-60 text-[10px] font-black uppercase tracking-widest">{t.register}</button>
                                            </div>
                                        )}
                                        <button onClick={() => setView('settings')} className={`w-full p-5 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-black/5'} flex items-center justify-between transition-all hover:bg-blue-600 hover:text-white group`}>
                                            <span className="text-[11px] font-black uppercase tracking-widest">{t.settings}</span>
                                            <span className="opacity-40 group-hover:translate-x-1 transition-transform">→</span>
                                        </button>
                                        <button onClick={() => setView('support')} className={`w-full p-5 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-black/5'} flex items-center justify-between transition-all hover:bg-blue-600 hover:text-white group`}>
                                            <span className="text-[11px] font-black uppercase tracking-widest">{t.support}</span>
                                            <span className="opacity-40 group-hover:translate-x-1 transition-transform">→</span>
                                        </button>
                                    </motion.div>
                                )}

                                {view === 'inbox' && (
                                    <motion.div key="inbox" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Inbox</p>
                                                <p className="text-[8px] opacity-40 uppercase">{tickets.length} Nachrichten</p>
                                            </div>
                                            {tickets.length > 0 && (
                                                <button onClick={clearAllTickets} className="text-[8px] font-black uppercase text-red-500 px-3 py-1.5 rounded-lg border border-red-500/20">Clear All</button>
                                            )}
                                        </div>
                                        <div className="space-y-3 overflow-y-auto max-h-[55vh] pr-2 custom-scrollbar">
                                            {tickets.map(ticket => (
                                                <div key={ticket.id} className={`group relative p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                                                    <button onClick={() => deleteTicket(ticket.id)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                                                    <p className="text-[8px] opacity-40 font-bold mb-1 uppercase tracking-tighter">{ticket.user_email}</p>
                                                    <p className="text-[11px] font-medium leading-relaxed italic mb-3">"{ticket.message}"</p>
                                                    <a href={`mailto:${ticket.user_email}`} className="text-[8px] font-black uppercase text-blue-500 hover:underline">Antworten →</a>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {view === 'support' && (
                                    <motion.div key="support" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">{supportStatus === 'success' ? 'Erfolgreich!' : 'Support'}</p>
                                        {supportStatus !== 'success' && (
                                            <>
                                                <textarea value={supportMsg} onChange={(e) => setSupportMsg(e.target.value)} className={`w-full h-32 rounded-2xl p-4 text-xs font-medium outline-none resize-none ${darkMode ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`} placeholder="Deine Nachricht..."></textarea>
                                                <button onClick={sendSupportTicket} disabled={supportStatus === 'sending'} className="w-full py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">{supportStatus === 'sending' ? '...' : 'Send Ticket'}</button>
                                            </>
                                        )}
                                    </motion.div>
                                )}

                                {view === 'settings' && (
                                    <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">{t.language}</p>
                                        <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[40vh]">
                                            {Object.keys(translations).map((code) => (
                                                <button key={code} onClick={() => setLang(code)} className={`p-4 rounded-xl text-left text-[10px] font-black uppercase transition-all ${lang === code ? 'bg-blue-600 text-white' : 'bg-current/5'}`}>
                                                    {code === 'de' ? 'Deutsch' : code === 'en' ? 'English' : code.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="mt-auto"><p className="text-[8px] text-center opacity-20 font-black uppercase tracking-[0.4em]">RS Pflege v1.2</p></div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* OPTIMIERTES DOCK FÜR MOBILE */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] sm:w-auto">
                <nav className={`apple-glass rounded-full px-4 sm:px-5 py-2 flex items-center justify-between sm:justify-center gap-1 sm:gap-2 backdrop-blur-3xl border transition-all duration-500 ${glassBase}`}>
                    <div className="flex gap-1 items-center">
                        {navItem('home', t.home, !isHome, '/')}
                        {isHome && navItem('about', t.about, false, "", true)}
                        {isHome && navItem('gallery', t.gallery, false, "", true)}
                        {navItem('preise', t.prices, true, '/preise')}
                    </div>
                    <div className="h-6 w-[1px] bg-current opacity-10 mx-1 hidden sm:block"></div>
                    <a href={isHome ? "#kontakt" : "/#kontakt"} className="bg-blue-600 hover:bg-blue-500 text-white px-5 sm:px-7 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] shadow-lg active:scale-95 transition-all whitespace-nowrap">
                        {t.contact}
                    </a>
                </nav>
            </div>
        </>
    );
}