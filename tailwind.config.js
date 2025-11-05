/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4CAF50",
        secondary: "#1976D2",
        accent: "#FDD835",
        dark: "#1F2933",
        light: "#FFFFFF",
        base: "#FAFAFA",
      },
    },
  },
  plugins: [],
};

export default config;
