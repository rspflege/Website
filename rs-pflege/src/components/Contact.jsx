import { useState, useRef } from 'react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';

export default function Contact({ darkMode, lang, cart = [], setCart }) {
    const t = translations[lang] || translations.de;
    const form = useRef();
    const [status, setStatus] = useState('idle');
    const [validationError, setValidationError] = useState(false);

    const modelErrorMsg = {
        de: "Modell/Marke fehlt!",
        en: "Model/Brand missing!",
        es: "¡Falta modelo/marca!",
        fr: "Modèle/Marque manquant!",
        it: "Modello/Marca mancante!",
        sq: "Mungon modeli/marka!",
        bs: "Nedostaje model/marka!",
        tr: "Model/Marka eksik!"
    };

    const totalPrice = cart?.reduce((s, i) => s + (Number(i.price) || 0), 0) || 0;
    const refinementLevel = Math.min(cart.length * 25, 100);

    const glassPanel = darkMode
        ? 'bg-white/[0.04] border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.07)]'
        : 'bg-white/70 border-white/80 shadow-[0_4px_30px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)]';

    const inputStyle = `w-full p-5 rounded-3xl border outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all font-bold text-xs uppercase ${
        darkMode
            ? 'bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/25 focus:bg-white/[0.08]'
            : 'bg-black/[0.04] border-black/[0.08] text-black placeholder:text-black/25 focus:bg-white/80'
    } backdrop-blur-xl`;

    const labelStyle = `text-[9px] font-black uppercase ml-5 tracking-[0.2em] ${darkMode ? 'text-white/50' : 'text-black/40'}`;

    const sendEmail = async (e) => {
        e.preventDefault();
        setValidationError(false);
        if (status === 'sending') return;

        const incompleteItems = cart.filter(item => !item.carModel || item.carModel.trim() === "");
        if (incompleteItems.length > 0) {
            setValidationError(true);
            document.getElementById('cart-summary')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
            {/* Ambient glow */}
            <div className={`absolute bottom-0 left-1/3 w-96 h-72 rounded-full blur-[140px] pointer-events-none ${darkMode ? 'bg-blue-600/[0.09]' : 'bg-blue-300/[0.15]'}`} />

            <div className="max-w-6xl mx-auto text-center relative z-10">

                {/* Refinement progress bar */}
                <div className="mb-16 max-w-4xl mx-auto">
                    <div className="flex justify-between mb-3 px-1">
                        <span className={`text-[10px] font-black tracking-widest uppercase ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {refinementLevel < 100 ? 'Refinement in Progress' : 'Ultimate Showroom Condition'}
                        </span>
                        <span className={`text-[10px] font-black tracking-widest uppercase ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                            {refinementLevel}% Detailing Level
                        </span>
                    </div>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${refinementLevel}%` }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_12px_rgba(37,99,235,0.5)]"
                        />
                    </div>
                </div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12 ${darkMode ? 'text-white' : 'text-black'}`}
                >
                    {t.contactTitle} <span className="text-blue-600">{t.contactJourney}</span>
                </motion.h2>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left: Service Protocol */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-5 space-y-6"
                    >
                        <div
                            id="cart-summary"
                            className={`p-8 rounded-[3rem] border text-left relative overflow-hidden transition-all duration-500 backdrop-blur-xl ${
                                validationError
                                    ? 'bg-red-500/[0.04] border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.08)]'
                                    : glassPanel
                            }`}
                        >
                            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-blue-600/[0.08] blur-[60px] rounded-full pointer-events-none" />

                            <h3 className={`text-lg font-black uppercase tracking-tighter mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-black'}`}>
                                <span className="w-2 h-6 bg-blue-600 rounded-full" />
                                Service <span className="text-blue-600 ml-1">Protocol</span>
                            </h3>

                            <div className="space-y-5 relative z-10">
                                <AnimatePresence mode="popLayout">
                                    {cart.length === 0 ? (
                                        <p className={`text-[11px] font-bold uppercase ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                                            No modules selected yet...
                                        </p>
                                    ) : (
                                        cart.map((item, idx) => (
                                            <motion.div
                                                layout
                                                initial={{ x: -16, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: -16, opacity: 0 }}
                                                key={idx}
                                                className="flex justify-between items-start group"
                                            >
                                                <div className="flex gap-4">
                                                    <span className={`text-[10px] font-black mt-0.5 ${darkMode ? 'text-blue-600/50' : 'text-blue-500/60'}`}>0{idx + 1}</span>
                                                    <div>
                                                        <p className={`text-[11px] font-black uppercase ${darkMode ? 'text-white' : 'text-black'}`}>{item.name}</p>
                                                        {item.carModel ? (
                                                            <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">{item.carModel}</p>
                                                        ) : (
                                                            <p className="text-[8px] text-red-500 font-black animate-pulse uppercase tracking-tighter mt-0.5">
                                                                ⚠ {modelErrorMsg[lang] || modelErrorMsg.de}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-blue-600 font-black text-[11px]">{item.price}€</span>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-white/[0.08]' : 'border-black/[0.08]'}`}>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${darkMode ? 'text-white/40' : 'text-black/40'}`}>{t.cartSubtotal}</p>
                                        <p className="text-4xl font-black text-blue-600 tracking-tighter">{totalPrice}€</p>
                                    </div>
                                    <div className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border ${darkMode ? 'border-white/[0.08] text-white/25' : 'border-black/[0.08] text-black/30'}`}>
                                        EST. Ready in 24h
                                    </div>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.15 }}
                            className={`p-6 rounded-[2rem] border flex items-center gap-4 ${darkMode ? 'bg-blue-600/[0.08] border-blue-500/20' : 'bg-blue-50/80 border-blue-100'} backdrop-blur-xl`}
                        >
                            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse flex-shrink-0" />
                            <p className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                                RS-Precision Certified Workmanship
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Right: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-7"
                    >
                        <div className={`p-8 md:p-12 rounded-[3.5rem] border backdrop-blur-2xl ${glassPanel}`}>
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
                                    <textarea required id="message" name="message" rows="4" maxLength={1000} placeholder={t.messagePlaceholder} className={`${inputStyle} resize-none`} />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.01, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={status === 'sending' || status === 'success'}
                                    type="submit"
                                    className={`md:col-span-2 py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-colors flex items-center justify-center gap-3 ${
                                        status === 'success' ? 'bg-green-500 text-white shadow-green-500/20'
                                        : status === 'error' ? 'bg-red-500 text-white shadow-red-500/20'
                                        : validationError ? 'bg-red-600 text-white shadow-red-600/20'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 hover:shadow-[0_12px_40px_rgba(37,99,235,0.4)]'
                                    }`}
                                >
                                    {status === 'idle' && !validationError && t.submitBtn}
                                    {status === 'idle' && validationError && (modelErrorMsg[lang] || modelErrorMsg.de)}
                                    {status === 'sending' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {status === 'success' && (t.authSuccess || "OK ✓")}
                                    {status === 'error' && (t.authError || "ERROR ✕")}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Row */}
                <div className={`mt-16 flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] ${darkMode ? 'text-white/20' : 'text-black/20'}`}>
                    <span className="hover:text-blue-500 transition-colors cursor-default">© RS PFLEGE - {t.rights}</span>
                    <a href="#" className="hover:text-blue-500 transition-colors">{t.imprint}</a>
                    <a href="#" className="hover:text-blue-500 transition-colors">{t.privacy}</a>
                </div>
            </div>
        </section>
    );
}