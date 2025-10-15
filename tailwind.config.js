/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { brand: { 50:"#f0f7ff", 500:"#1976d2", 600:"#125ea3" } }
    }
  },
  plugins: []
};
