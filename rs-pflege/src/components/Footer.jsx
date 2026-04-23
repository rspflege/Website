import { translations } from '../translations';
import { shopTranslations } from '../shopTranslations';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Footer({ darkMode, lang }) {
    const navigate = useNavigate();
    const activeT = {
        ...(translations[lang] || translations.de),
        ...(shopTranslations[lang] || shopTranslations.de)
    };
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
            icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 12 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
        }
    ];

    const footerLinks = [
        { label: 'Services', href: '#services' },
        { label: lang === 'de' ? 'Galerie' : 'Gallery', href: '#gallery' },
        { label: 'Kontakt', href: '#kontakt' },
        { label: 'Impressum', href: '/impressum' },
        { label: lang === 'de' ? 'Datenschutz' : 'Privacy', href: '/datenschutz' },
    ];

    const isShop = typeof window !== 'undefined' && window.location.pathname.includes('shop');

    return (
        <footer className={`relative pt-24 pb-12 px-6 border-t overflow-hidden transition-all duration-700 ${darkMode ? 'bg-black border-white/5' : 'bg-[#fafafa] border-black/5'}`}>

            {/* Background glows */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 rounded-full blur-[100px] pointer-events-none ${darkMode ? 'bg-blue-600/6' : 'bg-blue-300/10'}`} />

            <div className="max-w-[1400px] mx-auto flex flex-col items-center relative z-10">

                {/* Big CTA Navigation Button */}
                <motion.button
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={() => navigate(isShop ? '/' : '/shop')}
                    className="group flex flex-col items-center mb-20"
                >
                    <span className={`text-[10px] font-black uppercase tracking-[0.5em] mb-4 transition-all duration-500 group-hover:text-blue-500 ${darkMode ? 'text-white/15 group-hover:text-blue-400' : 'text-black/20'}`}>
                        {isShop ? (activeT.mainHub || 'Zur Startseite') : (lang === 'de' ? 'Zum Shop' : 'To Shop')}
                    </span>
                    <div className={`relative transition-all duration-700 group-hover:scale-[1.02]`}>
                        <span className={`text-5xl md:text-8xl lg:text-9xl font-black italic uppercase tracking-tighter transition-all duration-700 ${darkMode ? 'text-white group-hover:text-blue-500' : 'text-black group-hover:text-blue-600'}`}>
                            RS-PFLEGE
                        </span>
                        <span className="text-blue-600 text-5xl md:text-8xl lg:text-9xl font-black italic uppercase tracking-tighter"> SHOP</span>
                        {/* Underline animation */}
                        <div className="absolute -bottom-2 left-0 h-[3px] w-0 group-hover:w-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-700" />
                    </div>
                </motion.button>

                {/* Value Props Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap justify-center gap-3 mb-16"
                >
                    {[
                        { icon: '✓', text: lang === 'de' ? '100% Handarbeit' : '100% Handcrafted' },
                        { icon: '✓', text: lang === 'de' ? 'Vor-Ort Service' : 'On-location service' },
                        { icon: '✓', text: lang === 'de' ? 'Premium Produkte' : 'Premium products' },
                        { icon: '✓', text: lang === 'de' ? 'Ergebnis garantiert' : 'Result guaranteed' },
                    ].map((v, i) => (
                        <div key={i} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-xl transition-all hover:border-blue-400/40 ${darkMode ? 'bg-white/3 border-white/8 text-white/40 hover:text-white/60' : 'bg-white/60 border-black/6 text-black/40 hover:text-black/60 shadow-sm'}`}>
                            <span className="text-blue-500">{v.icon}</span>
                            {v.text}
                        </div>
                    ))}
                </motion.div>

                {/* Social Media */}
                <div className="flex gap-4 mb-14">
                    {socialLinks.map((social) => (
                        <motion.a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -4, scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-center backdrop-blur-xl ${
                                darkMode
                                    ? 'bg-white/4 border-white/8 text-white/40 hover:border-blue-500/60 hover:text-blue-400 hover:bg-blue-500/8'
                                    : 'bg-white/70 border-black/6 text-black/40 hover:border-blue-400 hover:text-blue-600 shadow-sm hover:shadow-md'
                            }`}
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d={social.icon} />
                            </svg>
                        </motion.a>
                    ))}
                </div>

                {/* Navigation Links */}
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12">
                    {footerLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-200 hover:text-blue-500 ${darkMode ? 'text-white/25' : 'text-black/30'}`}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Divider */}
                <div className={`w-full h-px mb-8 ${darkMode ? 'bg-white/4' : 'bg-black/4'}`} />

                {/* Copyright Row */}
                <div className="flex flex-wrap items-center justify-center gap-6">
                    <span className={`text-[9px] font-bold uppercase tracking-[0.4em] ${darkMode ? 'text-white/12' : 'text-black/15'}`}>
                        © {year} RS PFLEGE
                    </span>
                    <span className={`text-[9px] ${darkMode ? 'text-white/8' : 'text-black/10'}`}>·</span>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.3em] ${darkMode ? 'text-white/12' : 'text-black/15'}`}>
                        ALL RIGHTS RESERVED
                    </span>
                    <span className={`text-[9px] ${darkMode ? 'text-white/8' : 'text-black/10'}`}>·</span>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.3em] ${darkMode ? 'text-white/12' : 'text-black/15'}`}>
                        VÖCKLABRUCK, AUSTRIA
                    </span>
                </div>
            </div>
        </footer>
    );
}