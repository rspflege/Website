import { useState, useEffect } from 'react';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';

// Imports deiner Bilder
import imgSuv from '../assets/bmw-suv.jpg';
import imgSedan from '../assets/bmw-heck.jpg';
import imgDash from '../assets/bmw-innen.jpg';
import imgConvertible from '../assets/bmw-cabrio.jpg';

export default function Gallery({ darkMode, lang }) {
    const t = translations[lang] || translations.de;
    const [showAll, setShowAll] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(null); // Speichert nur den Index

    const allImages = [
        { src: imgSuv, alt: "SUV Front Premium", size: "md:col-span-2 md:row-span-2" },
        { src: imgSedan, alt: "Heck-Politur", size: "md:col-span-1 md:row-span-1" },
        { src: imgDash, alt: "Interieur Detail", size: "md:col-span-1 md:row-span-1" },
        { src: imgConvertible, alt: "Cabrio Finish", size: "md:col-span-2 md:row-span-1" },
        { src: imgSuv, alt: "Keramik Versiegelung", size: "md:col-span-1 md:row-span-1" },
        { src: imgSedan, alt: "Exzellenter Glanz", size: "md:col-span-1 md:row-span-2" },
        { src: imgDash, alt: "Lederpflege", size: "md:col-span-2 md:row-span-1" },
        { src: imgConvertible, alt: "Showroom Ready", size: "md:col-span-1 md:row-span-1" },
    ];

    const visibleImages = showAll ? allImages : allImages.slice(0, 4);

    // Navigation Funktionen
    const nextImage = (e) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = (e) => {
        if (e) e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    // ESC Taste zum Schließen
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') setCurrentIndex(null); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <section id="gallery" className="py-32 px-6 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-16">
                <h2 className={`text-5xl md:text-7xl font-black italic uppercase mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
                    {t.galleryTitle || "Unsere"} <span className="text-blue-500">{t.gallerySub || "Projekte"}</span>
                </h2>
                <p className={`text-[10px] uppercase tracking-[0.4em] font-bold ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                    Exzellenz in jedem Detail
                </p>
            </motion.div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[250px] gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                    {visibleImages.map((image, index) => (
                        <motion.div
                            key={index}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={() => setCurrentIndex(index)}
                            className={`${image.size} rounded-[2rem] overflow-hidden relative group cursor-pointer border ${darkMode ? 'border-white/5' : 'border-black/5'} shadow-2xl`}
                        >
                            <img src={image.src} alt={image.alt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 antialiased" />
                            <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Toggle Button (Mehr / Weniger) */}
            <div className="mt-16 flex justify-center">
                <button
                    onClick={() => setShowAll(!showAll)}
                    className={`px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all duration-300 border-2 ${darkMode ? 'border-white text-white hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white'
                        }`}
                >
                    {showAll
                        ? (lang === 'en' ? 'Show Less' : 'Weniger anzeigen')
                        : (lang === 'en' ? 'Show More' : 'Alle Projekte')
                    }
                </button>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {currentIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10"
                        onClick={() => setCurrentIndex(null)}
                    >
                        {/* Close Button */}
                        <button className="absolute top-8 right-8 text-white/50 hover:text-white z-[1100]">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {/* Navigation Buttons */}
                        <button onClick={prevImage} className="absolute left-6 p-4 text-white/30 hover:text-blue-500 z-[1100] transition-all">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={nextImage} className="absolute right-6 p-4 text-white/30 hover:text-blue-500 z-[1100] transition-all">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                        </button>

                        {/* Bild mit Slide-Effekt */}
                        <div className="relative w-full max-w-5xl h-[80vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentIndex}
                                    src={allImages[currentIndex].src}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                    className="max-h-full max-w-full object-contain rounded-3xl shadow-2xl"
                                />
                            </AnimatePresence>

                            {/* Info unterm Bild */}
                            <motion.div
                                key={`text-${currentIndex}`}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="mt-8 text-center"
                            >
                                <span className="text-blue-500 font-bold tracking-[0.4em] text-[10px] uppercase block mb-2">
                                    Projekt {currentIndex + 1} / {allImages.length}
                                </span>
                                <h3 className="text-white text-2xl font-black italic uppercase tracking-tighter">
                                    {allImages[currentIndex].alt}
                                </h3>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}