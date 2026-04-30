import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Datenschutz({ darkMode, lang }) {
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
            <div className={`space-y-3 text-[13px] font-medium leading-relaxed ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
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
                        {isDE ? 'Datenschutz' : 'Privacy Policy'}
                    </h1>
                </motion.div>

                <div className="space-y-5">

                    <Section title={isDE ? 'Verantwortliche' : 'Data Controller'}>
                        <p className="font-bold">RS Pflege — Endrit Spahiu &amp; Sead Rekić</p>
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

                    <Section title={isDE ? 'Grundsatz' : 'General Principle'}>
                        <p>
                            {isDE
                                ? 'Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TKG 2021).'
                                : 'Protecting your personal data is particularly important to us. We therefore process your data exclusively on the basis of legal regulations (GDPR, TKG 2021).'}
                        </p>
                    </Section>

                    <Section title={isDE ? 'Welche Daten wir erfassen' : 'Data We Collect'}>
                        <p className={`text-[11px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                            {isDE ? 'Kontaktformular' : 'Contact Form'}
                        </p>
                        <p>
                            {isDE
                                ? 'Wenn Sie uns über das Kontaktformular kontaktieren, werden folgende Daten erhoben: Name, E-Mail-Adresse, Nachricht sowie optional gewählte Services und Wunschtermin. Diese Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet.'
                                : 'When you contact us via the contact form, the following data is collected: name, email address, message, and optionally selected services and preferred appointment. This data is used exclusively to process your inquiry.'}
                        </p>
                        <p className={`text-[11px] font-black uppercase tracking-widest mt-4 mb-2 ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                            {isDE ? 'Lokaler Speicher (localStorage)' : 'Local Storage'}
                        </p>
                        <p>
                            {isDE
                                ? 'Diese Website verwendet localStorage des Browsers, um technisch notwendige Daten zu speichern (z.B. Warenkorb-Inhalte, Dark-Mode-Einstellung, Kraftstoffpreis-Cache). Diese Daten verlassen Ihr Gerät nicht und werden nicht an uns übermittelt.'
                                : 'This website uses the browser\'s localStorage to store technically necessary data (e.g. cart contents, dark mode setting, fuel price cache). This data does not leave your device and is not transmitted to us.'}
                        </p>
                        <p className={`text-[11px] font-black uppercase tracking-widest mt-4 mb-2 ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                            {isDE ? 'Standortdaten (optional)' : 'Location Data (optional)'}
                        </p>
                        <p>
                            {isDE
                                ? 'Wenn Sie die Funktion "Ihr kommt zu mir" nutzen, kann die Website mit Ihrer Zustimmung auf Ihren Browserstandort zugreifen. Dieser wird ausschließlich zur Berechnung der Fahrtkosten verwendet und nicht gespeichert oder weitergegeben.'
                                : 'If you use the "you come to me" feature, the website may access your browser location with your consent. This is used exclusively to calculate travel costs and is not stored or shared.'}
                        </p>
                    </Section>

                    <Section title={isDE ? 'Drittanbieter-Dienste' : 'Third-Party Services'}>
                        <p className={`text-[11px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                            Web3Forms
                        </p>
                        <p>
                            {isDE
                                ? 'Für den Versand von Kontaktformularen nutzen wir den Dienst Web3Forms (web3forms.com). Ihre eingegebenen Formulardaten werden an den Server von Web3Forms übermittelt und von dort als E-Mail weitergeleitet. Datenschutzerklärung: '
                                : 'For sending contact forms, we use the Web3Forms service (web3forms.com). Your form data is transmitted to Web3Forms servers and forwarded as an email. Privacy policy: '}
                            <a href="https://web3forms.com/privacy" target="_blank" rel="noopener noreferrer"
                                className={`font-bold underline underline-offset-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                web3forms.com/privacy
                            </a>
                        </p>
                        <p className={`text-[11px] font-black uppercase tracking-widest mt-4 mb-2 ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                            Photon / Komoot (Geocoding)
                        </p>
                        <p>
                            {isDE
                                ? 'Zur Umwandlung von Adressen in Koordinaten nutzen wir die Photon-API von Komoot (photon.komoot.io). Dabei wird die eingegebene Adresse an Komoot-Server übertragen. Datenschutzerklärung: '
                                : 'To convert addresses into coordinates, we use the Photon API by Komoot (photon.komoot.io). The entered address is transmitted to Komoot servers. Privacy policy: '}
                            <a href="https://www.komoot.com/privacy" target="_blank" rel="noopener noreferrer"
                                className={`font-bold underline underline-offset-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                komoot.com/privacy
                            </a>
                        </p>
                        <p className={`text-[11px] font-black uppercase tracking-widest mt-4 mb-2 ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                            E-Control API (Kraftstoffpreise)
                        </p>
                        <p>
                            {isDE
                                ? 'Zur Anzeige aktueller Dieselpreise werden Daten von der österreichischen E-Control API abgerufen. Dabei werden keine personenbezogenen Daten übermittelt.'
                                : 'To display current diesel prices, data is retrieved from the Austrian E-Control API. No personal data is transmitted in this process.'}
                        </p>
                        <p className={`text-[11px] font-black uppercase tracking-widest mt-4 mb-2 ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                            Supabase (Authentifizierung)
                        </p>
                        <p>
                            {isDE
                                ? 'Für die Benutzeranmeldung nutzen wir Supabase (supabase.com). Bei der Registrierung und Anmeldung werden E-Mail-Adresse und Passwort verarbeitet. Datenschutzerklärung: '
                                : 'For user authentication, we use Supabase (supabase.com). Email address and password are processed during registration and login. Privacy policy: '}
                            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer"
                                className={`font-bold underline underline-offset-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                supabase.com/privacy
                            </a>
                        </p>
                    </Section>

                    <Section title={isDE ? 'Ihre Rechte (DSGVO)' : 'Your Rights (GDPR)'}>
                        <p>
                            {isDE
                                ? 'Ihnen stehen grundsätzlich folgende Rechte zu:'
                                : 'You are generally entitled to the following rights:'}
                        </p>
                        <ul className="space-y-1.5 mt-2">
                            {(isDE ? [
                                'Recht auf Auskunft (Art. 15 DSGVO)',
                                'Recht auf Berichtigung (Art. 16 DSGVO)',
                                'Recht auf Löschung (Art. 17 DSGVO)',
                                'Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)',
                                'Recht auf Datenübertragbarkeit (Art. 20 DSGVO)',
                                'Widerspruchsrecht (Art. 21 DSGVO)',
                            ] : [
                                'Right of access (Art. 15 GDPR)',
                                'Right to rectification (Art. 16 GDPR)',
                                'Right to erasure (Art. 17 GDPR)',
                                'Right to restriction of processing (Art. 18 GDPR)',
                                'Right to data portability (Art. 20 GDPR)',
                                'Right to object (Art. 21 GDPR)',
                            ]).map(r => (
                                <li key={r} className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5 flex-shrink-0">—</span>
                                    <span>{r}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3">
                            {isDE
                                ? 'Zur Geltendmachung dieser Rechte wenden Sie sich bitte an: '
                                : 'To exercise these rights, please contact: '}
                            <a href="mailto:rspflege.office@gmail.com"
                                className={`font-bold underline underline-offset-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                rspflege.office@gmail.com
                            </a>
                        </p>
                    </Section>

                    <Section title={isDE ? 'Beschwerderecht' : 'Right to Lodge a Complaint'}>
                        <p>
                            {isDE
                                ? 'Sie haben das Recht, sich bei der österreichischen Datenschutzbehörde (dsb.gv.at) zu beschweren, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten gegen die DSGVO verstößt.'
                                : 'You have the right to lodge a complaint with the Austrian Data Protection Authority (dsb.gv.at) if you believe that the processing of your data violates the GDPR.'}
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