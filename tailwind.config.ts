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
        // Silicon telemetry console tokens (see docs/DESIGN.md)
        base: "var(--bg)",
        panel: "var(--surface)",
        raised: "var(--surface-2)",
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
        ink: {
          DEFAULT: "var(--text)",
          dim: "var(--text-dim)",
          faint: "var(--text-faint)",
        },
        signal: {
          DEFAULT: "var(--signal)",
          text: "var(--signal-text)",
          soft: "var(--signal-soft)",
        },
        gain: {
          DEFAULT: "var(--gain)",
          soft: "var(--gain-soft)",
        },
        loss: {
          DEFAULT: "var(--loss)",
          soft: "var(--loss-soft)",
        },
        // Legacy aliases — old class names resolve to the new palette
        "amd-red": "var(--signal)",
        "amd-dark": "var(--surface)",
        "amd-gray": "var(--surface)",
        "amd-accent": "var(--signal)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
