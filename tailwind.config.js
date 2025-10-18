/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00B386",
        secondary: "#00C8A3",
        accent: "#A3E8D1",
        dark: "#222831",
        light: "#F2F2F2",
        base: "#FFFFFF",
      },
    },
  },
  plugins: [],
};

export default config;
