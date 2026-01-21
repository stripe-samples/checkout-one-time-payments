import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "stripe-purple": "#635bff",
        "stripe-dark": "#0a2540",
        "stripe-light": "#f6f9fc",
      },
    },
  },
  plugins: [],
};

export default config;
