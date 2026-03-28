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
        "amd-red": "#ED1C24",
        "amd-dark": "#1a1a2e",
        "amd-gray": "#16213e",
        "amd-accent": "#e94560",
      },
    },
  },
  plugins: [],
};
export default config;
