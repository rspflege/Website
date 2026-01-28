import { useState, useEffect } from 'react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';

// Beispielbilder (behalte deine Imports bei)
import imgSuv from '../assets/bmw-suv.jpg';
import imgSedan from '../assets/bmw-heck.jpg';
import imgDash from '../assets/bmw-innen.jpg';
import imgConvertible from '../assets/bmw-cabrio.jpg';

export default function Gallery({ darkMode, lang }) {
    const t = translations[lang] || translations.de;
    const [activeTab, setActiveTab] = useState('all');
    const [currentIndex, setCurrentIndex] = useState(null);
    const [sliderPos, setSliderPos] = useState(50); // Für den Vorher-Nachher Slider
    const [isDragging, setIsDragging] = useState(false);

    // Kategorien definieren
    const categories = [
        { id: 'all', label: lang === 'en' ? 'All' : 'Alle' },
        { id: 'exterior', label: lang === 'en' ? 'Exterior' : 'Exterieur' },
        { id: 'interior', label: lang === 'en' ? 'Interior' : 'Interieur' },
        { id: 'details', label: lang === 'en' ? 'Details' : 'Details' }
    ];

    const allImages = [
        { src: imgSuv, before: imgSuv, alt: "SUV Premium", cat: 'exterior', isComparison: true, size: "md:col-span-2 md:row-span-2" },
        { src: imgSedan, alt: "Heck-Politur", cat: 'exterior', size: "md:col-span-1 md:row-span-1" },
        { src: imgDash, before: imgDash, alt: "Leder Refresh", cat: 'interior', isComparison: true, size: "md:col-span-1 md:row-span-2" },
        { src: imgConvertible, alt: "Cabrio Finish", cat: 'exterior', size: "md:col-span-2 md:row-span-1" },
        { src: imgDash, alt: "Cockpit", cat: 'interior', size: "md:col-span-1 md:row-span-1" },
    ];

    const filteredImages = activeTab === 'all'
        ? allImages
        : allImages.filter(img => img.cat === activeTab);

    // Navigation
    const nextImage = (e) => {
        if (e) e.stopPropagation();
        setSliderPos(50);
        setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
    };

    const prevImage = (e) => {
        if (e) e.stopPropagation();
        setSliderPos(50);
        setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
    };

    // Slider-Steuerung für Touch & Maus
    const handleMove = (e) => {
        if (!isDragging && e.type !== 'change') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.pageX || e.touches[0].pageX) - rect.left;
        const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPos(pos);
    };

    return (
        <section id="gallery" className="py-32 px-6 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
                <h2 className={`text-6xl md:text-8xl font-black italic uppercase mb-6 tracking-tighter ${darkMode ? 'text-white' : 'text-black'}`}>
                    {t.galleryTitle || "PURE"} <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">{t.gallerySub || "RESULTS"}</span>
                </h2>

                {/* CATEGORY FOLDERS */}
                <div className="flex flex-wrap justify-center gap-3 mt-10">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 border-2 ${activeTab === cat.id
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-105'
                                    : (darkMode ? 'border-white/5 text-white/30 hover:border-white/20 hover:text-white' : 'border-black/5 text-black/40 hover:text-black')
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* BENTO GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[300px] gap-4 md:gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredImages.map((image, index) => (
                        <motion.div
                            key={image.alt + index}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            onClick={() => setCurrentIndex(index)}
                            className={`${image.size} rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden relative group cursor-pointer border-2 ${darkMode ? 'border-white/5' : 'border-black/5'} shadow-2xl bg-[#0a0a0a]`}
                        >
                            <img src={image.src} alt={image.alt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" />

                            {/* Comparison Badge */}
                            {image.isComparison && (
                                <div className="absolute top-6 left-6 bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest z-10 italic">
                                    Before / After
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-10 flex flex-col justify-end translate-y-4 group-hover:translate-y-0">
                                <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Project Details</p>
                                <p className="text-white text-2xl font-black italic uppercase tracking-tighter leading-none">{image.alt}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* LIGHTBOX MIT SLIDER */}
            <AnimatePresence>
                {currentIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12"
                        onClick={() => setCurrentIndex(null)}
                    >
                        {/* UI Elements */}
                        <div className="absolute top-10 left-10 right-10 flex justify-between items-center z-[1010]">
                            <div className="text-white">
                                <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1 italic">RS Detailing Gallery</p>
                                <p className="text-2xl font-black italic uppercase">{filteredImages[currentIndex].alt}</p>
                            </div>
                            <button onClick={() => setCurrentIndex(null)} className="w-14 h-14 bg-white/5 hover:bg-red-500/20 hover:text-red-500 text-white transition-all rounded-full flex items-center justify-center backdrop-blur-md border border-white/10">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Navigation */}
                        <div className="absolute inset-x-4 md:inset-x-10 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-[1010]">
                            <button onClick={prevImage} className="p-6 text-white/20 hover:text-blue-500 pointer-events-auto transition-all bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-xl border border-white/5 group">
                                <svg className="w-8 h-8 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={nextImage} className="p-6 text-white/20 hover:text-blue-500 pointer-events-auto transition-all bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-xl border border-white/5 group">
                                <svg className="w-8 h-8 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        <div className="relative w-full h-full max-w-6xl max-h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            {filteredImages[currentIndex].isComparison ? (
                                <div
                                    className="relative w-full h-full rounded-[2.5rem] md:rounded-[4rem] overflow-hidden select-none border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.9)] cursor-ew-resize"
                                    onMouseMove={handleMove}
                                    onTouchMove={handleMove}
                                    onMouseDown={() => setIsDragging(true)}
                                    onMouseUp={() => setIsDragging(false)}
                                    onMouseLeave={() => setIsDragging(false)}
                                >
                                    {/* Nachher (Basis) */}
                                    <img src={filteredImages[currentIndex].src} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="After" />

                                    {/* Vorher (Obere Ebene) */}
                                    <div
                                        className="absolute inset-0 w-full h-full overflow-hidden border-r-4 border-blue-500 shadow-[10px_0_40px_rgba(0,0,0,0.5)]"
                                        style={{ width: `${sliderPos}%`, transition: isDragging ? 'none' : 'width 0.1s ease-out' }}
                                    >
                                        <img
                                            src={filteredImages[currentIndex].before}
                                            className="absolute inset-0 h-full object-cover max-w-none pointer-events-none"
                                            style={{ width: 'calc(100vw * 0.8)' }} // Dynamische Breite für das Vorher-Bild
                                            alt="Before"
                                        />
                                        <div className="absolute top-10 left-10 bg-black/60 backdrop-blur-xl text-white text-[10px] font-black px-6 py-3 rounded-full uppercase tracking-[0.3em] border border-white/10">Before</div>
                                    </div>

                                    {/* Labels & Handle */}
                                    <div className="absolute top-10 right-10 bg-blue-600 text-white text-[10px] font-black px-6 py-3 rounded-full uppercase tracking-[0.3em] shadow-xl italic">After</div>

                                    {/* Custom Handle Button */}
                                    <div
                                        className="absolute top-0 bottom-0 w-1 z-40 pointer-events-none"
                                        style={{ left: `${sliderPos}%`, transition: isDragging ? 'none' : 'left 0.1s ease-out' }}
                                    >
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.6)] border-4 border-white">
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l-5 5m0 0l5 5m-5-5h18m-5-10l5 5m0 0l-5 5" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <motion.img
                                    key={currentIndex}
                                    src={filteredImages[currentIndex].src}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="max-h-full w-auto object-contain rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border border-white/10"
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}