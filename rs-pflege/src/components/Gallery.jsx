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
    const [selectedImg, setSelectedImg] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const galleryImages = [
        { src: imgSuv, alt: "SUV Front", size: "md:col-span-2 md:row-span-2" },
        { src: imgSedan, alt: "Sedan Rear", size: "md:col-span-1 md:row-span-1" },
        { src: imgDash, alt: "Interior", size: "md:col-span-1 md:row-span-1" },
        { src: imgConvertible, alt: "Convertible", size: "md:col-span-2 md:row-span-1" },
        { src: imgSuv, alt: "Projekt Detail", size: "md:col-span-1 md:row-span-1" },
        { src: imgSedan, alt: "Glanz Ansicht", size: "md:col-span-1 md:row-span-2" },
        { src: imgDash, alt: "Cockpit Pflege", size: "md:col-span-2 md:row-span-1" },
        { src: imgConvertible, alt: "Finish", size: "md:col-span-1 md:row-span-1" },
    ];

    // Funktionen für die Lightbox
    const openLightbox = (index) => {
        setCurrentIndex(index);
        setSelectedImg(galleryImages[index]);
    };

    const nextImage = (e) => {
        e.stopPropagation();
        const nextIdx = (currentIndex + 1) % galleryImages.length;
        setCurrentIndex(nextIdx);
        setSelectedImg(galleryImages[nextIdx]);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        const prevIdx = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        setCurrentIndex(prevIdx);
        setSelectedImg(galleryImages[prevIdx]);
    };

    // Schließen bei ESC-Taste
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
                className="text-center mb-20"
            >
                <h2 className={`text-5xl md:text-7xl font-black italic uppercase mb-6 tracking-tighter ${darkMode ? 'text-white' : 'text-black'}`}>
                    {t.galleryTitle} <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{t.gallerySub}</span>
                </h2>
                <p className={`${darkMode ? 'text-white/40' : 'text-black/40'} font-bold uppercase tracking-[0.3em] text-[10px]`}>
                    Klicken Sie auf ein Bild für die Detailansicht
                </p>
            </motion.div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[250px] gap-4 md:gap-6">
                {galleryImages.map((image, index) => (
                    <motion.div
                        key={index}
                        layoutId={`img-${index}`}
                        onClick={() => openLightbox(index)}
                        className={`${image.size} rounded-[2.5rem] overflow-hidden relative group cursor-pointer shadow-2xl transition-all duration-700`}
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-center justify-center">
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImg(null)}
                        className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
                    >
                        {/* Schließen Button */}
                        <button className="absolute top-8 right-8 text-white/50 hover:text-white z-[1010] transition-colors">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {/* Navigation Pfeile */}
                        <button onClick={prevImage} className="absolute left-4 md:left-8 p-4 text-white/30 hover:text-blue-500 transition-all">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={nextImage} className="absolute right-4 md:right-8 p-4 text-white/30 hover:text-blue-500 transition-all">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                        </button>

                        {/* Großes Bild */}
                        <motion.div
                            layoutId={`img-${currentIndex}`}
                            className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center"
                        >
                            <img
                                src={selectedImg.src}
                                alt={selectedImg.alt}
                                className="max-h-[80vh] w-auto rounded-[2rem] shadow-2xl border border-white/10 object-contain"
                            />
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-white mt-8 font-black uppercase italic tracking-[0.3em] text-sm"
                            >
                                {selectedImg.alt} <span className="text-blue-500 ml-4">{currentIndex + 1} / {galleryImages.length}</span>
                            </motion.p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}