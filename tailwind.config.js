// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // adjust as needed to include all your components/pages
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
      colors: {
        // You can customize the theme here if needed
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [require("tailwindcss-animate")], // needed for shadcn animations
};
