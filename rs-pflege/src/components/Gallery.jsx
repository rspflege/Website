import { useState, useEffect, useCallback } from 'react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';

// Imports (beibehalten)
import imgSuv from '../assets/bmw-suv.jpg';
import imgSedan from '../assets/bmw-heck.jpg';
import imgDash from '../assets/bmw-innen.jpg';
import imgConvertible from '../assets/bmw-cabrio.jpg';

export default function Gallery({ darkMode, lang }) {
    const t = translations[lang] || translations.de;
    const [activeTab, setActiveTab] = useState('all');
    const [currentIndex, setCurrentIndex] = useState(null);
    const [sliderPos, setSliderPos] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [direction, setDirection] = useState(0);

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

    const paginate = useCallback((newDirection) => {
        setDirection(newDirection);
        setSliderPos(50);
        setCurrentIndex((prev) => (prev + newDirection + filteredImages.length) % filteredImages.length);
    }, [filteredImages.length]);

    // Auto-Play
    useEffect(() => {
        if (currentIndex !== null && !isDragging) {
            const timer = setTimeout(() => paginate(1), 5000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, isDragging, paginate]);

    const handleMove = (e) => {
        if (!isDragging) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = clientX - rect.left;
        const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPos(pos);
    };

    const slideVariants = {
        enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 })
    };

    return (
        <section id="gallery" className="py-32 px-6 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
                <h2 className={`text-6xl md:text-8xl font-black italic uppercase mb-6 tracking-tighter ${darkMode ? 'text-white' : 'text-black'}`}>
                    {t.galleryTitle || "PURE"} <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">{t.gallerySub || "RESULTS"}</span>
                </h2>

                <div className="flex flex-wrap justify-center gap-3 mt-10">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveTab(cat.id); setCurrentIndex(null); }}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 border-2 ${activeTab === cat.id
                                ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-105'
                                : (darkMode ? 'border-white/5 text-white/30 hover:border-white/20' : 'border-black/5 text-black/40 hover:text-black')
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
                            transition={{ duration: 0.5 }}
                            onClick={() => { setDirection(0); setCurrentIndex(index); }}
                            className={`${image.size} rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden relative group cursor-pointer border-2 ${darkMode ? 'border-white/5' : 'border-black/5'} shadow-2xl bg-black`}
                        >
                            <img src={image.src} alt={image.alt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                            {image.isComparison && (
                                <div className="absolute top-6 left-6 bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest z-10 italic">Comparison</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-10 flex flex-col justify-end">
                                <p className="text-white text-2xl font-black italic uppercase">{image.alt}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* LIGHTBOX */}
            <AnimatePresence>
                {currentIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4"
                        onClick={() => setCurrentIndex(null)}
                    >
                        <button onClick={() => setCurrentIndex(null)} className="absolute top-8 right-8 z-[1020] w-14 h-14 bg-white/5 hover:bg-red-500 text-white transition-all rounded-full flex items-center justify-center border border-white/10">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="absolute inset-x-4 md:inset-x-10 top-1/2 -translate-y-1/2 flex justify-between z-[1010] pointer-events-none">
                            <button onClick={(e) => { e.stopPropagation(); paginate(-1); }} className="p-6 text-white bg-white/5 hover:bg-blue-600 rounded-full backdrop-blur-xl border border-white/10 pointer-events-auto transition-all group">
                                <svg className="w-8 h-8 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); paginate(1); }} className="p-6 text-white bg-white/5 hover:bg-blue-600 rounded-full backdrop-blur-xl border border-white/10 pointer-events-auto transition-all group">
                                <svg className="w-8 h-8 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        <div className="relative w-full h-[75vh] max-w-6xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    {filteredImages[currentIndex].isComparison ? (
                                        <div 
                                            className="relative w-full h-full rounded-[3rem] overflow-hidden cursor-ew-resize border border-white/10 shadow-2xl select-none"
                                            onMouseMove={handleMove} onTouchMove={handleMove}
                                            onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)}
                                            onMouseLeave={() => setIsDragging(false)}
                                        >
                                            <img draggable="false" src={filteredImages[currentIndex].src} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="After" />
                                            <div 
                                                className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-blue-500 shadow-2xl pointer-events-none"
                                                style={{ width: `${sliderPos}%` }}
                                            >
                                                <img draggable="false" src={filteredImages[currentIndex].before} className="absolute inset-0 h-full object-cover max-w-none" 
                                                    style={{ width: 'min(90vw, 1152px)' }} alt="Before" />
                                                <div className="absolute top-10 left-10 bg-black/50 backdrop-blur-md text-white text-[10px] px-6 py-2 rounded-full font-black uppercase tracking-widest border border-white/10">Before</div>
                                            </div>
                                            <div className="absolute top-10 right-10 bg-blue-600 text-white text-[10px] px-6 py-2 rounded-full font-black uppercase tracking-widest italic shadow-lg pointer-events-none">After</div>

                                            {/* CENTERED SLIDER HANDLE */}
                                            <div className="absolute top-0 bottom-0 z-50 pointer-events-none" style={{ left: `${sliderPos}%` }}>
                                                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)] border-4 border-white">
                                                    <div className="flex items-center justify-center gap-1 text-white">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" /></svg>
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <img draggable="false" src={filteredImages[currentIndex].src} className="max-h-full max-w-full object-contain rounded-[3rem] shadow-2xl border border-white/10 select-none" alt="Gallery" />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}