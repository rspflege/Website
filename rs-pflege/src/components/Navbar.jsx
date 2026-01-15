import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../translations';
import { supabase } from '../supabaseClient';

// ADMIN LISTE
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

    const isAdmin = user && ADMIN_EMAILS.includes(user.email);

    // --- TICKETS LADEN ---
    const fetchTickets = async () => {
        if (!isAdmin) return;
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setTickets(data || []);
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

    const deleteTicket = async (id) => {
        const { error } = await supabase.from('support_tickets').delete().eq('id', id);
        if (!error) fetchTickets();
    };

    const clearAllTickets = async () => {
        if (!window.confirm("Alle Tickets löschen?")) return;
        const { error } = await supabase.from('support_tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (!error) fetchTickets();
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

    // --- NAVIGATION LOGIK ---
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

    const navItem = (id, label, isLink = false, to = "", hideOnMobile = false) => {
        const isActive = isLink ? location.pathname === to : (activeSection === id && isHome);
        const content = (
            <div className={`px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all block relative z-10 
                ${hideOnMobile ? 'hidden sm:block' : 'block'}
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
        return isLink ? (<Link to={to} onClick={() => setIsOpen(false)}>{content}</Link>) : (<a href={`#${id}`} onClick={() => setIsOpen(false)}>{content}</a>);
    };

    return (
        <>
            {/* THEME TOGGLE */}
            <div className="fixed top-6 left-6 z-[110]">
                <button onClick={() => setDarkMode(!darkMode)} className={`p-3 sm:p-4 rounded-2xl active:scale-90 transition-all border backdrop-blur-md ${glassBase}`}>
                    {darkMode ? "☀️" : "🌙"}
                </button>
            </div>

            {/* MENU TOGGLE */}
            <div className="fixed top-6 right-6 z-[150]">
                <button onClick={() => setIsOpen(!isOpen)} className={`relative p-3 sm:p-4 rounded-2xl active:scale-90 transition-all border backdrop-blur-md ${glassBase}`}>
                    {isAdmin && tickets.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white animate-bounce">{tickets.length}</span>
                    )}
                    <div className="w-6 h-5 flex flex-col justify-between items-end">
                        <div className={`h-0.5 bg-current transition-all ${isOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`}></div>
                        <div className={`h-0.5 bg-current transition-all ${isOpen ? 'opacity-0' : 'w-4'}`}></div>
                        <div className={`h-0.5 bg-current transition-all ${isOpen ? 'w-6 -rotate-45 -translate-y-2.5' : 'w-5'}`}></div>
                    </div>
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[130]" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className={`fixed top-4 right-4 bottom-4 w-full max-w-[340px] rounded-[2.5rem] p-8 z-[140] flex flex-col border ${glassBase}`}>

                            <div className="flex items-center justify-between mb-8 mt-10">
                                {view !== 'menu' && <button onClick={() => setView('menu')} className="text-[10px] font-black uppercase text-blue-500">← {t.back}</button>}
                            </div>

                            <AnimatePresence mode="wait">
                                {view === 'menu' && (
                                    <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                        {user ? (
                                            <div className="space-y-3 mb-6">
                                                <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                                                    <p className="text-[8px] font-black uppercase opacity-40 mb-1">{t.loggedInAs}</p>
                                                    <p className="text-[11px] font-bold truncate">{user.email}</p>
                                                </div>
                                                {isAdmin && <button onClick={() => setView('inbox')} className="w-full py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">📥 Admin Inbox ({tickets.length})</button>}
                                                <button onClick={handleLogout} className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase">{t.logout}</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setIsLoginOpen(true); setIsOpen(false); }} className="w-full py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase mb-6">{t.login}</button>
                                        )}
                                        <button onClick={() => setView('settings')} className={`w-full p-5 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-black/5'} flex justify-between uppercase text-[10px] font-black`}><span>{t.settings}</span> <span>→</span></button>
                                        <button onClick={() => setView('support')} className={`w-full p-5 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-black/5'} flex justify-between uppercase text-[10px] font-black`}><span>{t.support}</span> <span>→</span></button>
                                    </motion.div>
                                )}

                                {view === 'inbox' && (
                                    <motion.div key="inbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-[10px] font-black uppercase text-blue-500">Inbox</p>
                                            <button onClick={clearAllTickets} className="text-[8px] text-red-500 uppercase font-black">Löschen</button>
                                        </div>
                                        <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-2">
                                            {tickets.map(ticket => (
                                                <div key={ticket.id} className="p-4 rounded-2xl border bg-black/5 relative">
                                                    <button onClick={() => deleteTicket(ticket.id)} className="absolute top-2 right-2 text-red-500">✕</button>
                                                    <p className="text-[8px] opacity-40">{ticket.user_email}</p>
                                                    <p className="text-[11px] my-2 italic">"{ticket.message}"</p>
                                                    <a href={`mailto:${ticket.user_email}`} className="text-[8px] text-blue-500 font-black">ANTWORTEN</a>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {view === 'support' && (
                                    <motion.div key="support" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                        <p className="text-[10px] font-black uppercase opacity-40">Support Nachricht</p>
                                        {supportStatus === 'success' ? <p className="text-green-500 font-bold">Gesendet!</p> : (
                                            <>
                                                <textarea value={supportMsg} onChange={(e) => setSupportMsg(e.target.value)} className={`w-full h-32 rounded-2xl p-4 text-xs outline-none ${darkMode ? 'bg-white/5' : 'bg-black/5'}`} placeholder="Wie können wir helfen?" />
                                                <button onClick={sendSupportTicket} disabled={supportStatus === 'sending'} className="w-full py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">Ticket Senden</button>
                                            </>
                                        )}
                                    </motion.div>
                                )}

                                {view === 'settings' && (
                                    <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                        <p className="text-[10px] font-black uppercase opacity-40">{t.language}</p>
                                        {['de', 'en', 'al', 'sr'].map((code) => (
                                            <button key={code} onClick={() => setLang(code)} className={`w-full p-4 rounded-xl text-[10px] font-black uppercase ${lang === code ? 'bg-blue-600 text-white' : 'bg-black/5'}`}>
                                                {code.toUpperCase()}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* DOCK UNTEN */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] sm:w-auto max-w-lg">
                <nav className={`rounded-full px-3 py-2 flex items-center justify-between sm:justify-center gap-2 backdrop-blur-3xl border ${glassBase}`}>
                    <div className="flex gap-1 items-center">
                        {navItem('home', t.home, !isHome, '/')}
                        {isHome && navItem('about', t.about, false, "", true)}
                        {navItem('preise', t.prices, true, '/preise')}
                    </div>
                    <div className="h-6 w-[1px] bg-current opacity-10 mx-1 hidden sm:block"></div>
                    <a href={isHome ? "#kontakt" : "/#kontakt"} className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase shadow-lg active:scale-95">
                        {t.contact}
                    </a>
                </nav>
            </div>
        </>
    );
}