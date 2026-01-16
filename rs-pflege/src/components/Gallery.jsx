import { useState, useEffect } from 'react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';

// Deine Bilder (Beispielhaft erweitert)
import imgSuv from '../assets/bmw-suv.jpg';
import imgSedan from '../assets/bmw-heck.jpg';
import imgDash from '../assets/bmw-innen.jpg';
import imgConvertible from '../assets/bmw-cabrio.jpg';

export default function Gallery({ darkMode, lang }) {
    const t = translations[lang] || translations.de;

    // State für "Mehr laden" und Lightbox
    const [showAll, setShowAll] = useState(false);
    const [selectedImg, setSelectedImg] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Deine komplette Bilddatenbank
    const allImages = [
        { src: imgSuv, alt: "SUV Front Premium", size: "md:col-span-2 md:row-span-2" },
        { src: imgSedan, alt: "Heck-Politur", size: "md:col-span-1 md:row-span-1" },
        { src: imgDash, alt: "Interieur Detail", size: "md:col-span-1 md:row-span-1" },
        { src: imgConvertible, alt: "Cabrio Finish", size: "md:col-span-2 md:row-span-1" },
        // Diese Bilder werden erst nach Klick auf "Mehr" angezeigt
        { src: imgSuv, alt: "Keramik Versiegelung", size: "md:col-span-1 md:row-span-1" },
        { src: imgSedan, alt: "Exzellenter Glanz", size: "md:col-span-1 md:row-span-2" },
        { src: imgDash, alt: "Lederpflege", size: "md:col-span-2 md:row-span-1" },
        { src: imgConvertible, alt: "Showroom Ready", size: "md:col-span-1 md:row-span-1" },
    ];

    // Nur die ersten 4 für die Initialansicht
    const visibleImages = showAll ? allImages : allImages.slice(0, 4);

    const openLightbox = (index) => {
        setCurrentIndex(index);
        setSelectedImg(allImages[index]);
    };

    const nextImage = (e) => {
        e.stopPropagation();
        const nextIdx = (currentIndex + 1) % allImages.length;
        setCurrentIndex(nextIdx);
        setSelectedImg(allImages[nextIdx]);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        const prevIdx = (currentIndex - 1 + allImages.length) % allImages.length;
        setCurrentIndex(prevIdx);
        setSelectedImg(allImages[prevIdx]);
    };

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') setSelectedImg(null); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <section id="gallery" className="py-32 px-6 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <h2 className={`text-5xl md:text-7xl font-black italic uppercase mb-6 tracking-tighter ${darkMode ? 'text-white' : 'text-black'}`}>
                    {t.galleryTitle || "Unsere"} <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{t.gallerySub || "Projekte"}</span>
                </h2>
                <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
            </motion.div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[250px] gap-4 md:gap-6">
                <AnimatePresence>
                    {visibleImages.map((image, index) => (
                        <motion.div
                            key={index}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            onClick={() => openLightbox(index)}
                            className={`${image.size} rounded-[2rem] overflow-hidden relative group cursor-pointer shadow-2xl border ${darkMode ? 'border-white/5' : 'border-black/5'}`}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105 antialiased"
                                style={{ imageRendering: 'auto' }}
                            />
                            {/* Overlay Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                                <p className="text-white text-xs font-black uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    {image.alt}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Mehr Anzeigen Button */}
            {!showAll && (
                <div className="mt-16 flex justify-center">
                    <button
                        onClick={() => setShowAll(true)}
                        className={`group relative px-12 py-5 rounded-full overflow-hidden transition-all duration-500 ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
                    >
                        <span className="relative z-10 font-black uppercase tracking-[0.2em] text-xs">
                            {lang === 'en' ? 'View More Projects' : 'Mehr Projekte ansehen'}
                        </span>
                        <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    </button>
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-4"
                    >
                        {/* Schließen */}
                        <button
                            onClick={() => setSelectedImg(null)}
                            className="absolute top-6 right-6 p-4 text-white/50 hover:text-white transition-all z-[1010]"
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {/* Navigation */}
                        <button onClick={prevImage} className="absolute left-4 p-6 text-white/20 hover:text-blue-500 transition-all hidden md:block">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={nextImage} className="absolute right-4 p-6 text-white/20 hover:text-blue-500 transition-all hidden md:block">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                        </button>

                        {/* Bild Container */}
                        <div className="relative max-w-6xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                            <motion.img
                                key={selectedImg.src}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={selectedImg.src}
                                alt={selectedImg.alt}
                                className="max-h-[75vh] w-auto rounded-[1.5rem] shadow-[0_0_50px_rgba(59,130,246,0.2)] object-contain"
                            />

                            {/* Bild Info & Counter */}
                            <div className="mt-8 text-center">
                                <h4 className="text-white font-black uppercase italic tracking-widest text-lg">
                                    {selectedImg.alt}
                                </h4>
                                <div className="flex items-center justify-center gap-4 mt-2">
                                    <div className="h-[1px] w-8 bg-blue-600"></div>
                                    <span className="text-blue-500 font-bold text-xs tracking-[0.3em]">
                                        {currentIndex + 1} / {allImages.length}
                                    </span>
                                    <div className="h-[1px] w-8 bg-blue-600"></div>
                                </div>
                            </div>

                            {/* Mobile Controls */}
                            <div className="flex gap-10 mt-8 md:hidden">
                                <button onClick={prevImage} className="text-white/50 p-4">Prev</button>
                                <button onClick={nextImage} className="text-white/50 p-4">Next</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}