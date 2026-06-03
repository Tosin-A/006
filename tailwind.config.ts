import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        claude: {
          bg: "#0f0f12",
          text: "#e8e6e1",
          muted: "#8a8890",
          bubble: "#1a1a20",
          accent: "#c9a227",
        },
        spy: {
          bg: "#08080a",
          panel: "#101014",
          line: "#25252e",
          text: "#e8e6e1",
          muted: "#6e6e78",
          gold: "#c9a227",
          green: "#4a9b6e",
          red: "#b83c3c",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
