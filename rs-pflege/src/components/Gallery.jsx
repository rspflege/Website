import { useState, useEffect, useCallback, useRef } from 'react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

import imgSuv         from '../assets/bmw-suv.jpg';
import imgSedan       from '../assets/bmw-heck.jpg';
import imgDash        from '../assets/bmw-innen.jpg';
import imgConvertible from '../assets/bmw-cabrio.jpg';

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE SETUP (einmalig in Supabase Dashboard):
//   1. Storage → New bucket → Name: "gallery" → Public: AN
//   2. Storage → Policies → "gallery" bucket → New policy:
//      INSERT: authenticated  |  SELECT: public  |  DELETE: authenticated
// ─────────────────────────────────────────────────────────────────────────────
const BUCKET = 'gallery';
const DB_TABLE = 'gallery_images'; // optional — wenn du eine DB-Tabelle nutzt

// ── Upload & Kategorie Modal ──────────────────────────────────────────────────
function UploadPicker({ files, darkMode, lang, onConfirm, onCancel }) {
    const [assignments, setAssignments] = useState(
        () => files.map(f => ({
            file: f,
            cat: 'exterior',
            label: f.name.replace(/\.[^.]+$/, ''), // Dateiname als Standardname
            preview: URL.createObjectURL(f),
        }))
    );

    useEffect(() => {
        return () => assignments.forEach(a => URL.revokeObjectURL(a.preview));
    }, []); // eslint-disable-line

    const cats = [
        { id: 'exterior', label: lang === 'de' ? 'Exterieur' : 'Exterior' },
        { id: 'interior', label: lang === 'de' ? 'Interieur' : 'Interior' },
        { id: 'details',  label: 'Details' },
    ];

    const update = (i, patch) =>
        setAssignments(prev => prev.map((a, idx) => idx === i ? { ...a, ...patch } : a));

    const inputBase = `w-full px-4 py-2.5 rounded-xl border outline-none text-[12px] font-medium transition-all ${
        darkMode
            ? 'bg-white/[0.06] border-white/10 text-white placeholder:text-white/25 focus:border-blue-500/60'
            : 'bg-black/[0.04] border-black/8 text-black placeholder:text-black/25 focus:border-blue-400'
    }`;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3100] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
                transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                onClick={e => e.stopPropagation()}
                className={`w-full max-w-lg rounded-[2.5rem] p-7 border shadow-2xl ${
                    darkMode ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-white border-black/8 text-black'
                }`}
            >
                <h3 className={`text-[11px] font-black uppercase tracking-[0.25em] mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {lang === 'de' ? 'Bilder benennen & einordnen' : 'Name & categorize images'}
                </h3>
                <p className={`text-[10px] mb-6 ${darkMode ? 'text-white/30' : 'text-black/35'}`}>
                    {lang === 'de' ? 'z.B. "BMW F30 Exterieur Politur"' : 'e.g. "BMW F30 Exterior Polish"'}
                </p>

                <div className="space-y-5 max-h-[52vh] overflow-y-auto pr-1">
                    {assignments.map((a, i) => (
                        <div key={i} className={`p-4 rounded-2xl border space-y-3 ${darkMode ? 'border-white/8 bg-white/[0.03]' : 'border-black/6 bg-black/[0.02]'}`}>
                            <div className="flex items-center gap-3">
                                <img src={a.preview} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[9px] font-bold truncate mb-1.5 ${darkMode ? 'text-white/30' : 'text-black/30'}`}>{a.file.name}</p>
                                    {/* Bildname */}
                                    <input
                                        type="text"
                                        value={a.label}
                                        onChange={e => update(i, { label: e.target.value })}
                                        placeholder={lang === 'de' ? 'z.B. BMW F30 Vollpolitur' : 'e.g. BMW F30 Full Polish'}
                                        className={inputBase}
                                    />
                                </div>
                            </div>
                            {/* Kategorie */}
                            <div className="flex gap-2 flex-wrap">
                                {cats.map(c => (
                                    <button key={c.id} type="button" onClick={() => update(i, { cat: c.id })}
                                        className={`px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                                            a.cat === c.id
                                                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.35)]'
                                                : darkMode ? 'bg-white/8 text-white/40 hover:bg-white/15' : 'bg-black/6 text-black/40 hover:bg-black/10'
                                        }`}>
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 mt-6">
                    <button type="button" onClick={onCancel}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                            darkMode ? 'border-white/12 text-white/40 hover:border-white/25' : 'border-black/10 text-black/40 hover:border-black/20'
                        }`}>
                        {lang === 'de' ? 'Abbrechen' : 'Cancel'}
                    </button>
                    <button type="button" onClick={() => onConfirm(assignments)}
                        className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-600/25">
                        {lang === 'de' ? 'Hochladen' : 'Upload'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Gallery ───────────────────────────────────────────────────────────────────
export default function Gallery({ darkMode, lang }) {
    const t = translations[lang] || translations.de;
    const fileInputRef = useRef(null);

    const [activeTab,    setActiveTab]    = useState('all');
    const [currentIndex, setCurrentIndex] = useState(null);
    const [direction,    setDirection]    = useState(0);

    const [isAdmin,       setIsAdmin]       = useState(false);
    const [uploadToast,   setUploadToast]   = useState('');
    const [uploading,     setUploading]     = useState(false);
    const [pendingFiles,  setPendingFiles]  = useState(null);
    const [cloudImages,   setCloudImages]   = useState([]);   // aus Supabase Storage
    const [loadingImages, setLoadingImages] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // img to confirm-delete

    // Supabase Auth
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setIsAdmin(!!data.session));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setIsAdmin(!!s));
        return () => subscription.unsubscribe();
    }, []);

    // ── Bilder aus Supabase Storage laden ────────────────────────────────────
    const loadCloudImages = useCallback(async () => {
        setLoadingImages(true);
        try {
            const { data, error } = await supabase.storage.from(BUCKET).list('', {
                limit: 200,
                sortBy: { column: 'created_at', order: 'desc' },
            });
            if (error) throw error;

            const imgs = (data || [])
                .filter(f => f.name !== '.emptyFolderPlaceholder')
                .map(f => {
                    // Dateiname-Format: "cat__label__timestamp.ext"
                    // z.B. "exterior__BMW F30 Politur__1714500000000.jpg"
                    const parts = f.name.split('__');
                    const cat   = parts[0] || 'exterior';
                    const label = parts[1]
                        ? decodeURIComponent(parts[1])
                        : f.name.replace(/\.[^.]+$/, '');
                    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
                    return {
                        src:    urlData.publicUrl,
                        alt:    label,
                        cat,
                        size:   'md:col-span-1 md:row-span-1',
                        custom: true,
                        fileName: f.name,
                    };
                });
            setCloudImages(imgs);
        } catch (err) {
            console.error('Gallery load error:', err);
        } finally {
            setLoadingImages(false);
        }
    }, []);

    useEffect(() => { loadCloudImages(); }, [loadCloudImages]);

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

    const allImages      = [...baseImages, ...cloudImages];
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
            if (e.key === 'Escape')     closeLightbox();
            if (e.key === 'ArrowRight') paginate(1);
            if (e.key === 'ArrowLeft')  paginate(-1);
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

    // ── Upload zu Supabase Storage ────────────────────────────────────────────
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
        if (!files.length) return;
        setPendingFiles(files);
        e.target.value = '';
    };

    const handleUploadConfirm = async (assignments) => {
        setPendingFiles(null);
        setUploading(true);
        let success = 0;
        let lastError = null;

        for (const a of assignments) {
            try {
                const ext = a.file.name.split('.').pop().toLowerCase();
                // Sonderzeichen entfernen, Leerzeichen durch Unterstriche ersetzen
                const safeName = (a.label.trim() || a.file.name.replace(/\.[^.]+$/, ''))
                    .replace(/[^a-zA-Z0-9äöüÄÖÜß\-_ ]/g, '')
                    .replace(/\s+/g, '_')
                    .substring(0, 80);
                // Format: "cat__label__timestamp.ext"
                const fileName = `${a.cat}__${safeName}__${Date.now()}.${ext}`;

                const { error } = await supabase.storage
                    .from(BUCKET)
                    .upload(fileName, a.file, { contentType: a.file.type, upsert: true });

                if (!error) {
                    success++;
                } else {
                    lastError = error;
                    console.error('Upload error:', error.message, error);
                }
            } catch (err) {
                lastError = err;
                console.error('Upload failed:', err);
            }
        }

        setUploading(false);

        if (success > 0) {
            setUploadToast(`${success} Bild${success > 1 ? 'er' : ''} hochgeladen ✓`);
            setTimeout(() => setUploadToast(''), 3500);
            await loadCloudImages(); // Neu laden aus Supabase

            // Tab zur passenden Kategorie
            const uniqueCats = [...new Set(assignments.map(a => a.cat))];
            setActiveTab(uniqueCats.length === 1 ? uniqueCats[0] : 'all');
        } else {
            const msg = lastError?.message || 'Unbekannter Fehler';
            setUploadToast(`Upload fehlgeschlagen: ${msg} ✕`);
            setTimeout(() => setUploadToast(''), 5000);
        }
    };

    // ── Bild löschen ──────────────────────────────────────────────────────────
    const deleteImage = (img) => {
        if (!img.fileName) return;
        // Erst Bestätigung anfordern, Lightbox bleibt offen
        setDeleteConfirm(img);
    };

    const confirmDelete = async () => {
        const img = deleteConfirm;
        setDeleteConfirm(null);
        closeLightbox();
        const { error } = await supabase.storage.from(BUCKET).remove([img.fileName]);
        if (!error) {
            setCloudImages(prev => prev.filter(i => i.fileName !== img.fileName));
            setUploadToast(lang === 'de' ? 'Bild gelöscht ✓' : 'Image deleted ✓');
            setTimeout(() => setUploadToast(''), 2500);
        } else {
            setUploadToast(`Löschen fehlgeschlagen: ${error.message} ✕`);
            setTimeout(() => setUploadToast(''), 4000);
        }
    };

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
                    {lang === 'de'
                        ? 'Jedes Bild erzählt eine Geschichte. Klicken Sie auf ein Bild um es zu vergrößern.'
                        : 'Every photo tells a story. Click an image to enlarge it.'}
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
                                <motion.div layoutId="galleryTab"
                                    className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />
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
                            key={(image.fileName || image.alt) + index}
                            layout
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -10 }}
                            transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.4), ease: [0.16, 1, 0.3, 1] }}
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
                            {image.custom && (
                                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-blue-600/80 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-widest">
                                    {categories.find(c => c.id === image.cat)?.label || image.cat}
                                </div>
                            )}
                            <div className="absolute inset-0 ring-0 group-hover:ring-2 group-hover:ring-blue-500/40 rounded-[2rem] md:rounded-[3rem] transition-all duration-300" />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Lade-Skeleton */}
                {loadingImages && Array.from({ length: 3 }).map((_, i) => (
                    <div key={`skel-${i}`}
                        className={`rounded-[2rem] md:rounded-[3rem] animate-pulse ${darkMode ? 'bg-white/[0.04]' : 'bg-black/[0.04]'}`} />
                ))}

                {/* Admin: Upload-Button */}
                {isAdmin && (
                    <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className={`rounded-[2rem] md:rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                            uploading
                                ? 'opacity-60 cursor-wait border-blue-500/20'
                                : darkMode
                                    ? 'border-blue-500/35 bg-blue-500/5 hover:bg-blue-500/12 hover:border-blue-400/70'
                                    : 'border-blue-400/40 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-400'
                        }`}
                    >
                        {uploading ? (
                            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.45)]">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                        )}
                        <span className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-white/40' : 'text-black/35'}`}>
                            {uploading
                                ? (lang === 'de' ? 'Lädt hoch...' : 'Uploading...')
                                : (lang === 'de' ? 'Bild hinzufügen' : 'Add image')}
                        </span>
                    </motion.button>
                )}
            </div>

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />

            {/* Upload-Picker Modal */}
            <AnimatePresence>
                {pendingFiles && (
                    <UploadPicker
                        files={pendingFiles}
                        darkMode={darkMode}
                        lang={lang}
                        onConfirm={handleUploadConfirm}
                        onCancel={() => setPendingFiles(null)}
                    />
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {uploadToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.9 }}
                        className={`fixed bottom-[88px] left-4 right-4 mx-auto max-w-sm z-[3000] px-5 py-3.5 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest shadow-xl flex items-start gap-3 pointer-events-none ${
                            uploadToast.includes('✕') ? 'bg-red-500 shadow-red-500/30' : 'bg-green-500 shadow-green-500/30'
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-white animate-ping flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed break-all">{uploadToast}</span>
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
                        {/* Dots */}
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[2110] flex gap-1.5 max-w-[60vw] overflow-hidden">
                            {filteredImages.map((_, i) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); openLightbox(i); }}
                                    className={`h-1.5 rounded-full flex-shrink-0 transition-all duration-300 touch-manipulation ${
                                        i === currentIndex ? 'w-7 bg-blue-500' : 'w-2 bg-white/25 hover:bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Admin: Löschen */}
                        {isAdmin && filteredImages[currentIndex]?.custom && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                transition={{ delay: 0.1 }}
                                onClick={(e) => { e.stopPropagation(); deleteImage(filteredImages[currentIndex]); }}
                                className="absolute top-4 left-4 z-[2200] w-11 h-11 flex items-center justify-center rounded-full bg-red-500/15 hover:bg-red-500/60 border border-red-500/25 text-red-400 hover:text-white transition-all duration-150 active:scale-90 touch-manipulation"
                                aria-label="Bild löschen"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </motion.button>
                        )}

                        {/* Bildtitel */}
                        <motion.p
                            key={currentIndex + '-t'}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 }}
                            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[2110] text-white/50 text-[11px] font-black uppercase tracking-[0.3em] pointer-events-none whitespace-nowrap"
                        >
                            {filteredImages[currentIndex]?.alt}
                        </motion.p>

                        {/* Schließen-Button — unten mittig */}
                        <motion.button
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 26 }}
                            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[2200] flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-red-500/60 border border-white/15 text-white text-[10px] font-black uppercase tracking-widest transition-all duration-150 active:scale-95 touch-manipulation backdrop-blur-xl"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                            </svg>
                            {lang === 'de' ? 'Schließen' : 'Close'}
                        </motion.button>

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

                        <p className="absolute top-5 right-5 hidden md:block text-white/15 text-[9px] font-black uppercase tracking-[0.25em] pointer-events-none">
                            {lang === 'de' ? 'Außerhalb klicken zum Schließen' : 'Click outside to close'}
                        </p>
                        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 md:hidden text-white/15 text-[7px] font-black uppercase tracking-[0.3em] whitespace-nowrap pointer-events-none">
                            {t.gallerySwipeTip || 'Swipe ← →'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* ══════════════ LÖSCHEN BESTÄTIGEN ══════════════ */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[3200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }}
                            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                            onClick={e => e.stopPropagation()}
                            className={`w-full max-w-sm rounded-[2rem] p-7 border shadow-2xl ${
                                darkMode ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-white border-black/8 text-black'
                            }`}
                        >
                            <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mb-5 mx-auto">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-red-400">
                                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className={`text-[13px] font-black uppercase tracking-wider text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                                {lang === 'de' ? 'Bild löschen?' : 'Delete image?'}
                            </h3>
                            <p className={`text-[10px] text-center mb-6 ${darkMode ? 'text-white/35' : 'text-black/40'}`}>
                                <span className="font-bold">{deleteConfirm.alt}</span>
                                <br />
                                {lang === 'de' ? 'Diese Aktion kann nicht rückgängig gemacht werden.' : 'This action cannot be undone.'}
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)}
                                    className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                        darkMode ? 'border-white/12 text-white/40 hover:border-white/25' : 'border-black/10 text-black/40 hover:border-black/20'
                                    }`}>
                                    {lang === 'de' ? 'Abbrechen' : 'Cancel'}
                                </button>
                                <button onClick={confirmDelete}
                                    className="flex-1 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-red-600/25">
                                    {lang === 'de' ? 'Löschen' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </section>
    );
}