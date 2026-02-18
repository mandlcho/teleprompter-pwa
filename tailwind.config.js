/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      animation: {
        countdown: 'countdownPop 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        fadeIn: 'fadeIn 0.5s ease forwards',
      },
      keyframes: {
        countdownPop: {
          '0%': { transform: 'scale(1.4)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

