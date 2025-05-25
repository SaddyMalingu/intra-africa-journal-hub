/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 2s ease-out",
        slideInUp: "slideInUp 1.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideInUp: {
          "0%": { transform: "translateY(100px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      colors: {
        primary: "#c8102e", // matches red from the screenshot
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"], // clean body font
      },
    },
  },
  plugins: [],
};
