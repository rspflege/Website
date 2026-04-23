import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../translations';

const sf = { fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' };

export default function Popup({ isOpen, onClose, title, children, darkMode, lang }) {
    const t = translations[lang] || translations.de;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4" style={sf}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/35"
                        style={{ backdropFilter: 'blur(6px)' }}
                    />

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 20 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                        className={`relative w-full sm:max-w-[380px] rounded-[24px] border overflow-hidden ${
                            darkMode
                                ? 'bg-[#2c2c2e]/95 border-white/[0.12] text-white'
                                : 'bg-white/98 border-black/[0.06] text-[#1d1d1f] shadow-xl'
                        }`}
                        style={{ backdropFilter: 'blur(40px) saturate(200%)' }}
                    >
                        <div className="px-7 py-7">
                            {/* Icon area */}
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${darkMode ? 'bg-[#0A84FF]/[0.15]' : 'bg-[#0071E3]/[0.08]'}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#0A84FF" strokeWidth="1.5" className="w-7 h-7">
                                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
                                </svg>
                            </div>

                            {/* Title */}
                            <h3 className={`text-[18px] font-semibold tracking-[-0.02em] text-center mb-2 ${darkMode ? 'text-white' : 'text-[#1d1d1f]'}`}>
                                {title}
                            </h3>

                            {/* Body */}
                            <div className={`text-[14px] text-center leading-[1.6] mb-7 ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                                {children}
                            </div>

                            {/* Actions */}
                            <button
                                onClick={onClose}
                                className="w-full h-12 rounded-xl bg-[#0A84FF] text-white text-[15px] font-medium transition-all hover:bg-[#0071E3] active:scale-[0.98]"
                            >
                                {t.back || 'OK'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}