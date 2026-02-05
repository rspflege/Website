import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

const Toast = ({ toast, removeToast, darkMode }) => {
    // Automatisches Entfernen nach 3 Sekunden
    useEffect(() => {
        const timer = setTimeout(() => removeToast(toast.id), 3000);
        return () => clearTimeout(timer);
    }, [toast.id, removeToast]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className={`flex items-center gap-4 p-3 pr-6 rounded-[1.5rem] border backdrop-blur-2xl shadow-2xl mb-3 pointer-events-auto
                ${darkMode
                    ? 'bg-black/60 border-white/10 text-white'
                    : 'bg-white/80 border-black/5 text-black'}`}
        >
            {/* Produkt-Miniatur */}
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-white/10">
                <img src={toast.img} alt="" className="w-full h-full object-cover" />
            </div>

            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">{toast.message}</p>
                <p className="text-sm font-bold truncate max-w-[150px]">{toast.name}</p>
            </div>

            {/* Close Button */}
            <button onClick={() => removeToast(toast.id)} className="ml-2 opacity-30 hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </motion.div>
    );
};

export default function ToastContainer({ toasts, removeToast, darkMode }) {
    return (
        <div className="fixed top-24 right-6 z-[100] pointer-events-none flex flex-col items-end ">
            <AnimatePresence>
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} removeToast={removeToast} darkMode={darkMode} />
                ))}
            </AnimatePresence>
        </div>
    );
}