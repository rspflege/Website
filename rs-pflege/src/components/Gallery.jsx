import { translations } from '../translations';

export default function Gallery({ darkMode, lang }) {
    const t = translations[lang] || translations.de;

    return (
        <section id="gallery" className="py-32 px-6 max-w-7xl mx-auto">
            {/* Header mit dynamischer Übersetzung */}
            <h2 className={`text-4xl md:text-6xl font-black italic uppercase mb-16 text-center tracking-tighter ${darkMode ? 'text-white' : 'text-black'}`}>
                {t.galleryTitle} <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{t.gallerySub}</span>
            </h2>

            {/* Bento-Style Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`aspect-[3/4] rounded-[2rem] overflow-hidden relative group cursor-pointer transition-all duration-700 hover:scale-[0.98] ${darkMode ? 'bg-white/5 border border-white/5' : 'bg-black/5 border border-black/5'
                            }`}
                    >
                        {/* Overlay Effekt */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* "Coming Soon" Text aus der translations.js */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-[1px] bg-blue-500 scale-0 group-hover:scale-100 transition-transform duration-500" />
                                <span className="text-[10px] font-black text-blue-500 opacity-0 group-hover:opacity-100 uppercase tracking-[0.3em] translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                    {t.comingSoon}
                                </span>
                                <div className="w-8 h-[1px] bg-blue-500 scale-0 group-hover:scale-100 transition-transform duration-500" />
                            </div>
                        </div>

                        {/* Subtiler Glow Effekt im Hintergrund */}
                        <div className="absolute -inset-2 bg-blue-600/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                ))}
            </div>
        </section>
    );
}