import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPanel({ darkMode }) {
    const [orders, setOrders] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'tickets'

    useEffect(() => {
        fetchAdminData();

        // Realtime Subscription: Sofortige Updates bei neuen Verkäufen/Tickets
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

    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);

    const glassStyle = darkMode
        ? "bg-[#0A0A0A]/80 border-white/10 text-white"
        : "bg-white/80 border-black/5 text-black";

    if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse">LOADING TERMINAL...</div>;

    return (
        <div className={`min-h-screen p-8 pt-24 ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
            <div className="max-w-7xl mx-auto">

                {/* HEADER STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard title="Gesamtumsatz" value={`${totalRevenue.toFixed(2)}€`} color="text-blue-600" darkMode={darkMode} />
                    <StatCard title="Bestellungen" value={orders.length} color="text-purple-600" darkMode={darkMode} />
                    <StatCard title="Offene Tickets" value={tickets.filter(t => t.status === 'neu').length} color="text-orange-500" darkMode={darkMode} />
                </div>

                {/* TABS */}
                <div className="flex gap-4 mb-8">
                    {['orders', 'tickets'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                        >
                            {tab === 'orders' ? 'Verkäufe' : 'Support Tickets'}
                        </button>
                    ))}
                </div>

                {/* CONTENT AREA */}
                <div className={`rounded-[2.5rem] border backdrop-blur-3xl p-8 ${glassStyle}`}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'orders' ? (
                            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase opacity-30 tracking-[0.2em] border-b border-current/10">
                                            <th className="pb-4">Kunde</th>
                                            <th className="pb-4">Betrag</th>
                                            <th className="pb-4">PayPal ID</th>
                                            <th className="pb-4">Datum</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-current/5">
                                        {orders.map(order => (
                                            <tr key={order.id} className="text-sm">
                                                <td className="py-6 font-bold">{order.user_email}</td>
                                                <td className="py-6 text-blue-600 font-black">{order.amount.toFixed(2)}€</td>
                                                <td className="py-6 opacity-60 font-mono text-xs">{order.paypal_order_id}</td>
                                                <td className="py-6 opacity-60">{new Date(order.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        ) : (
                            <motion.div key="tickets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                {tickets.map(ticket => (
                                    <div key={ticket.id} className={`p-6 rounded-3xl border flex justify-between items-start ${darkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-blue-600 mb-1">{ticket.user_email}</p>
                                            <p className="text-sm font-medium leading-relaxed">{ticket.message}</p>
                                            <p className="text-[9px] opacity-30 mt-3 uppercase tracking-tighter">{new Date(ticket.created_at).toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => deleteTicket(ticket.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all">✕</button>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, color, darkMode }) {
    return (
        <div className={`p-8 rounded-[2rem] border transition-all ${darkMode ? 'bg-[#0A0A0A]/50 border-white/5' : 'bg-white border-black/5 shadow-xl'}`}>
            <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2">{title}</p>
            <p className={`text-4xl font-black italic tracking-tighter ${color}`}>{value}</p>
        </div>
    );
}