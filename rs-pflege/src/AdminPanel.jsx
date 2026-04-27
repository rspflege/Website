import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'gallery_extra_images';

export default function AdminPanel({ darkMode }) {
    const [orders, setOrders] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    const [galleryImages, setGalleryImages] = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
        catch { return []; }
    });
    const [uploadToast, setUploadToast] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchAdminData();
        const ordersSub = supabase.channel('admin_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchAdminData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, fetchAdminData)
            .subscribe();
        return () => supabase.removeChannel(ordersSub);
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        const { data: ticketsData } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
        if (ordersData) setOrders(ordersData);
        if (ticketsData) setTickets(ticketsData);
        setLoading(false);
    };

    const deleteTicket = async (id) => {
        if (window.confirm("Ticket wirklich löschen?")) {
            await supabase.from('support_tickets').delete().eq('id', id);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
        if (!files.length) return;
        let done = 0;
        const newImgs = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                newImgs.push({ src: ev.target.result, alt: file.name.replace(/\.[^.]+$/, ''), cat: 'exterior', size: 'md:col-span-1 md:row-span-1', custom: true });
                if (++done === files.length) {
                    setGalleryImages(prev => {
                        const updated = [...prev, ...newImgs];
                        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
                        return updated;
                    });
                    setUploadToast(`${newImgs.length} Bild${newImgs.length > 1 ? 'er' : ''} hinzugefügt ✓`);
                    setTimeout(() => setUploadToast(''), 3000);
                }
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const deleteGalleryImage = (img) => {
        if (!window.confirm('Bild wirklich löschen?')) return;
        setGalleryImages(prev => {
            const updated = prev.filter(i => i !== img);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
            return updated;
        });
    };

    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const newTickets = tickets.filter(t => t.status === 'neu').length;

    const sf = `font-family: -apple-system, "SF Pro Display", "Helvetica Neue", sans-serif`;

    // Apple-style loading screen
    if (loading) return (
        <div
            className={`h-screen flex flex-col items-center justify-center gap-4 ${darkMode ? 'bg-black' : 'bg-[#f5f5f7]'}`}
            style={{ fontFamily: '-apple-system, "SF Pro Display", sans-serif' }}
        >
            <div className="relative w-12 h-12">
                <div className={`absolute inset-0 rounded-full border-2 ${darkMode ? 'border-white/10' : 'border-black/8'}`} />
                <div
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"
                    style={{ animationDuration: '0.9s', animationTimingFunction: 'cubic-bezier(0.4,0,0.6,1)' }}
                />
            </div>
            <p className={`text-[13px] font-medium tracking-wider ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                Lädt…
            </p>
        </div>
    );

    return (
        <div
            className={`min-h-screen transition-colors duration-700 ${darkMode ? 'bg-black text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'}`}
            style={{ fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' }}
        >
            <div className="max-w-6xl mx-auto px-6 md:px-10 pt-28 pb-20">

                {/* ─── Page Title ─── */}
                <div className="mb-10">
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] mb-1.5 ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                        RS Pflege
                    </p>
                    <h1 className={`text-[34px] font-semibold tracking-tight leading-none ${darkMode ? 'text-white' : 'text-[#1d1d1f]'}`}>
                        Übersicht
                    </h1>
                </div>

                {/* ─── Stat Cards — Apple "Summary" row ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
                    <StatCard
                        label="Gesamtumsatz"
                        value={`€${totalRevenue.toFixed(2)}`}
                        accent="text-[#0A84FF]"
                        darkMode={darkMode}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 opacity-60" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round"/>
                            </svg>
                        }
                    />
                    <StatCard
                        label="Bestellungen"
                        value={orders.length}
                        accent="text-[#32D74B]"
                        darkMode={darkMode}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 opacity-60" stroke="currentColor" strokeWidth="1.5">
                                <path d="M9 12h6M9 16h6M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" strokeLinecap="round"/>
                            </svg>
                        }
                    />
                    <StatCard
                        label="Offene Tickets"
                        value={newTickets}
                        accent="text-[#FF9F0A]"
                        darkMode={darkMode}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 opacity-60" stroke="currentColor" strokeWidth="1.5">
                                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.862 9.862 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        }
                    />
                </div>

                {/* ─── Segmented Control — Apple-style pill ─── */}
                <div
                    className={`inline-flex p-1 rounded-[11px] mb-8 ${darkMode ? 'bg-white/[0.07]' : 'bg-black/[0.06]'}`}
                >
                    {[
                        { key: 'orders', label: 'Verkäufe' },
                        { key: 'tickets', label: 'Support' },
                        { key: 'gallery', label: 'Galerie' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`relative px-5 py-2 rounded-[8px] text-[13px] font-medium transition-all duration-200 ${
                                activeTab === tab.key
                                    ? darkMode
                                        ? 'bg-white/[0.12] text-white shadow-sm'
                                        : 'bg-white text-[#1d1d1f] shadow-sm'
                                    : darkMode
                                        ? 'text-white/40 hover:text-white/70'
                                        : 'text-black/40 hover:text-black/70'
                            }`}
                        >
                            {tab.label}
                            {tab.key === 'tickets' && newTickets > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#FF9F0A] text-white text-[9px] font-bold">
                                    {newTickets}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ─── Content ─── */}
                <div
                    className={`rounded-2xl overflow-hidden border ${
                        darkMode
                            ? 'bg-white/[0.04] border-white/[0.07]'
                            : 'bg-white border-black/[0.06] shadow-sm'
                    }`}
                >
                    <AnimatePresence mode="wait">
                        {activeTab === 'orders' ? (
                            <motion.div
                                key="orders"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2, ease: [0.4,0,0.2,1] }}
                            >
                                {orders.length === 0 ? (
                                    <EmptyState label="Keine Bestellungen" darkMode={darkMode} />
                                ) : (
                                    <table className="w-full">
                                        <thead>
                                            <tr className={`border-b text-[11px] font-semibold uppercase tracking-[0.14em]
                                                ${darkMode ? 'border-white/[0.06] text-white/25' : 'border-black/[0.06] text-black/30'}`}>
                                                <th className="text-left px-6 py-4 font-semibold">Kunde</th>
                                                <th className="text-left px-6 py-4 font-semibold">Betrag</th>
                                                <th className="text-left px-6 py-4 font-semibold hidden md:table-cell">PayPal ID</th>
                                                <th className="text-right px-6 py-4 font-semibold">Datum</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order, i) => (
                                                <motion.tr
                                                    key={order.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    className={`border-b last:border-0 transition-colors ${
                                                        darkMode
                                                            ? 'border-white/[0.04] hover:bg-white/[0.03]'
                                                            : 'border-black/[0.04] hover:bg-black/[0.015]'
                                                    }`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
                                                                {order.user_email?.[0]?.toUpperCase() || '?'}
                                                            </div>
                                                            <span className={`text-[14px] font-medium ${darkMode ? 'text-white/80' : 'text-[#1d1d1f]/80'}`}>
                                                                {order.user_email}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[14px] font-semibold text-[#0A84FF]">
                                                            €{order.amount.toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        <span className={`text-[12px] font-mono px-2 py-1 rounded-md ${
                                                            darkMode ? 'bg-white/[0.06] text-white/40' : 'bg-black/[0.04] text-black/40'
                                                        }`}>
                                                            {order.paypal_order_id}
                                                        </span>
                                                    </td>
                                                    <td className={`px-6 py-4 text-right text-[13px] ${darkMode ? 'text-white/35' : 'text-black/35'}`}>
                                                        {new Date(order.created_at).toLocaleDateString('de-AT', {
                                                            day: '2-digit', month: 'short', year: 'numeric'
                                                        })}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </motion.div>
                        ) : activeTab === 'tickets' ? (
                            <motion.div
                                key="tickets"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2, ease: [0.4,0,0.2,1] }}
                                className="divide-y"
                                style={{ ['--tw-divide-opacity']: darkMode ? '0.06' : '0.06' }}
                            >
                                {tickets.length === 0 ? (
                                    <EmptyState label="Keine Tickets" darkMode={darkMode} />
                                ) : tickets.map((ticket, i) => (
                                    <motion.div
                                        key={ticket.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.04 }}
                                        className={`flex items-start gap-4 px-6 py-5 border-b last:border-0 group transition-colors ${
                                            darkMode
                                                ? 'border-white/[0.05] hover:bg-white/[0.02]'
                                                : 'border-black/[0.05] hover:bg-black/[0.01]'
                                        }`}
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-[12px] font-semibold shrink-0 mt-0.5">
                                            {ticket.user_email?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <p className={`text-[12px] font-semibold ${darkMode ? 'text-white/60' : 'text-black/50'}`}>
                                                    {ticket.user_email}
                                                </p>
                                                {ticket.status === 'neu' && (
                                                    <span className="px-1.5 py-0.5 rounded-md bg-[#FF9F0A]/15 text-[#FF9F0A] text-[10px] font-semibold uppercase tracking-wide">
                                                        Neu
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-[14px] leading-relaxed ${darkMode ? 'text-white/80' : 'text-[#1d1d1f]/80'}`}>
                                                {ticket.message}
                                            </p>
                                            <p className={`text-[12px] mt-2 ${darkMode ? 'text-white/25' : 'text-black/25'}`}>
                                                {new Date(ticket.created_at).toLocaleString('de-AT', {
                                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => deleteTicket(ticket.id)}
                                            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                                                darkMode
                                                    ? 'text-red-400/60 hover:text-red-400 hover:bg-red-500/10'
                                                    : 'text-red-500/50 hover:text-red-500 hover:bg-red-500/08'
                                            }`}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                                                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round"/>
                                            </svg>
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            /* ─── Gallery Tab ─── */
                            <motion.div
                                key="gallery"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2, ease: [0.4,0,0.2,1] }}
                            >
                                {/* Upload Button */}
                                <div className="px-6 py-4 flex items-center justify-between border-b"
                                    style={{ borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                    <p className={`text-[13px] font-medium ${darkMode ? 'text-white/50' : 'text-black/45'}`}>
                                        {galleryImages.length} eigene Bilder
                                    </p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold transition-colors"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                            <path d="M12 4v16m8-8H4" strokeLinecap="round"/>
                                        </svg>
                                        Bilder hochladen
                                    </button>
                                </div>

                                {/* Image Grid */}
                                {galleryImages.length === 0 ? (
                                    <EmptyState label="Keine eigenen Bilder" darkMode={darkMode} />
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-6">
                                        {galleryImages.map((img, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.04 }}
                                                className="relative group rounded-xl overflow-hidden aspect-square"
                                            >
                                                <img src={img.src} alt={img.alt}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                                                    <button
                                                        onClick={() => deleteGalleryImage(img)}
                                                        className="opacity-0 group-hover:opacity-100 w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white transition-all duration-200 hover:bg-red-600"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                                <p className={`absolute bottom-0 inset-x-0 px-2 py-1 text-[9px] font-semibold truncate ${darkMode ? 'bg-black/60 text-white/60' : 'bg-black/40 text-white/80'}`}>
                                                    {img.alt}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Hidden file input */}
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />

                {/* Upload Toast */}
                <AnimatePresence>
                    {uploadToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[3000] px-5 py-3 rounded-full bg-green-500 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-green-500/25 flex items-center gap-2 whitespace-nowrap pointer-events-none"
                        >
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            {uploadToast}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}

// ─── Stat Card — Apple-style metric tile ─────────────────────────────────────
function StatCard({ label, value, accent, icon, darkMode }) {
    return (
        <div
            className={`rounded-2xl p-5 flex flex-col gap-4 border transition-colors ${
                darkMode
                    ? 'bg-white/[0.04] border-white/[0.07]'
                    : 'bg-white border-black/[0.06] shadow-sm'
            }`}
        >
            <div className={`${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                {icon}
            </div>
            <div>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] mb-1 ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                    {label}
                </p>
                <p className={`text-[28px] font-semibold tracking-tight leading-none ${accent}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ label, darkMode }) {
    return (
        <div className={`py-20 flex flex-col items-center gap-3 ${darkMode ? 'text-white/20' : 'text-black/20'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-10 h-10">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" strokeLinecap="round"/>
            </svg>
            <p className="text-[13px] font-medium">{label}</p>
        </div>
    );
}