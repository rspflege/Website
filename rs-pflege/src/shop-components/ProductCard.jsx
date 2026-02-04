import { motion } from 'framer-motion';

export default function ProductCard({ p, lang, onAdd, darkMode }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="group relative"
        >
            {/* SUBTILER HINTERGRUND-SCHATTEN */}
            <div className={`absolute -inset-2 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none
                ${darkMode ? 'bg-blue-600/10' : 'bg-blue-500/5'}`}
            />

            <div className={`relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 h-full flex flex-col
                ${darkMode
                    ? 'bg-[#121212] border-white/10 shadow-2xl'
                    : 'bg-white border-black/[0.05] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]'} 
                p-4`}
            >
                {/* IMAGE AREA */}
                <div className={`relative aspect-[10/11] overflow-hidden rounded-[2rem] mb-6
                    ${darkMode ? 'bg-white/[0.03]' : 'bg-black/[0.02]'}`}>

                    {p.tag && (
                        <div className="absolute top-4 left-4 z-20">
                            <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                                {p.tag}
                            </span>
                        </div>
                    )}

                    <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        src={p.img}
                        alt={p.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* CONTENT AREA */}
                <div className="px-2 flex flex-col flex-grow relative z-20">
                    <div className="space-y-1">
                        <p className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${darkMode ? 'text-white' : 'text-black'}`}>
                            {p.catKey}
                        </p>
                        <h3 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>
                            {p.name}
                        </h3>
                    </div>

                    <div className="mt-auto pt-6 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className={`text-[10px] font-medium opacity-40 ${darkMode ? 'text-white' : 'text-black'}`}>
                                {lang === 'en' ? 'Price' : 'Preis'}
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                    {p.price.toFixed(2)}
                                </span>
                                <span className="text-blue-600 font-bold text-sm">€</span>
                            </div>
                        </div>

                        {/* --- KLASSISCHER, CLEANER BUTTON --- */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onAdd(p)}
                            className={`
                                w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200
                                ${darkMode
                                    ? 'bg-white text-black hover:bg-blue-500 hover:text-white'
                                    : 'bg-black text-white hover:bg-blue-600'}
                            `}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v12m6-6H6" />
                            </svg>
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}