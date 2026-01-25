import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1754cf",
        accent: "#059669",
        "background-light": "#f6f6f8",
        "background-dark": "#111621",
        ink: "#111318",
        muted: "#636f88",
        border: "#dcdfe5",
      },
      fontFamily: {
        display: ["var(--font-public-sans)", "Public Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
