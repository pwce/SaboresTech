/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // color principal turquesa/cian del foodtruck
        brand: {
          50:  "#E6F7F5",
          100: "#C0EBE6",
          200: "#96DED6",
          300: "#6BD1C5",
          400: "#3DC2B3",
          500: "#00A896", // color principal (logo/mostrador)
          600: "#00897A",
          700: "#006B60",
          800: "#004D45",
          900: "#00302B",
        },
        // negro/gris oscuro para secciones sólidas
        carbon: {
          50:  "#F4F4F5",
          100: "#E4E4E7",
          300: "#A1A1AA",
          500: "#52525B",
          700: "#27272A",
          800: "#1C1C1F",
          900: "#111113", // negro casi puro para fondos sólidos
        },
        //amarillo/naranja cálido para alertas y botones interactivos
        accent: {
          light: "#FFD166", // amarillo cálido (badges, destacados suaves)
          DEFAULT: "#FB8500", // naranja principal (botones de acción, cta)
          dark: "#D96C00",
        },
        estado: {
          pendiente: "#FFD166",   // pendiente de pago/en espera
          preparacion: "#00A896", // en preparación
          entregado: "#52525B",   // archivado/entregado
          agotado: "#E5484D",     // producto agotado
        },
      },
      fontFamily: {
        display: ["'Poppins'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      minHeight: {
        touch: "48px",
        "touch-lg": "64px",
      },
      minWidth: {
        touch: "48px",
        "touch-lg": "64px",
      },
      borderRadius: {
        card: "1rem",
      },
      boxShadow: {
        card: "0 4px 14px rgba(0, 0, 0, 0.08)",
        pop: "0 8px 24px rgba(0, 168, 150, 0.25)",
      },
      keyframes: {
        popIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        popIn: "popIn 0.15s ease-out",
      },
    },
  },
  plugins: [],
};
