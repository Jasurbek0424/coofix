import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",

  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        lg: "1.5rem",
        xl: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    colors: {
      white: "var(--white)",
      black: "var(--black)",
      background: "var(--background)",
      gray: "var(--gray)",
      smoky: "var(--smoky)",
      dark: "var(--dark)",
      coal: "var(--coal)",
      orange: "var(--orange)",
      red: "var(--red)",
    },

    extend: {
      fontFamily: {
        noto: ["var(--font-noto)", "Noto Sans", "sans-serif"],
      },
    },
  },
};

export default config;
