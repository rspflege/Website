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
    const [direction, setDirection] = useState(0);

    const categories = [
        { id: 'all',      label: t.galleryCatAll || 'Alle' },
        { id: 'exterior', label: t.galleryCatExt || 'Exterieur' },
        { id: 'interior', label: t.galleryCatInt || 'Interieur' },
        { id: 'details',  label: t.galleryCatDet || 'Details' },
    ];

    const allImages = [
        { src: imgSuv,         alt: 'SUV Premium',   cat: 'exterior', size: 'md:col-span-2 md:row-span-2' },
        { src: imgSedan,       alt: 'Heck-Politur',  cat: 'exterior', size: 'md:col-span-1 md:row-span-1' },
        { src: imgDash,        alt: 'Leder Refresh', cat: 'interior', size: 'md:col-span-1 md:row-span-2' },
        { src: imgConvertible, alt: 'Cabrio Finish',  cat: 'exterior', size: 'md:col-span-2 md:row-span-1' },
        { src: imgDash,        alt: 'Cockpit',       cat: 'interior', size: 'md:col-span-1 md:row-span-1' },
    ];

    const filteredImages = activeTab === 'all'
        ? allImages
        : allImages.filter(img => img.cat === activeTab);

    const openLightbox  = (index) => { setDirection(0); setCurrentIndex(index); };
    const closeLightbox = useCallback(() => setCurrentIndex(null), []);

    const paginate = useCallback((newDirection) => {
        setDirection(newDirection);
        setCurrentIndex(prev => (prev + newDirection + filteredImages.length) % filteredImages.length);
    }, [filteredImages.length]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') closeLightbox(); };
        if (currentIndex !== null) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [currentIndex, closeLightbox]);

    useEffect(() => {
        if (currentIndex !== null) {
            const timer = setTimeout(() => paginate(1), 8000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, paginate]);

    const handleDragEnd = (e, { offset, velocity }) => {
        if (Math.abs(offset.x) > 50 && Math.abs(velocity.x) > 300) paginate(offset.x > 0 ? -1 : 1);
    };

    const slideVariants = {
        enter: (d) => ({ x: d > 0 ? '100%' : d < 0 ? '-100%' : 0, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit:  (d) => ({ x: d < 0 ? '100%' : d > 0 ? '-100%' : 0, opacity: 0 }),
    };

    const cardGlass = darkMode
        ? 'border-white/8 bg-white/3'
        : 'border-white/60 bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]';

    return (
        <section id="gallery" className="py-24 md:py-32 px-4 md:px-6 max-w-7xl mx-auto overflow-hidden">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="text-center mb-14"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 ${
                        darkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    {lang === 'de' ? 'Unsere Arbeit' : 'Our work'}
                </motion.div>

                <h2 className={`text-5xl md:text-8xl font-black italic uppercase mb-4 tracking-tighter ${darkMode ? 'text-white' : 'text-black'}`}>
                    {t.galleryTitle}{' '}
                    <span className="text-blue-500 drop-shadow-[0_0_24px_rgba(59,130,246,0.45)]">{t.gallerySub}</span>
                </h2>

                <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                    className={`text-sm font-medium max-w-md mx-auto leading-relaxed mb-8 ${darkMode ? 'text-white/35' : 'text-black/40'}`}
                >
                    {lang === 'de'
                        ? 'Jedes Bild erzählt eine Geschichte. Klicken Sie auf ein Bild um es zu vergrößern.'
                        : 'Every photo tells a story. Click an image to enlarge it.'}
                </motion.p>

                {/* Category filter */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25, duration: 0.7 }}
                    className={`inline-flex items-center gap-1 p-1.5 rounded-2xl border backdrop-blur-xl ${
                        darkMode ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-white/60 border-black/[0.06] shadow-md'
                    }`}
                >
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveTab(cat.id); setCurrentIndex(null); }}
                            className={`relative px-5 md:px-7 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                activeTab === cat.id ? 'text-white' : darkMode ? 'text-white/30 hover:text-white/60' : 'text-black/35 hover:text-black/60'
                            }`}
                        >
                            {activeTab === cat.id && (
                                <motion.div layoutId="galleryTab" className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />
                            )}
                            <span className="relative z-10">{cat.label}</span>
                        </button>
                    ))}
                </motion.div>
            </motion.div>

            {/* Image Grid — no Before/After badge in grid, only in lightbox */}
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[280px] gap-3 md:gap-5">
                <AnimatePresence mode="popLayout">
                    {filteredImages.map((image, index) => (
                        <motion.div
                            key={image.alt + activeTab}
                            layout
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -10 }}
                            transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => openLightbox(index)}
                            className={`${image.size} rounded-[2rem] md:rounded-[3rem] overflow-hidden relative group cursor-pointer border ${cardGlass} backdrop-blur-sm bg-black`}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-95 transition-all duration-700"
                                style={{ transform: 'scale(1)', transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400">
                                <p className="text-white text-[10px] font-black uppercase tracking-widest">{image.alt}</p>
                                <p className="text-white/50 text-[8px] font-bold uppercase mt-0.5">
                                    {lang === 'de' ? 'Klicken zum Vergrößern' : 'Click to enlarge'}
                                </p>
                            </div>
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
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[2100] bg-black/96 backdrop-blur-3xl flex items-center justify-center"
                        onClick={closeLightbox}
                    >
                        {/* ── Schließen-Button oben rechts ── */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 320, damping: 22 }}
                            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                            className="absolute top-4 right-4 z-[2200] w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-white transition-all duration-200 active:scale-90"
                            aria-label="Schließen"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                            </svg>
                        </motion.button>

                        {/* ── Dots Navigation ── */}
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[2110] flex gap-2">
                            {filteredImages.map((_, i) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); openLightbox(i); }}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-7 bg-blue-500' : 'w-2 bg-white/25 hover:bg-white/50'}`}
                                />
                            ))}
                        </div>

                        {/* ── Bildtitel unten ── */}
                        <motion.div
                            key={currentIndex + '-title'}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2110] text-center pointer-events-none"
                        >
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">
                                {filteredImages[currentIndex]?.alt}
                            </p>
                        </motion.div>

                        {/* ── Desktop Pfeile links/rechts ── */}
                        <div className="absolute inset-x-4 md:inset-x-6 top-1/2 -translate-y-1/2 hidden md:flex justify-between z-[2110] pointer-events-none">
                            {[{ dir: -1, icon: 'M15 19l-7-7 7-7' }, { dir: 1, icon: 'M9 5l7 7-7 7' }].map(({ dir, icon }) => (
                                <motion.button key={dir} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                                    onClick={(e) => { e.stopPropagation(); paginate(dir); }}
                                    className="p-4 text-white bg-white/[0.06] hover:bg-blue-600 rounded-2xl border border-white/10 pointer-events-auto transition-all duration-200 backdrop-blur-xl"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon} />
                                    </svg>
                                </motion.button>
                            ))}
                        </div>

                        {/* ── Bild ── */}
                        <div className="relative w-full h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter" animate="center" exit="exit"
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.12}
                                    onDragEnd={handleDragEnd}
                                    transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                    className="absolute inset-0 flex items-center justify-center px-4 md:px-24"
                                >
                                    <motion.img
                                        key={currentIndex + '-img'}
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                        src={filteredImages[currentIndex]?.src}
                                        className="max-h-full max-w-full object-contain rounded-2xl md:rounded-[2rem] shadow-2xl select-none"
                                        alt={filteredImages[currentIndex]?.alt}
                                        draggable="false"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* ── Mobile Swipe-Hint ── */}
                        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 md:hidden text-white/25 text-[8px] font-black uppercase tracking-[0.3em] whitespace-nowrap pointer-events-none">
                            {t.gallerySwipeTip || 'Swipe to change'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}