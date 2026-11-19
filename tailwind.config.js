/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155",
        },
        electric: {
          500: "#22d3ee",
          400: "#67e8f9",
        },
        purple: {
          500: "#a855f7",
          400: "#c084fc",
        },
        green: {
          500: "#22c55e",
          400: "#4ade80",
        },
        orange: {
          500: "#f97316",
          400: "#fb923c",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 20px -4px rgba(0, 0, 0, 0.1)",
        glow: "0 0 20px rgba(34, 211, 238, 0.4)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
}
