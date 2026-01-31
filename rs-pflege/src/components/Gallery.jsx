import { useState, useEffect, useCallback } from 'react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';

import imgSuv from '../assets/bmw-suv.jpg';
import imgSedan from '../assets/bmw-heck.jpg';
import imgDash from '../assets/bmw-innen.jpg';
import imgConvertible from '../assets/bmw-cabrio.jpg';

export default function Gallery({ darkMode, lang }) {
    // Zentrales Übersetzungsobjekt laden
    const t = translations[lang] || translations.de;

    const [activeTab, setActiveTab] = useState('all');
    const [currentIndex, setCurrentIndex] = useState(null);
    const [sliderPos, setSliderPos] = useState(50);
    const [isDraggingSlider, setIsDraggingSlider] = useState(false);
    const [direction, setDirection] = useState(0);

    // Kategorien nutzen jetzt die Keys aus translations.js
    const categories = [
        { id: 'all', label: t.galleryCatAll || 'Alle' },
        { id: 'exterior', label: t.galleryCatExt || 'Exterieur' },
        { id: 'interior', label: t.galleryCatInt || 'Interieur' },
        { id: 'details', label: t.galleryCatDet || 'Details' }
    ];

    const allImages = [
        { src: imgSuv, before: imgSuv, alt: "SUV Premium", cat: 'exterior', isComparison: true, size: "md:col-span-2 md:row-span-2" },
        { src: imgSedan, alt: "Heck-Politur", cat: 'exterior', size: "md:col-span-1 md:row-span-1" },
        { src: imgDash, before: imgDash, alt: "Leder Refresh", cat: 'interior', isComparison: true, size: "md:col-span-1 md:row-span-2" },
        { src: imgConvertible, alt: "Cabrio Finish", cat: 'exterior', size: "md:col-span-2 md:row-span-1" },
        { src: imgDash, alt: "Cockpit", cat: 'interior', size: "md:col-span-1 md:row-span-1" },
    ];

    const filteredImages = activeTab === 'all' ? allImages : allImages.filter(img => img.cat === activeTab);

    const paginate = useCallback((newDirection) => {
        setDirection(newDirection);
        setSliderPos(50);
        setCurrentIndex((prev) => (prev + newDirection + filteredImages.length) % filteredImages.length);
    }, [filteredImages.length]);

    const handleDragEnd = (e, { offset, velocity }) => {
        if (isDraggingSlider) return;
        const swipe = Math.abs(offset.x) > 50 && Math.abs(velocity.x) > 500;
        if (swipe) {
            paginate(offset.x > 0 ? -1 : 1);
        }
    };

    useEffect(() => {
        if (currentIndex !== null && !isDraggingSlider) {
            const timer = setTimeout(() => paginate(1), 8000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, isDraggingSlider, paginate]);

    const handleSliderMove = (e) => {
        if (!isDraggingSlider) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = clientX - rect.left;
        setSliderPos(Math.max(0, Math.min(100, (x / rect.width) * 100)));
    };

    const slideVariants = {
        enter: (d) => ({ x: d > 0 ? '100%' : d < 0 ? '-100%' : 0, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d) => ({ x: d < 0 ? '100%' : d > 0 ? '-100%' : 0, opacity: 0 })
    };

    return (
        <section id="gallery" className="py-24 md:py-32 px-4 md:px-6 max-w-7xl mx-auto overflow-hidden">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-12">
                <h2 className={`text-5xl md:text-8xl font-black italic uppercase mb-6 tracking-tighter ${darkMode ? 'text-white' : 'text-black'}`}>
                    {t.galleryTitle} <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{t.gallerySub}</span>
                </h2>

                <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => { setActiveTab(cat.id); setCurrentIndex(null); }}
                            className={`px-5 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border-2 ${activeTab === cat.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : (darkMode ? 'border-white/5 text-white/30' : 'border-black/5 text-black/40')}`}>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[300px] gap-3 md:gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredImages.map((image, index) => (
                        <motion.div key={image.alt + index} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => { setDirection(0); setCurrentIndex(index); }}
                            className={`${image.size} rounded-[2rem] md:rounded-[3.5rem] overflow-hidden relative group cursor-pointer border-2 ${darkMode ? 'border-white/5' : 'border-black/5'} bg-black`}>
                            <img src={image.src} alt={image.alt} className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-110" />
                            {image.isComparison && (
                                <div className="absolute top-4 left-4 bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase italic z-10">
                                    {t.galleryComparison || "Comparison"}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {currentIndex !== null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center" onClick={() => setCurrentIndex(null)}>

                        <button onClick={() => setCurrentIndex(null)} className="absolute top-6 right-6 z-[2020] w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/20">
                            ✕
                        </button>

                        <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 hidden md:flex justify-between z-[2010] pointer-events-none">
                            <button onClick={(e) => { e.stopPropagation(); paginate(-1); }} className="p-6 text-white bg-white/5 hover:bg-blue-600 rounded-full border border-white/10 pointer-events-auto transition-all">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); paginate(1); }} className="p-6 text-white bg-white/5 hover:bg-blue-600 rounded-full border border-white/10 pointer-events-auto transition-all">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        <div className="relative w-full h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    drag={!isDraggingSlider ? "x" : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    onDragEnd={handleDragEnd}
                                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                    className="absolute inset-0 flex items-center justify-center px-4 md:px-0"
                                >
                                    {filteredImages[currentIndex].isComparison ? (
                                        <div className="relative w-full max-w-5xl aspect-[4/3] md:aspect-video rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl touch-none"
                                            onMouseMove={handleSliderMove} onTouchMove={handleSliderMove}
                                            onMouseDown={() => setIsDraggingSlider(true)} onMouseUp={() => setIsDraggingSlider(false)}
                                            onTouchStart={() => setIsDraggingSlider(true)} onTouchEnd={() => setIsDraggingSlider(false)}>

                                            <img src={filteredImages[currentIndex].src} className="absolute inset-0 w-full h-full object-cover" alt="After" />

                                            {/* Label After */}
                                            <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md text-white text-[10px] px-4 py-1 rounded-full font-bold uppercase tracking-widest z-20">
                                                {t.galleryAfter || "After"}
                                            </div>

                                            <div className="absolute inset-0 overflow-hidden border-r-2 border-blue-500 shadow-2xl" style={{ width: `${sliderPos}%` }}>
                                                <img src={filteredImages[currentIndex].before} className="absolute inset-0 h-full w-[100vw] max-w-none object-cover" alt="Before" />
                                                {/* Label Before */}
                                                <div className="absolute bottom-6 left-6 bg-blue-600/80 backdrop-blur-md text-white text-[10px] px-4 py-1 rounded-full font-bold uppercase tracking-widest z-20">
                                                    {t.galleryBefore || "Before"}
                                                </div>
                                            </div>

                                            {/* SLIDER HANDLE */}
                                            <div className="absolute top-0 bottom-0 z-50 pointer-events-none" style={{ left: `${sliderPos}%` }}>
                                                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-2xl">
                                                    <div className="flex gap-1 text-white scale-75">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" /></svg>
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={filteredImages[currentIndex].src} className="max-h-full max-w-full object-contain rounded-[2rem] shadow-2xl select-none" alt="Gallery" />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* MOBILE INFO TIPP */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 md:hidden text-white/30 text-[8px] font-black uppercase tracking-[0.3em] whitespace-nowrap">
                            {t.gallerySwipeTip || "Swipe to change"}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}