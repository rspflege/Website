import { translations } from '../translations';

export default function Footer({ darkMode, lang }) {
    // Aktuelle Sprache laden (Fallback auf DE)
    const t = translations[lang] || translations.de;

    return (
        <footer className={`py-20 px-6 border-t transition-colors duration-700 ${darkMode ? 'border-white/5 text-white/40 bg-[#050505]' : 'border-black/5 text-black/40 bg-white'
            }`}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

                {/* Logo & Copyright */}
                <div className="flex flex-col items-center md:items-start">
                    <img
                        src="/logo-rs.png"
                        alt="RS"
                        className={`h-10 w-auto grayscale opacity-50 mb-4 hover:opacity-100 transition-opacity duration-500 cursor-pointer ${darkMode ? 'invert' : ''}`}
                    />
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                        © 2026 RS Pflege. {t.rights}
                    </p>
                </div>

                {/* Social & Legal Links */}
                <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
                    <a
                        href="https://instagram.com/deinaccount"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 transition-all hover:-translate-y-1"
                    >
                        Instagram
                    </a>
                    <a
                        href="/impressum"
                        className="hover:text-blue-500 transition-all hover:-translate-y-1"
                    >
                        {t.imprint}
                    </a>
                    <a
                        href="/datenschutz"
                        className="hover:text-blue-500 transition-all hover:-translate-y-1"
                    >
                        {t.privacy}
                    </a>
                </div>
            </div>
        </footer>
    );
}