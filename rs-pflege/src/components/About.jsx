import { translations } from '../translations';

export default function About({ darkMode, lang }) {
    // Aktuelle Sprache laden (Fallback auf DE)
    const t = translations[lang] || translations.de;

    const textColor = darkMode ? 'text-white' : 'text-[#1d1d1f]';
    const cardClass = darkMode ? 'apple-glass border-white/10' : 'bg-white/70 border-black/5 shadow-xl';

    return (
        <section id="about" className={`py-32 px-6 max-w-7xl mx-auto ${textColor}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-5xl md:text-7xl font-black italic uppercase mb-8 leading-none">
                        {t.aboutTitle}<br />
                        <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                            {t.aboutSubtitle}
                        </span>
                    </h2>

                    <p className="text-lg font-medium opacity-70 mb-8 leading-relaxed">
                        {t.aboutText}
                    </p>

                    <div className="flex gap-4">
                        <div className={`${cardClass} p-6 rounded-3xl flex-1 text-center backdrop-blur-md border transition-transform hover:scale-105 duration-500`}>
                            <div className="text-3xl font-black text-blue-500 mb-1 italic">100%</div>
                            <div className="text-[9px] font-black uppercase tracking-widest opacity-50">
                                {t.handwork}
                            </div>
                        </div>

                        <div className={`${cardClass} p-6 rounded-3xl flex-1 text-center backdrop-blur-md border transition-transform hover:scale-105 duration-500`}>
                            <div className="text-3xl font-black text-blue-500 mb-1 italic">VÖ</div>
                            <div className="text-[9px] font-black uppercase tracking-widest opacity-50">
                                {t.local}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Foto Platzhalter */}
                <div className={`${cardClass} aspect-square rounded-[4rem] overflow-hidden group border relative`}>
                    <div className="w-full h-full bg-blue-600/10 flex items-center justify-center relative">
                        {/* Hier später: <img src="/path/to/photo.jpg" className="object-cover w-full h-full" /> */}
                        <span className="text-blue-500 font-black italic text-2xl group-hover:scale-110 transition-transform duration-700 z-10">
                            RS TEAM PHOTO
                        </span>

                        {/* Overlay Effekt */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>

                        {/* Subtile Glas-Animation im Hintergrund */}
                        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}