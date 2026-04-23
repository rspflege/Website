import { useState, useRef } from 'react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';

export default function Contact({ darkMode, lang, cart = [], setCart }) {
    const t = translations[lang] || translations.de;
    const form = useRef();
    const [status, setStatus] = useState('idle');
    const [validationError, setValidationError] = useState(false);

    const modelErrorMsg = {
        de: "Modell/Marke fehlt!", en: "Model/Brand missing!", es: "¡Falta modelo/marca!",
        fr: "Modèle/Marque manquant!", it: "Modello/Marca mancante!", sq: "Mungon modeli/marka!",
        bs: "Nedostaje model/marka!", tr: "Model/Marka eksik!"
    };

    const totalPrice = cart?.reduce((s, i) => s + (Number(i.price) || 0), 0) || 0;
    const refinementLevel = Math.min(cart.length * 25, 100);

    const inputStyle = `w-full p-5 rounded-2xl border outline-none transition-all font-bold text-xs uppercase tracking-wide ${
        darkMode
            ? 'bg-white/[0.04] border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
            : 'bg-white/60 border-black/8 text-black placeholder:text-black/25 focus:border-blue-400 focus:bg-white/90 focus:ring-2 focus:ring-blue-400/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]'
    } backdrop-blur-xl`;

    const labelStyle = `text-[9px] font-black uppercase ml-1 tracking-[0.25em] ${darkMode ? 'text-white/40' : 'text-black/40'}`;

    const cardGlass = darkMode
        ? 'bg-white/[0.04] border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
        : 'bg-white/70 border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]';

    const sendEmail = async (e) => {
        e.preventDefault();
        setValidationError(false);
        if (status === 'sending') return;

        const incompleteItems = cart.filter(item => !item.carModel || item.carModel.trim() === "");
        if (incompleteItems.length > 0) {
            setValidationError(true);
            const summaryElement = document.getElementById('cart-summary');
            if (summaryElement) summaryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setStatus('sending');
        const cartContent = cart.map(item => `• ${item.name} [${item.carModel}] - ${item.price}€`).join('\n');
        const formData = new FormData(form.current);
        formData.append("access_key", "8da57c53-35df-4746-8217-578703403586");
        formData.append("subject", `Booking (${lang.toUpperCase()}): ${form.current.user_name.value}`);
        formData.append("Warenkorb_Details", cartContent);
        formData.append("Gesamtpreis", `${totalPrice}€`);
        formData.append("Sprache", lang.toUpperCase());

        try {
            const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
            const data = await response.json();
            if (data.success) {
                setStatus('success');
                form.current.reset();
                if (setCart) setCart([]);
                setTimeout(() => setStatus('idle'), 5000);
            } else { throw new Error(); }
        } catch {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    return (
        <section id="kontakt" className="py-24 px-6 scroll-mt-20 relative overflow-hidden">
            {/* Background glows */}
            <div className={`absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-[150px] pointer-events-none ${darkMode ? 'bg-blue-600/8' : 'bg-blue-300/12'}`} />
            <div className={`absolute top-1/4 right-0 w-64 h-64 rounded-full blur-[120px] pointer-events-none ${darkMode ? 'bg-indigo-500/6' : 'bg-sky-200/15'}`} />

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Refinement Progress Bar */}
                <div className="mb-16 max-w-4xl mx-auto">
                    <div className="flex justify-between mb-3 px-1">
                        <span className={`text-[10px] font-black tracking-widest uppercase ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {refinementLevel < 100 ? (lang === 'de' ? 'Buchung in Bearbeitung' : 'Booking in Progress') : (lang === 'de' ? 'Maximales Detailing Level' : 'Ultimate Detailing Level')}
                        </span>
                        <span className={`text-[10px] font-black tracking-widest uppercase ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                            {refinementLevel}% Detailing Level
                        </span>
                    </div>
                    <div className={`h-1 w-full rounded-full overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${refinementLevel}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_12px_rgba(37,99,235,0.5)]"
                        />
                    </div>
                </div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 ${darkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        {lang === 'de' ? 'Schreib uns direkt' : 'Message us directly'}
                    </div>
                    <h2 className={`text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                        {t.contactTitle} <span className="text-blue-600">{t.contactJourney}</span>
                    </h2>
                    <p className={`text-sm font-medium max-w-lg mx-auto leading-relaxed ${darkMode ? 'text-white/40' : 'text-black/45'}`}>
                        {lang === 'de'
                            ? 'Wir antworten innerhalb von wenigen Stunden — meist sogar in Minuten. Kein Callcenter, kein Warteschleife. Direkt zu uns.'
                            : 'We reply within a few hours — often within minutes. No call center, no hold music. Straight to us.'}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left: Cart Summary + Info */}
                    <div className="lg:col-span-5 space-y-5">
                        {/* Cart Summary */}
                        <motion.div
                            id="cart-summary"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className={`p-8 rounded-[3rem] border text-left relative overflow-hidden transition-all duration-500 backdrop-blur-xl ${
                                validationError
                                    ? 'bg-red-500/5 border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.08)]'
                                    : `${cardGlass}`
                            }`}
                        >
                            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-blue-600/8 blur-[70px] rounded-full pointer-events-none" />

                            <h3 className={`text-base font-black uppercase tracking-tight mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-black'}`}>
                                <span className="w-1.5 h-7 bg-blue-600 rounded-full" />
                                Service <span className="text-blue-600 ml-1">Protocol</span>
                            </h3>

                            <div className="space-y-4 relative z-10">
                                <AnimatePresence mode="popLayout">
                                    {cart.length === 0 ? (
                                        <p className={`text-[11px] font-bold uppercase py-4 ${darkMode ? 'text-white/20' : 'text-black/25'}`}>
                                            {lang === 'de' ? 'Noch keine Module ausgewählt...' : 'No modules selected yet...'}
                                        </p>
                                    ) : (
                                        cart.map((item, idx) => (
                                            <motion.div
                                                layout
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                key={idx}
                                                className="flex justify-between items-start"
                                            >
                                                <div className="flex gap-4">
                                                    <span className={`text-[10px] font-black mt-0.5 ${darkMode ? 'text-blue-500/40' : 'text-blue-400/60'}`}>0{idx + 1}</span>
                                                    <div>
                                                        <p className={`text-[11px] font-black uppercase ${darkMode ? 'text-white' : 'text-black'}`}>{item.name}</p>
                                                        {item.carModel ? (
                                                            <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">{item.carModel}</p>
                                                        ) : (
                                                            <p className="text-[8px] text-red-500 font-black animate-pulse uppercase tracking-tight mt-0.5">
                                                                ⚠ {modelErrorMsg[lang] || modelErrorMsg.de}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-blue-500 font-black text-[11px]">{item.price}€</span>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-white/8' : 'border-black/8'}`}>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${darkMode ? 'text-white/30' : 'text-black/35'}`}>{t.cartSubtotal}</p>
                                        <p className="text-4xl font-black text-blue-600 tracking-tighter">{totalPrice}€</p>
                                    </div>
                                    <div className={`text-[8px] font-black uppercase px-4 py-2 rounded-full border ${darkMode ? 'border-white/8 text-white/25' : 'border-black/8 text-black/30'}`}>
                                        EST. Ready 24h
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Info Cards */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className={`p-6 rounded-[2rem] border ${cardGlass} backdrop-blur-xl space-y-4`}
                        >
                            {[
                                { icon: '📍', label: lang === 'de' ? 'Standort' : 'Location', value: 'Vöcklabruck & Gmunden, OÖ' },
                                { icon: '⚡', label: lang === 'de' ? 'Antwortzeit' : 'Response time', value: lang === 'de' ? 'Meist unter 2 Stunden' : 'Usually under 2 hours' },
                                { icon: '🔒', label: lang === 'de' ? 'Datenschutz' : 'Privacy', value: lang === 'de' ? 'Daten sicher & vertraulich' : 'Data safe & confidential' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${darkMode ? 'bg-white/5' : 'bg-black/4'}`}>{item.icon}</div>
                                    <div>
                                        <p className={`text-[8px] font-black uppercase tracking-widest ${darkMode ? 'text-white/30' : 'text-black/30'}`}>{item.label}</p>
                                        <p className={`text-[11px] font-bold ${darkMode ? 'text-white/70' : 'text-black/70'}`}>{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Trust Badge */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.15 }}
                            className={`p-5 rounded-[2rem] border flex items-center gap-4 ${darkMode ? 'bg-blue-600/8 border-blue-500/15' : 'bg-blue-50/80 border-blue-100'} backdrop-blur-xl`}
                        >
                            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse flex-shrink-0" />
                            <p className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                                RS-Precision Certified · 100% Handarbeit · Local Team
                            </p>
                        </motion.div>
                    </div>

                    {/* Right: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-7"
                    >
                        <div className={`p-8 md:p-12 rounded-[3.5rem] border ${cardGlass} backdrop-blur-2xl`}>
                            <h3 className={`text-2xl font-black italic uppercase mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                                {lang === 'de' ? 'Ihre Nachricht' : 'Your Message'}
                            </h3>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-8 ${darkMode ? 'text-white/30' : 'text-black/35'}`}>
                                {lang === 'de' ? 'Alle Felder sind Pflichtfelder' : 'All fields are required'}
                            </p>

                            <form ref={form} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left" onSubmit={sendEmail}>
                                <div className="space-y-2">
                                    <label className={labelStyle}>{t.nameLabel}</label>
                                    <input required name="user_name" type="text" placeholder={t.namePlaceholder} className={inputStyle} />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelStyle}>{t.emailLabel}</label>
                                    <input required name="user_email" type="email" placeholder={t.emailPlaceholder} className={inputStyle} />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className={labelStyle}>{t.messageLabel}</label>
                                    <textarea required name="message" rows="5" maxLength={1000} placeholder={t.messagePlaceholder} className={`${inputStyle} resize-none`} />
                                </div>

                                {/* Submit Button */}
                                <button
                                    disabled={status === 'sending' || status === 'success'}
                                    type="submit"
                                    className={`md:col-span-2 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl ${
                                        status === 'success' ? 'bg-green-500 text-white shadow-green-500/20'
                                        : status === 'error' ? 'bg-red-500 text-white shadow-red-500/20'
                                        : validationError ? 'bg-red-600 text-white shadow-red-600/20'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 hover:shadow-[0_20px_60px_rgba(37,99,235,0.4)] hover:scale-[1.01]'
                                    }`}
                                >
                                    {status === 'idle' && !validationError && (
                                        <>
                                            <span>{t.submitBtn}</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                    {status === 'idle' && validationError && (modelErrorMsg[lang] || modelErrorMsg.de)}
                                    {status === 'sending' && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {status === 'success' && `✓ ${t.authSuccess || "Erfolgreich gesendet"}`}
                                    {status === 'error' && `✕ ${t.authError || "Fehler — Nochmal versuchen"}`}
                                </button>

                                <p className={`md:col-span-2 text-center text-[9px] font-medium ${darkMode ? 'text-white/20' : 'text-black/25'}`}>
                                    {lang === 'de'
                                        ? 'Mit dem Absenden stimmen Sie unserer Datenschutzerklärung zu. Keine Werbung, kein Spam.'
                                        : 'By submitting you agree to our privacy policy. No spam, no ads.'}
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}