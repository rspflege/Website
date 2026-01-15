import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../translations'; // Pfad anpassen falls nötig

export default function Popup({ isOpen, onClose, title, children, darkMode, lang }) {
  // Aktuelle Sprache laden (Fallback auf DE)
  const t = translations[lang] || translations.de;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          {/* Content Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-lg apple-glass rounded-[3rem] p-10 shadow-2xl overflow-hidden border ${
              darkMode ? 'border-white/10 bg-black/80 text-white' : 'border-black/5 bg-white/90 text-black'
            }`}
          >
            {/* Schließen Button oben rechts */}
            <button 
              onClick={onClose}
              className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
            >
              <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              {/* Titel (kann jetzt entweder als String oder als Übersetzungsschlüssel kommen) */}
              <h3 className="text-2xl font-black italic uppercase mb-4">
                {title}
              </h3>
              
              <div className="text-sm font-medium opacity-70 leading-relaxed mb-8">
                {children}
              </div>

              {/* Dynamischer Button-Text (t.back oder t.ok in translations.js ergänzen) */}
              <button 
                onClick={onClose}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                {t.back || "OK"} 
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}