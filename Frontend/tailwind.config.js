/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          deep: "#0F172A",
        },
        graphite: "#1E293B",
        steel: "#2563EB",
        cyan: {
          soft: "#22D3EE",
        },
        role: {
          owner: "#7C3AED",
          participant: "#2563EB",
          viewer: "#6B7280",
        },
        semantic: {
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          info: "#3B82F6",
          disabled: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "page-title": ["28px", { lineHeight: "1.35" }],
        "section-title": ["20px", { lineHeight: "1.4" }],
        "card-title": ["16px", { lineHeight: "1.45" }],
        body: ["14px", { lineHeight: "1.5" }],
        small: ["12px", { lineHeight: "1.45" }],
        "dashboard-num": ["32px", { lineHeight: "1.2" }],
      },
      boxShadow: {
        card: "0 1px 3px rgb(0 0 0 / 0.08), 0 1px 2px rgb(0 0 0 / 0.06)",
        "card-lift": "0 10px 25px -5px rgb(0 0 0 / 0.12), 0 8px 10px -6px rgb(0 0 0 / 0.08)",
        btn: "0 1px 2px rgb(0 0 0 / 0.06)",
      },
      transitionDuration: {
        150: "150ms",
        200: "200ms",
        250: "250ms",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out forwards",
        shake: "shake 220ms ease-out",
      },
    },
  },
  plugins: [],
};
