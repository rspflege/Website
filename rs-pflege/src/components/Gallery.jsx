import { useState, useEffect, useCallback, useRef } from 'react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

import imgSuv         from '../assets/bmw-suv.jpg';
import imgSedan       from '../assets/bmw-heck.jpg';
import imgDash        from '../assets/bmw-innen.jpg';
import imgConvertible from '../assets/bmw-cabrio.jpg';

const GALLERY_KEY = 'gallery_extra_images';

export default function Gallery({ darkMode, lang }) {
    const t = translations[lang] || translations.de;
    const fileInputRef = useRef(null);

    // ── State ─────────────────────────────────────────────────────────────────
    const [activeTab,    setActiveTab]    = useState('all');
    const [currentIndex, setCurrentIndex] = useState(null);
    const [direction,    setDirection]    = useState(0);

    // Admin = eingeloggter Supabase-User (keine separates Passwort nötig)
    const [isAdmin,     setIsAdmin]     = useState(false);
    const [uploadToast, setUploadToast] = useState('');
    const [extraImages, setExtraImages] = useState(() => {
        try { return JSON.parse(localStorage.getItem(GALLERY_KEY) || '[]'); }
        catch { return []; }
    });

    // Supabase Session prüfen
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setIsAdmin(!!data.session);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setIsAdmin(!!session);
        });
        return () => subscription.unsubscribe();
    }, []);

    const categories = [
        { id: 'all',      label: t.galleryCatAll || 'Alle' },
        { id: 'exterior', label: t.galleryCatExt || 'Exterieur' },
        { id: 'interior', label: t.galleryCatInt || 'Interieur' },
        { id: 'details',  label: t.galleryCatDet || 'Details' },
    ];

    const baseImages = [
        { src: imgSuv,         alt: 'SUV Premium',   cat: 'exterior', size: 'md:col-span-2 md:row-span-2' },
        { src: imgSedan,       alt: 'Heck-Politur',  cat: 'exterior', size: 'md:col-span-1 md:row-span-1' },
        { src: imgDash,        alt: 'Leder Refresh', cat: 'interior', size: 'md:col-span-1 md:row-span-2' },
        { src: imgConvertible, alt: 'Cabrio Finish',  cat: 'exterior', size: 'md:col-span-2 md:row-span-1' },
        { src: imgDash,        alt: 'Cockpit',       cat: 'interior', size: 'md:col-span-1 md:row-span-1' },
    ];

    const allImages      = [...baseImages, ...extraImages];
    const filteredImages = activeTab === 'all' ? allImages : allImages.filter(i => i.cat === activeTab);

    // ── Lightbox ──────────────────────────────────────────────────────────────
    const openLightbox  = (i) => { setDirection(0); setCurrentIndex(i); };
    const closeLightbox = useCallback(() => setCurrentIndex(null), []);

    const paginate = useCallback((dir) => {
        setDirection(dir);
        setCurrentIndex(prev => (prev + dir + filteredImages.length) % filteredImages.length);
    }, [filteredImages.length]);

    useEffect(() => {
        if (currentIndex === null) return;
        const onKey = (e) => {
            if (e.key === 'Escape')      closeLightbox();
            if (e.key === 'ArrowRight')  paginate(1);
            if (e.key === 'ArrowLeft')   paginate(-1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [currentIndex, closeLightbox, paginate]);

    useEffect(() => {
        if (currentIndex === null) return;
        const timer = setTimeout(() => paginate(1), 8000);
        return () => clearTimeout(timer);
    }, [currentIndex, paginate]);

    const handleDragEnd = (_, { offset, velocity }) => {
        if (Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 300)
            paginate(offset.x > 0 ? -1 : 1);
    };

    const slideVariants = {
        enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit:  (d) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0 }),
    };

    // ── Bild-Upload ───────────────────────────────────────────────────────────
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
        if (!files.length) return;
        let done = 0;
        const newImgs = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                newImgs.push({ src: ev.target.result, alt: file.name.replace(/\.[^.]+$/, ''), cat: 'exterior', size: 'md:col-span-1 md:row-span-1', custom: true });
                if (++done === files.length) {
                    setExtraImages(prev => {
                        const updated = [...prev, ...newImgs];
                        try { localStorage.setItem(GALLERY_KEY, JSON.stringify(updated)); } catch {}
                        return updated;
                    });
                    setUploadToast(`${newImgs.length} Bild${newImgs.length > 1 ? 'er' : ''} hinzugefügt ✓`);
                    setTimeout(() => setUploadToast(''), 3000);
                }
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const deleteImage = (img) => {
        setExtraImages(prev => {
            const updated = prev.filter(i => i !== img);
            try { localStorage.setItem(GALLERY_KEY, JSON.stringify(updated)); } catch {}
            return updated;
        });
        closeLightbox();
    };

    // ── Styles ────────────────────────────────────────────────────────────────
    const cardGlass = darkMode
        ? 'border-white/8 bg-white/3'
        : 'border-white/60 bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]';

    return (
        <section id="gallery" className="py-24 md:py-32 px-4 md:px-6 max-w-7xl mx-auto overflow-hidden">

            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="text-center mb-14"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6 }}
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
                    initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.7 }}
                    className={`text-sm font-medium max-w-md mx-auto leading-relaxed mb-8 ${darkMode ? 'text-white/35' : 'text-black/40'}`}
                >
                    {lang === 'de' ? 'Jedes Bild erzählt eine Geschichte. Klicken Sie auf ein Bild um es zu vergrößern.' : 'Every photo tells a story. Click an image to enlarge it.'}
                </motion.p>

                {/* Filter-Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: 0.25, duration: 0.7 }}
                    className={`inline-flex items-center gap-1 p-1.5 rounded-2xl border backdrop-blur-xl ${
                        darkMode ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-white/60 border-black/[0.06] shadow-md'
                    }`}
                >
                    {categories.map(cat => (
                        <button key={cat.id}
                            onClick={() => { setActiveTab(cat.id); setCurrentIndex(null); }}
                            className={`relative px-4 md:px-7 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
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

            {/* ── Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[280px] gap-3 md:gap-5">
                <AnimatePresence mode="popLayout">
                    {filteredImages.map((image, index) => (
                        <motion.div
                            key={image.alt + activeTab + index}
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
                            <img src={image.src} alt={image.alt}
                                className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-95 transition-all duration-700"
                                style={{ transform: 'scale(1)', transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400">
                                <p className="text-white text-[10px] font-black uppercase tracking-widest">{image.alt}</p>
                                <p className="text-white/50 text-[8px] font-bold uppercase mt-0.5">{lang === 'de' ? 'Klicken zum Vergrößern' : 'Click to enlarge'}</p>
                            </div>
                            <div className="absolute inset-0 ring-0 group-hover:ring-2 group-hover:ring-blue-500/40 rounded-[2rem] md:rounded-[3rem] transition-all duration-300" />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Admin: + Button */}
                {isAdmin && (
                    <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`rounded-[2rem] md:rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                            darkMode ? 'border-blue-500/35 bg-blue-500/5 hover:bg-blue-500/12 hover:border-blue-400/70' : 'border-blue-400/40 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-400'
                        }`}
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.45)]">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-white/40' : 'text-black/35'}`}>
                            {lang === 'de' ? 'Bild hinzufügen' : 'Add image'}
                        </span>
                    </motion.button>
                )}
            </div>

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />

            {/* Upload Toast */}
            <AnimatePresence>
                {uploadToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[3000] px-5 py-3 rounded-full bg-green-500 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-green-500/25 flex items-center gap-2 whitespace-nowrap pointer-events-none"
                    >
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        {uploadToast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════ LIGHTBOX ══════════════ */}
            <AnimatePresence>
                {currentIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="fixed inset-0 z-[2100] bg-black/96 backdrop-blur-3xl flex items-center justify-center"
                        onClick={closeLightbox}
                    >
                        {/* ── Schließen — oben LINKS, damit es nicht hinter dem Hamburger (top-right z-[150]) liegt ── */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ delay: 0.08, type: 'spring', stiffness: 340, damping: 24 }}
                            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                            className="absolute top-4 left-4 z-[2200] w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-red-500/70 border border-white/15 text-white transition-all duration-150 active:scale-90 touch-manipulation"
                            aria-label="Schließen"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                            </svg>
                        </motion.button>

                        {/* Admin: Bild löschen */}
                        {isAdmin && filteredImages[currentIndex]?.custom && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                transition={{ delay: 0.1 }}
                                onClick={(e) => { e.stopPropagation(); deleteImage(filteredImages[currentIndex]); }}
                                className="absolute top-4 left-[68px] z-[2200] w-11 h-11 flex items-center justify-center rounded-full bg-red-500/15 hover:bg-red-500/60 border border-red-500/25 text-red-400 hover:text-white transition-all duration-150 active:scale-90 touch-manipulation"
                                aria-label="Bild löschen"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </motion.button>
                        )}

                        {/* Dots */}
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[2110] flex gap-1.5 max-w-[55vw] overflow-hidden">
                            {filteredImages.map((_, i) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); openLightbox(i); }}
                                    className={`h-1.5 rounded-full flex-shrink-0 transition-all duration-300 touch-manipulation ${i === currentIndex ? 'w-7 bg-blue-500' : 'w-2 bg-white/25 hover:bg-white/50'}`}
                                />
                            ))}
                        </div>

                        {/* Bildtitel */}
                        <motion.p
                            key={currentIndex + '-t'}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[2110] text-white/45 text-[10px] font-black uppercase tracking-[0.3em] pointer-events-none whitespace-nowrap"
                        >
                            {filteredImages[currentIndex]?.alt}
                        </motion.p>

                        {/* Desktop Pfeile */}
                        <div className="absolute inset-x-4 md:inset-x-6 top-1/2 -translate-y-1/2 hidden md:flex justify-between z-[2110] pointer-events-none">
                            {[{ dir: -1, d: 'M15 19l-7-7 7-7' }, { dir: 1, d: 'M9 5l7 7-7 7' }].map(({ dir, d }) => (
                                <motion.button key={dir} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                                    onClick={(e) => { e.stopPropagation(); paginate(dir); }}
                                    className="p-4 text-white bg-white/[0.06] hover:bg-blue-600 rounded-2xl border border-white/10 pointer-events-auto transition-all duration-200 backdrop-blur-xl"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={d} />
                                    </svg>
                                </motion.button>
                            ))}
                        </div>

                        {/* Bild */}
                        <div className="relative w-full h-[80vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
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
                                        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                                        src={filteredImages[currentIndex]?.src}
                                        className="max-h-full max-w-full object-contain rounded-2xl md:rounded-[2rem] shadow-2xl select-none"
                                        alt={filteredImages[currentIndex]?.alt}
                                        draggable="false"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Mobile swipe hint */}
                        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 md:hidden text-white/20 text-[7px] font-black uppercase tracking-[0.3em] whitespace-nowrap pointer-events-none">
                            {t.gallerySwipeTip || 'Swipe ← →'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}