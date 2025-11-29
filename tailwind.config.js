/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./sanity/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#84cc16",
          light: "#a3e635",
          dark: "#65a30d"
        },
        surface: {
          light: "#f8fafc",
          DEFAULT: "#0f172a",
          dark: "#020617"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"]
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      }
    }
  },
  plugins: []
};
