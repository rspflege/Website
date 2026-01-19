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

    return (
        <section id="gallery" className="py-32 px-6 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
                <h2 className={`text-5xl md:text-7xl font-black italic uppercase mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
                    {t.galleryTitle || "Unsere"} <span className="text-blue-500">{t.gallerySub || "Projekte"}</span>
                </h2>
                
                {/* CATEGORY FOLDERS (Filter) */}
                <div className="flex flex-wrap justify-center gap-2 mt-10">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                                activeTab === cat.id 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                : (darkMode ? 'border-white/10 text-white/40 hover:text-white' : 'border-black/5 text-black/40 hover:text-black')
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* BENTO GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[250px] gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredImages.map((image, index) => (
                        <motion.div
                            key={image.alt + index}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={() => setCurrentIndex(index)}
                            className={`${image.size} rounded-[2.5rem] overflow-hidden relative group cursor-pointer border ${darkMode ? 'border-white/5' : 'border-black/5'} shadow-2xl bg-black`}
                        >
                            <img src={image.src} alt={image.alt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                            
                            {/* Comparison Badge */}
                            {image.isComparison && (
                                <div className="absolute top-4 left-4 bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                    Before/After
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                                <p className="text-white text-xs font-black uppercase tracking-widest">{image.alt}</p>
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
                        className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4"
                        onClick={() => setCurrentIndex(null)}
                    >
                        {/* Navigation Controls */}
                        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-4 md:px-10 w-full pointer-events-none">
                            <button onClick={prevImage} className="p-4 text-white/20 hover:text-blue-500 pointer-events-auto transition-all bg-white/5 rounded-full backdrop-blur-md">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={nextImage} className="p-4 text-white/20 hover:text-blue-500 pointer-events-auto transition-all bg-white/5 rounded-full backdrop-blur-md">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        <div className="relative w-full max-w-6xl h-[70vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            {filteredImages[currentIndex].isComparison ? (
                                /* VORHER NACHHER SLIDER */
                                <div className="relative w-full h-full rounded-[3rem] overflow-hidden select-none border border-white/10 shadow-2xl">
                                    {/* Nachher (Basis) */}
                                    <img src={filteredImages[currentIndex].src} className="absolute inset-0 w-full h-full object-cover" />
                                    
                                    {/* Vorher (Obere Ebene) */}
                                    <div 
                                        className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-white/50" 
                                        style={{ width: `${sliderPos}%` }}
                                    >
                                        <img src={filteredImages[currentIndex].before} className="absolute inset-0 w-[100vw] h-full object-cover max-w-none" style={{ width: 'calc(6xl)' }} />
                                        <div className="absolute top-10 left-10 bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em]">Before</div>
                                    </div>
                                    <div className="absolute top-10 right-10 bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em]">After</div>

                                    {/* Slider Handle */}
                                    <input 
                                        type="range" min="0" max="100" value={sliderPos} 
                                        onChange={(e) => setSliderPos(e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-50"
                                    />
                                    <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)] z-40 pointer-events-none" style={{ left: `${sliderPos}%` }}>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-blue-600">
                                            <div className="flex gap-1">
                                                <div className="w-1 h-3 bg-blue-600 rounded-full" />
                                                <div className="w-1 h-3 bg-blue-600 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* NORMALES BILD */
                                <motion.img
                                    key={currentIndex}
                                    src={filteredImages[currentIndex].src}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="max-h-full w-full object-cover rounded-[3rem] shadow-2xl border border-white/10"
                                />
                            )}
                        </div>
                        
                        {/* Close Button Top Right */}
                        <button onClick={() => setCurrentIndex(null)} className="absolute top-10 right-10 text-white/30 hover:text-white transition-all">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}