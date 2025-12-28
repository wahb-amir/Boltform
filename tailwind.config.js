/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
],
  theme: {
    extend: {
      keyframes: {
        wavey: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-20px) scale(1.05)" },
        },
        floatX: {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "50%": { transform: "translateX(20px) rotate(2deg)" },
        },
      },
      animation: {
        wavey: "wavey 6s ease-in-out infinite",
        floatX: "floatX 8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
