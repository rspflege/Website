/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // Prüfe ob dieser Pfad exakt so drin steht!
    ],
    theme: {
        extend: {
            colors: {
                'rs-blue': '#3D7EAA',
                'rs-dark': '#050505',
            }
        },
    },
    plugins: [],
}