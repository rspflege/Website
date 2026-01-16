import { useState, useRef } from 'react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';

export default function Contact({ darkMode, lang, cart = [], setCart }) {
    const t = translations[lang] || translations.de;
    const form = useRef();
    const [status, setStatus] = useState('idle');

    const totalPrice = cart?.reduce((s, i) => s + (Number(i.price) || 0), 0) || 0;

    const inputStyle = `w-full p-5 rounded-3xl border outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-xs uppercase ${darkMode
        ? 'bg-white/10 border-white/10 text-white placeholder:text-white/30'
        : 'bg-black/5 border-black/10 text-black placeholder:text-black/30'
        }`;

    const labelStyle = `text-[9px] font-black uppercase ml-5 tracking-[0.2em] ${darkMode ? 'text-white/50' : 'text-black/40'}`;

    const sendEmail = async (e) => {
        e.preventDefault();
        if (status === 'sending') return;

        setStatus('sending');

        // Formatierung der Warenkorb-Details für die E-Mail
        const cartContent = cart && cart.length > 0
            ? cart.map(item => `• ${item.name} (${item.carModel || 'N/A'}) - ${item.price}€`).join('\n')
            : "Direktanfrage ohne spezifische Auswahl";

        const formData = new FormData(form.current);

        // Web3Forms Konfiguration
        formData.append("access_key", "8da57c53-35df-4746-8217-578703403586");
        formData.append("subject", `Neue Buchungsanfrage: ${form.current.user_name.value}`);
        formData.append("Warenkorb_Details", cartContent);
        formData.append("Gesamtpreis", `${totalPrice}€`);
        formData.append("Sprache", lang.toUpperCase());

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                form.current.reset();
                if (setCart) setCart([]); // Warenkorb nach Erfolg leeren
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                throw new Error('Web3Forms Error');
            }
        } catch (err) {
            console.error('Contact Error:', err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    return (
        <section id="kontakt" className="py-24 px-6 scroll-mt-20">
            <div className="max-w-4xl mx-auto text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 ${darkMode ? 'text-white' : 'text-black'}`}
                >
                    {t.contactTitle} <span className="text-blue-600">{t.contactJourney}</span>
                </motion.h2>

                <div className={`p-8 md:p-12 rounded-[3.5rem] border backdrop-blur-2xl transition-all duration-700 ${darkMode ? 'bg-white/5 border-white/10 shadow-2xl shadow-black/50' : 'bg-black/5 border-black/5 shadow-xl'}`}>

                    {/* Zusammenfassung der Auswahl */}
                    <AnimatePresence>
                        {cart && cart.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-10 text-left p-6 rounded-[2rem] bg-blue-600/5 border border-blue-500/20 overflow-hidden"
                            >
                                <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-3 italic">
                                    {t.cartTitle || 'Ihre Auswahl'}:
                                </p>
                                {cart.map((item, idx) => (
                                    <div key={idx} className={`text-[11px] font-bold uppercase py-1 flex justify-between border-b border-blue-500/5 last:border-0 ${darkMode ? 'text-white/80' : 'text-black/70'}`}>
                                        <span className="flex gap-2">
                                            {item.name}
                                            {item.carModel && <span className="text-blue-500/50 text-[9px]">[{item.carModel}]</span>}
                                        </span>
                                        <span className="text-blue-500 font-black">{item.price}€</span>
                                    </div>
                                ))}
                                <div className="mt-3 pt-3 border-t border-blue-500/20 flex justify-between font-black text-blue-500 uppercase text-xs tracking-tighter">
                                    <span>{t.cartSubtotal || 'Gesamt'}</span>
                                    <span>{totalPrice}€</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Kontaktformular */}
                    <form ref={form} className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left" onSubmit={sendEmail}>
                        <div className="space-y-2">
                            <label htmlFor="user_name" className={labelStyle}>{t.nameLabel}</label>
                            <input required id="user_name" name="user_name" type="text" placeholder={t.namePlaceholder} className={inputStyle} />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="user_email" className={labelStyle}>{t.emailLabel}</label>
                            <input required id="user_email" name="user_email" type="email" placeholder={t.emailPlaceholder} className={inputStyle} />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label htmlFor="message" className={labelStyle}>{t.messageLabel}</label>
                            <textarea required id="message" name="message" rows="4" maxLength={1000} placeholder={t.messagePlaceholder} className={`${inputStyle} resize-none`}></textarea>
                        </div>

                        <button
                            disabled={status === 'sending' || status === 'success'}
                            type="submit"
                            className={`md:col-span-2 py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${status === 'success' ? 'bg-green-500 text-white' :
                                    status === 'error' ? 'bg-red-500 text-white' :
                                        'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                                }`}
                        >
                            {status === 'idle' && t.submitBtn}
                            {status === 'sending' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {status === 'success' && (t.successMsg || "Gesendet ✓")}
                            {status === 'error' && (t.errorMsg || "Fehler ✕")}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}