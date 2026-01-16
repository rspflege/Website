import { translations } from '../translations';
import { motion } from 'framer-motion';

export default function Footer({ darkMode, lang }) {
    const t = translations[lang] || translations.de;
    const year = new Date().getFullYear();

    const socialLinks = [
        {
            name: "Instagram",
            url: "https://instagram.com/dein-profil",
            icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
        },
        {
            name: "TikTok",
            url: "https://tiktok.com/@dein-profil",
            icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.31-.75.42-1.24 1.25-1.33 2.1-.1.7.07 1.42.44 2.01.45.83 1.28 1.43 2.2 1.61.83.1 1.68-.02 2.4-.46.74-.47 1.22-1.29 1.27-2.16.02-3.69.02-7.38.03-11.07z"
        },
        {
            name: "YouTube",
            url: "https://youtube.com/dein-kanal",
            icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
        }
    ];

    return (
        <footer className={`py-20 px-6 border-t transition-all duration-700 ${darkMode ? 'bg-black border-white/5' : 'bg-white border-black/5'}`}>
            <div className="max-w-7xl mx-auto flex flex-col items-center">

                {/* Logo / Name */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mb-12 text-center"
                >
                    <h3 className={`text-2xl font-black uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-black'}`}>
                        RS <span className="text-blue-600">PFLEGE</span>
                    </h3>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.5em] mt-2 ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                        Detailing Excellence
                    </p>
                </motion.div>

                {/* Social Media Icons */}
                <div className="flex gap-8 mb-16">
                    {socialLinks.map((social) => (
                        <motion.a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -5, scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-center
                                ${darkMode
                                    ? 'bg-white/5 border-white/10 text-white hover:border-blue-500 hover:text-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                                    : 'bg-black/5 border-black/5 text-black hover:border-blue-600 hover:text-blue-600'
                                }`}
                        >
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d={social.icon} />
                            </svg>
                        </motion.a>
                    ))}
                </div>

                {/* Navigation Links (Quick Links) */}
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-16 text-[10px] font-black uppercase tracking-widest">
                    <a href="#services" className={`hover:text-blue-500 transition-colors ${darkMode ? 'text-white/50' : 'text-black/50'}`}>Services</a>
                    <a href="#gallery" className={`hover:text-blue-500 transition-colors ${darkMode ? 'text-white/50' : 'text-black/50'}`}>Galerie</a>
                    <a href="#kontakt" className={`hover:text-blue-500 transition-colors ${darkMode ? 'text-white/50' : 'text-black/50'}`}>Kontakt</a>
                    <a href="/impressum" className={`hover:text-blue-500 transition-colors ${darkMode ? 'text-white/50' : 'text-black/50'}`}>Impressum</a>
                </div>

                {/* Copyright */}
                <div className={`text-[9px] font-bold uppercase tracking-widest ${darkMode ? 'text-white/20' : 'text-black/20'}`}>
                    © {year} RS PFLEGE — ALL RIGHTS RESERVED.
                </div>
            </div>
        </footer>
    );
}