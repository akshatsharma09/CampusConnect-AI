/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A', // Deep blue for trust and professionalism
        accent: '#14B8A6', // Vibrant teal for energy and innovation
        neutral: '#F3F4F6', // Soft gray for backgrounds
        text: '#111827', // Dark slate for readability
      },
    },
  },
  plugins: [],
}