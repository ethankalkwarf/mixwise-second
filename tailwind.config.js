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
        // Botanical Garden Color Palette
        cream: "#F9F7F2",
        mist: "#E6EBE4",
        forest: "#3A4D39",
        charcoal: "#2C3628",
        sage: "#5F6F5E",
        terracotta: "#BC5A45",
        "terracotta-dark": "#A04532",
        olive: "#8A9A5B",
        stone: "#D1DAD0",
        "mixwise-accent": "#BC5A45", // Same as terracotta
        // Keep some utility colors
        brand: {
          DEFAULT: "#BC5A45",
          light: "#D47A68",
          dark: "#A04532"
        },
        surface: {
          light: "#F9F7F2",
          DEFAULT: "#FFFFFF",
          dark: "#E6EBE4"
        }
      },
      fontFamily: {
        display: ["var(--font-dm-serif)", "Georgia", "serif"],
        sans: ["var(--font-jost)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem"
      },
      boxShadow: {
        'terracotta': '0 10px 25px -5px rgba(188, 90, 69, 0.2)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'card': '0 8px 30px -8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        'botanical-gradient': 'linear-gradient(135deg, #F9F7F2 0%, #E6EBE4 100%)',
        'hero-pattern': 'radial-gradient(circle at 20% 80%, rgba(188, 90, 69, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(138, 154, 91, 0.08) 0%, transparent 50%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    }
  },
  plugins: []
};
