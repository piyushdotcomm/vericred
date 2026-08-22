/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        surface: "#FFFFFF",
        surfaceAlt: "#F5F5F0",
        ink: "#1A1A1A",
        inkSecondary: "#555555",
        inkMuted: "#888888",
        border: "#E5E5E5",
        borderStrong: "#CCCCCC",
        accent: "#C73E1D",
        accentHover: "#A83218",
        accentBg: "#C73E1D1A",
        valid: "#16A34A",
        validBg: "#16A34A1A",
        tampered: "#DC2626",
        tamperedBg: "#DC26261A",
        revoked: "#D97706",
        revokedBg: "#D977061A",
        heroGradient1: "#2E3192",
        heroGradient2: "#7B61FF",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      borderRadius: {
        sharp: "0px",
        sm: "4px",
        soft: "12px",
        modal: "8px",
        pill: "999px",
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
      },
      animation: {
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
    },
  },
  plugins: [],
};
