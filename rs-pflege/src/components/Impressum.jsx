import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Impressum({ darkMode, lang }) {
    const navigate = useNavigate();
    const isDE = lang !== 'en';

    const Section = ({ title, children }) => (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`p-8 rounded-[2.5rem] border backdrop-blur-xl ${
                darkMode
                    ? 'bg-white/[0.03] border-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
                    : 'bg-white/70 border-black/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.05)]'
            }`}
        >
            <h2 className={`text-[11px] font-black uppercase tracking-[0.25em] mb-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {title}
            </h2>
            <div className={`space-y-2 text-[13px] font-medium leading-relaxed ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                {children}
            </div>
        </motion.div>
    );

    return (
        <div className={`min-h-screen transition-colors duration-700 ${darkMode ? 'bg-[#050505] text-white' : 'bg-[#f5f5f7] text-black'}`}>
            {/* Background glow */}
            <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[150px] pointer-events-none ${darkMode ? 'bg-blue-600/[0.05]' : 'bg-blue-300/[0.12]'}`} />

            <div className="max-w-2xl mx-auto px-6 py-24 relative z-10">

                {/* Back button */}
                <motion.button
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => navigate(-1)}
                    className={`flex items-center gap-2 mb-14 text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${darkMode ? 'text-white/25 hover:text-white/60' : 'text-black/25 hover:text-black/60'}`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                    {isDE ? 'Zurück' : 'Back'}
                </motion.button>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-14"
                >
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {isDE ? 'Rechtliche Angaben' : 'Legal Notice'}
                    </p>
                    <h1 className={`text-5xl md:text-6xl font-black uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-black'}`}>
                        {isDE ? 'Impressum' : 'Imprint'}
                    </h1>
                </motion.div>

                <div className="space-y-5">

                    <Section title={isDE ? 'Angaben gemäß § 5 ECG' : 'Information according to § 5 ECG'}>
                        <p className="font-bold text-sm">RS Pflege</p>
                        <p>Endrit Spahiu &amp; Sead Rekić</p>
                        <p className={`text-[11px] uppercase tracking-widest font-bold mt-3 ${darkMode ? 'text-white/25' : 'text-black/30'}`}>
                            {isDE ? 'Österreich' : 'Austria'}
                        </p>
                    </Section>

                    <Section title={isDE ? 'Kontakt' : 'Contact'}>
                        <p>
                            {isDE ? 'E-Mail: ' : 'Email: '}
                            <a
                                href="mailto:rspflege.office@gmail.com"
                                className={`font-bold underline underline-offset-2 transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                            >
                                rspflege.office@gmail.com
                            </a>
                        </p>
                    </Section>

                    <Section title={isDE ? 'Unternehmensgegenstand' : 'Business Purpose'}>
                        <p>
                            {isDE
                                ? 'Professionelle Fahrzeugpflege und Detailing-Dienstleistungen.'
                                : 'Professional vehicle care and detailing services.'}
                        </p>
                    </Section>

                    <Section title={isDE ? 'Haftung für Inhalte' : 'Liability for Content'}>
                        <p>
                            {isDE
                                ? 'Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.'
                                : 'The contents of our pages have been created with the utmost care. However, we cannot guarantee the accuracy, completeness, or timeliness of the content.'}
                        </p>
                    </Section>

                    <Section title={isDE ? 'Haftung für Links' : 'Liability for Links'}>
                        <p>
                            {isDE
                                ? 'Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.'
                                : 'Our offer contains links to external third-party websites whose content we have no influence over. Therefore, we cannot assume any liability for this external content. The respective provider or operator of the linked pages is always responsible for their content.'}
                        </p>
                    </Section>

                    <Section title={isDE ? 'Urheberrecht' : 'Copyright'}>
                        <p>
                            {isDE
                                ? 'Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.'
                                : 'The content and works created by the site operators on these pages are subject to Austrian copyright law. Reproduction, editing, distribution, and any kind of use beyond the limits of copyright law require the written consent of the respective author or creator.'}
                        </p>
                    </Section>

                    {/* Last updated */}
                    <p className={`text-center text-[10px] font-bold uppercase tracking-widest pt-4 ${darkMode ? 'text-white/15' : 'text-black/20'}`}>
                        {isDE ? 'Stand: ' : 'Last updated: '}{new Date().toLocaleDateString(isDE ? 'de-AT' : 'en-GB', { month: 'long', year: 'numeric' })}
                    </p>

                </div>
            </div>
        </div>
    );
}