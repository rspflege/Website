import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function LoginModal({ isOpen, onClose, darkMode, lang, translations }) {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const t = translations[lang] || translations.de;

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Validierung der Passwörter bei Registrierung
        if (isRegister && password !== confirmPassword) {
            setMessage({ type: 'error', text: t.authError }); // Oder ein spezifischer Key wie t.passwordMismatch
            setLoading(false);
            return;
        }

        try {
            if (isRegister) {
                // REGISTRIERUNG
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage({ type: 'success', text: t.registerSuccess });
            } else {
                // LOGIN
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    // Mapping der Supabase Fehler auf deine Übersetzungen
                    if (error.message.includes("Invalid login credentials") || error.status === 400) {
                        throw new Error(t.authError);
                    }
                    throw error;
                }
                onClose(); // Fenster schließen bei Erfolg
            }
        } catch (error) {
            // Fehler direkt anzeigen (entweder übersetzt oder Original)
            setMessage({ type: 'error', text: error.message });

            // OPTIONAL: Fehler an deine Support-Tabelle senden, damit du siehst was schief läuft
            if (error.message !== t.authError) {
                await supabase.from('support_tickets').insert([
                    { user_email: email, message: `Auth-Fehler: ${error.message}`, status: 'system-error' }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`relative w-full max-w-md overflow-hidden rounded-[2.5rem] p-8 md:p-12 shadow-2xl border ${darkMode ? 'bg-[#1c1c1e]/90 border-white/10 text-white' : 'bg-white/90 border-black/5 text-black'
                            } backdrop-blur-xl`}
                    >
                        {/* CLOSE BUTTON */}
                        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* HEADER */}
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">
                                {isRegister ? t.registerTitle : t.loginTitle}
                            </h2>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-40">
                                {isRegister ? t.registerSub : t.loginSub}
                            </p>
                        </div>

                        {/* FEEDBACK MESSAGE */}
                        <AnimatePresence>
                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mb-6 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border ${message.type === 'error'
                                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                            : 'bg-green-500/10 text-green-500 border-green-500/20'
                                        }`}
                                >
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* FORM */}
                        <form className="space-y-4" onSubmit={handleAuth}>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-4 opacity-60">{t.emailLabel}</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full px-6 py-4 rounded-2xl border outline-none transition-all ${darkMode ? 'bg-white/5 border-white/10 focus:border-blue-500 text-white' : 'bg-black/5 border-black/10 focus:border-blue-500 text-black'
                                        }`}
                                    placeholder="mail@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-4 opacity-60">{t.passwordLabel}</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full px-6 py-4 rounded-2xl border outline-none transition-all ${darkMode ? 'bg-white/5 border-white/10 focus:border-blue-500 text-white' : 'bg-black/5 border-black/10 focus:border-blue-500 text-black'
                                        }`}
                                    placeholder="••••••••"
                                />
                            </div>

                            {isRegister && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-4 opacity-60">{t.confirmPassword}</label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`w-full px-6 py-4 rounded-2xl border outline-none transition-all ${darkMode ? 'bg-white/5 border-white/10 focus:border-blue-500 text-white' : 'bg-black/5 border-black/10 focus:border-blue-500 text-black'
                                            }`}
                                        placeholder="••••••••"
                                    />
                                </motion.div>
                            )}

                            {!isRegister && (
                                <div className="flex justify-end px-2">
                                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:opacity-70 transition-opacity">
                                        {t.forgotPassword}
                                    </button>
                                </div>
                            )}

                            <button
                                disabled={loading}
                                type="submit"
                                className={`w-full py-5 mt-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-[0.3em] transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500 hover:shadow-[0_10px_30px_rgba(37,99,235,0.4)]'
                                    }`}
                            >
                                {loading ? '...' : (isRegister ? t.register : t.login)}
                            </button>
                        </form>

                        {/* SWITCH LOGIN/REGISTER */}
                        <div className="mt-8 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                                {isRegister ? t.haveAccount : t.noAccount}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsRegister(!isRegister);
                                        setMessage({ type: '', text: '' });
                                    }}
                                    className="text-blue-500 font-black ml-1 hover:underline"
                                >
                                    {isRegister ? t.loginNow : t.registerNow}
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}