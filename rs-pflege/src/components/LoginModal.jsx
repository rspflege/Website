import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { supabase } from '../supabaseClient';

const sf = { fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' };

export default function LoginModal({ isOpen, onClose, darkMode, lang, translations }) {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const t = translations[lang] || translations.de;

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (isRegister && password !== confirmPassword) {
            setMessage({ type: 'error', text: t.authError });
            setLoading(false);
            return;
        }

        try {
            if (isRegister) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage({ type: 'success', text: t.registerSuccess });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    if (error.message.includes('Invalid login credentials') || error.status === 400) throw new Error(t.authError);
                    throw error;
                }
                onClose();
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
            if (error.message !== t.authError) {
                await supabase.from('support_tickets').insert([{ user_email: email, message: `Auth-Fehler: ${error.message}`, status: 'system-error' }]);
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = `w-full h-12 px-4 rounded-xl border text-[15px] outline-none transition-all duration-200 ${
        darkMode
            ? 'bg-white/[0.06] border-white/[0.10] text-white placeholder:text-white/25 focus:border-[#0A84FF]/70 focus:bg-white/[0.09]'
            : 'bg-black/[0.04] border-black/[0.08] text-[#1d1d1f] placeholder:text-black/25 focus:border-[#0071E3]/50 focus:bg-white/80'
    }`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center" style={sf}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40"
                        style={{ backdropFilter: 'blur(8px)' }}
                    />

                    {/* Sheet — slides up on mobile, scales in on desktop */}
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.97 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                        className={`relative w-full sm:max-w-[400px] sm:mx-4 overflow-hidden sm:rounded-[28px] rounded-t-[28px] border ${
                            darkMode
                                ? 'bg-[#1c1c1e]/95 border-white/[0.10] text-white'
                                : 'bg-white/98 border-black/[0.06] text-[#1d1d1f] shadow-2xl'
                        }`}
                        style={{ backdropFilter: 'blur(40px) saturate(200%)' }}
                    >
                        {/* Handle bar — mobile sheet indicator */}
                        <div className={`sm:hidden mx-auto mt-3 w-10 h-[5px] rounded-full ${darkMode ? 'bg-white/20' : 'bg-black/15'}`} />

                        <div className="px-8 pt-8 pb-10">
                            {/* Close */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className={`text-[22px] font-semibold tracking-[-0.03em] ${darkMode ? 'text-white' : 'text-[#1d1d1f]'}`}>
                                        {isRegister ? t.registerTitle : t.loginTitle}
                                    </h2>
                                    <p className={`text-[13px] font-normal mt-0.5 ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                                        {isRegister ? t.registerSub : t.loginSub}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${darkMode ? 'bg-white/[0.10] text-white/50 hover:text-white' : 'bg-black/[0.07] text-black/40 hover:text-black/70'}`}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                                        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>

                            {/* Feedback */}
                            <AnimatePresence>
                                {message.text && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden mb-5"
                                    >
                                        <div className={`px-4 py-3 rounded-xl text-[13px] font-medium border ${
                                            message.type === 'error'
                                                ? 'bg-[#FF3B30]/[0.10] text-[#FF3B30] border-[#FF3B30]/20'
                                                : 'bg-[#32D74B]/[0.10] text-[#32D74B] border-[#32D74B]/20'
                                        }`}>
                                            {message.text}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form */}
                            <form className="space-y-3" onSubmit={handleAuth}>
                                <div>
                                    <label className={`block text-[12px] font-medium mb-1.5 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                                        {t.emailLabel}
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={inputClass}
                                        placeholder="mail@example.com"
                                        autoComplete="email"
                                    />
                                </div>

                                <div>
                                    <label className={`block text-[12px] font-medium mb-1.5 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                                        {t.passwordLabel}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPw ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={`${inputClass} pr-12`}
                                            placeholder="••••••••"
                                            autoComplete={isRegister ? 'new-password' : 'current-password'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw(!showPw)}
                                            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-white/25 hover:text-white/50' : 'text-black/25 hover:text-black/50'}`}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4.5 h-4.5">
                                                {showPw
                                                    ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" strokeLinecap="round"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/></>
                                                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></>
                                                }
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isRegister && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <label className={`block text-[12px] font-medium mb-1.5 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                                                {t.confirmPassword}
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={inputClass}
                                                placeholder="••••••••"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!isRegister && (
                                    <div className="flex justify-end pt-1">
                                        <button type="button" className="text-[13px] font-medium text-[#0A84FF] hover:underline underline-offset-2">
                                            {t.forgotPassword}
                                        </button>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className={`w-full h-12 rounded-xl bg-[#0A84FF] text-white text-[15px] font-medium tracking-[-0.01em] transition-all active:scale-[0.98] ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#0071E3]'}`}
                                        style={{ boxShadow: '0 4px 16px rgba(10,132,255,0.35)' }}
                                    >
                                        {loading ? (
                                            <div className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            isRegister ? t.register : t.login
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Switch */}
                            <p className={`mt-6 text-center text-[13px] font-medium ${darkMode ? 'text-white/35' : 'text-black/35'}`}>
                                {isRegister ? t.haveAccount : t.noAccount}{' '}
                                <button
                                    type="button"
                                    onClick={() => { setIsRegister(!isRegister); setMessage({ type: '', text: '' }); }}
                                    className="text-[#0A84FF] font-medium hover:underline underline-offset-2"
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