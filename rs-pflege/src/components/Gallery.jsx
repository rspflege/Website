import { useState, useEffect, useCallback } from 'react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';

import imgSuv from '../assets/bmw-suv.jpg';
import imgSedan from '../assets/bmw-heck.jpg';
import imgDash from '../assets/bmw-innen.jpg';
import imgConvertible from '../assets/bmw-cabrio.jpg';

export default function Gallery({ darkMode, lang }) {
    const t = translations[lang] || translations.de;

    const [activeTab, setActiveTab] = useState('all');
    const [currentIndex, setCurrentIndex] = useState(null);
    const [sliderPos, setSliderPos] = useState(50);
    const [isDraggingSlider, setIsDraggingSlider] = useState(false);
    const [direction, setDirection] = useState(0);

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
        if (swipe) paginate(offset.x > 0 ? -1 : 1);
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

    const cardGlass = darkMode
        ? 'border-white/8 bg-white/3'
        : 'border-white/60 bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]';

    return (
        <section id="gallery" className="py-24 md:py-32 px-4 md:px-6 max-w-7xl mx-auto overflow-hidden">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-14"
            >
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 ${darkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {lang === 'de' ? 'Unsere Arbeit' : 'Our work'}
                </div>

                <h2 className={`text-5xl md:text-8xl font-black italic uppercase mb-4 tracking-tighter ${darkMode ? 'text-white' : 'text-black'}`}>
                    {t.galleryTitle}{' '}
                    <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">{t.gallerySub}</span>
                </h2>

                <p className={`text-sm font-medium max-w-md mx-auto leading-relaxed mb-8 ${darkMode ? 'text-white/35' : 'text-black/40'}`}>
                    {lang === 'de'
                        ? 'Jedes Bild erzählt eine Geschichte. Sehen Sie selbst, was möglich ist — Vorher & Nachher Vergleiche inklusive.'
                        : 'Every photo tells a story. See for yourself what\'s possible — before & after comparisons included.'}
                </p>

                {/* Category Filter */}
                <div className={`inline-flex items-center gap-1 p-1.5 rounded-2xl border backdrop-blur-xl ${darkMode ? 'bg-white/4 border-white/8' : 'bg-white/60 border-black/6 shadow-md'}`}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveTab(cat.id); setCurrentIndex(null); }}
                            className={`relative px-5 md:px-7 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === cat.id ? 'text-white' : (darkMode ? 'text-white/30 hover:text-white/60' : 'text-black/35 hover:text-black/60')}`}
                        >
                            {activeTab === cat.id && (
                                <motion.div layoutId="galleryTab" className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
                            )}
                            <span className="relative z-10">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[280px] gap-3 md:gap-5">
                <AnimatePresence mode="popLayout">
                    {filteredImages.map((image, index) => (
                        <motion.div
                            key={image.alt + index}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            onClick={() => { setDirection(0); setCurrentIndex(index); }}
                            className={`${image.size} rounded-[2rem] md:rounded-[3rem] overflow-hidden relative group cursor-pointer border ${cardGlass} backdrop-blur-sm bg-black`}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="absolute inset-0 w-full h-full object-cover opacity-75 transition-all duration-700 group-hover:scale-108 group-hover:opacity-90"
                                style={{ transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease' }}
                            />

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Comparison Badge */}
                            {image.isComparison && (
                                <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider z-10 border border-blue-400/30">
                                    {t.galleryComparison || "Before / After"}
                                </div>
                            )}

                            {/* Hover info */}
                            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0">
                                <p className="text-white text-[10px] font-black uppercase tracking-widest">{image.alt}</p>
                                <p className="text-white/50 text-[8px] font-bold uppercase mt-0.5">{lang === 'de' ? 'Klicken zum Vergrößern' : 'Click to enlarge'}</p>
                            </div>

                            {/* Click overlay */}
                            <div className="absolute inset-0 ring-0 group-hover:ring-2 group-hover:ring-blue-500/40 rounded-[2rem] md:rounded-[3rem] transition-all duration-300" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {currentIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-3xl flex items-center justify-center"
                        onClick={() => setCurrentIndex(null)}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setCurrentIndex(null)}
                            className="absolute top-6 right-6 z-[2020] w-12 h-12 bg-white/8 hover:bg-white/15 rounded-full flex items-center justify-center text-white border border-white/15 transition-all backdrop-blur-xl"
                        >
                            ✕
                        </button>

                        {/* Image counter */}
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[2020] flex gap-2">
                            {filteredImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                                    className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-blue-500' : 'w-2 bg-white/20'}`}
                                />
                            ))}
                        </div>

                        {/* Navigation arrows */}
                        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 hidden md:flex justify-between z-[2010] pointer-events-none">
                            {[{ dir: -1, icon: "M15 19l-7-7 7-7" }, { dir: 1, icon: "M9 5l7 7-7 7" }].map(({ dir, icon }) => (
                                <button
                                    key={dir}
                                    onClick={(e) => { e.stopPropagation(); paginate(dir); }}
                                    className="p-5 text-white bg-white/6 hover:bg-blue-600 rounded-2xl border border-white/10 pointer-events-auto transition-all duration-300 backdrop-blur-xl hover:scale-105"
                                >
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon} />
                                    </svg>
                                </button>
                            ))}
                        </div>

                        {/* Image */}
                        <div
                            className="relative w-full h-[82vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
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
                                    transition={{ x: { type: "spring", stiffness: 280, damping: 28 }, opacity: { duration: 0.2 } }}
                                    className="absolute inset-0 flex items-center justify-center px-4 md:px-20"
                                >
                                    {filteredImages[currentIndex].isComparison ? (
                                        <div
                                            className="relative w-full max-w-5xl aspect-[4/3] md:aspect-video rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl touch-none"
                                            onMouseMove={handleSliderMove}
                                            onTouchMove={handleSliderMove}
                                            onMouseDown={() => setIsDraggingSlider(true)}
                                            onMouseUp={() => setIsDraggingSlider(false)}
                                            onTouchStart={() => setIsDraggingSlider(true)}
                                            onTouchEnd={() => setIsDraggingSlider(false)}
                                        >
                                            <img src={filteredImages[currentIndex].src} className="absolute inset-0 w-full h-full object-cover" alt="After" />
                                            <div className="absolute bottom-5 right-5 bg-black/50 backdrop-blur-md text-white text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest z-20">
                                                {t.galleryAfter || "After"}
                                            </div>

                                            <div className="absolute inset-0 overflow-hidden border-r-2 border-blue-500" style={{ width: `${sliderPos}%` }}>
                                                <img src={filteredImages[currentIndex].before} className="absolute inset-0 h-full w-[100vw] max-w-none object-cover" alt="Before" />
                                                <div className="absolute bottom-5 left-5 bg-blue-600/90 backdrop-blur-md text-white text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest z-20">
                                                    {t.galleryBefore || "Before"}
                                                </div>
                                            </div>

                                            {/* Slider handle */}
                                            <div className="absolute top-0 bottom-0 z-50 pointer-events-none" style={{ left: `${sliderPos}%` }}>
                                                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                                                    <div className="flex gap-0.5 text-white">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" /></svg>
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={filteredImages[currentIndex].src}
                                            className="max-h-full max-w-full object-contain rounded-[2rem] shadow-2xl select-none"
                                            alt="Gallery"
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Mobile swipe tip */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:hidden text-white/25 text-[8px] font-black uppercase tracking-[0.3em] whitespace-nowrap">
                            {t.gallerySwipeTip || "Swipe to change"}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}