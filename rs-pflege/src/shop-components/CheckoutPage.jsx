import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function CheckoutPage({ cart, user, darkMode, lang }) {
    const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'error'
    const navigate = useNavigate();

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

    useEffect(() => {
        // PayPal Buttons laden, wenn das SDK bereit ist
        if (window.paypal && cart.length > 0) {
            window.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            description: "RS Shop Bestellung",
                            amount: {
                                currency_code: "EUR",
                                value: subtotal.toFixed(2)
                            }
                        }]
                    });
                },
                onApprove: async (data, actions) => {
                    setStatus('processing');
                    const order = await actions.order.capture();

                    // Speichern der Bestellung in Supabase
                    const { error } = await supabase.from('orders').insert([{
                        user_email: user?.email || 'Guest',
                        amount: subtotal,
                        paypal_order_id: order.id,
                        items: cart,
                        status: 'paid'
                    }]);

                    if (!error) {
                        setStatus('success');
                        // Warenkorb leeren Logik hier einfügen
                        setTimeout(() => navigate('/'), 3000);
                    }
                },
                onError: (err) => {
                    console.error("PayPal Error:", err);
                    setStatus('error');
                }
            }).render('#paypal-button-container');
        }
    }, [cart, subtotal]);

    const glassBase = darkMode
        ? "bg-[#0A0A0A] text-white border-white/10"
        : "bg-white text-black border-black/5";

    return (
        <div className={`min-h-screen pt-32 px-6 flex flex-col items-center ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`w-full max-w-xl p-10 rounded-[3rem] border shadow-2xl ${glassBase}`}
            >
                <h1 className="text-4xl font-black uppercase italic mb-8 tracking-tighter">
                    Checkout <span className="text-blue-600">.</span>
                </h1>

                {/* Zusammenfassung */}
                <div className="space-y-4 mb-10">
                    {cart.map((item, i) => (
                        <div key={i} className="flex justify-between items-center opacity-60 text-sm">
                            <span>{item.name}</span>
                            <span className="font-bold">{item.price.toFixed(2)}€</span>
                        </div>
                    ))}
                    <div className="h-[1px] bg-current opacity-10 my-4" />
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Gesamtbetrag</span>
                        <span className="text-4xl font-black text-blue-600">{subtotal.toFixed(2)}€</span>
                    </div>
                </div>

                {/* PayPal Container */}
                <div id="paypal-button-container" className="relative z-10" />

                {/* Status Anzeigen */}
                {status === 'processing' && (
                    <div className="mt-6 p-4 bg-blue-500/10 text-blue-500 rounded-2xl text-center font-bold animate-pulse">
                        Verarbeitung läuft...
                    </div>
                )}
                {status === 'success' && (
                    <div className="mt-6 p-4 bg-green-500/10 text-green-500 rounded-2xl text-center font-bold">
                        Zahlung erfolgreich! Du wirst weitergeleitet...
                    </div>
                )}
            </motion.div>
        </div>
    );
}