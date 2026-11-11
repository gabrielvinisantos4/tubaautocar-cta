/** @type {import('tailwindcss').Config} */
const c = (v) => `rgb(var(--${v}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: c('bg'), surface: c('surface'), surface2: c('surface2'), line: c('line'), fg: c('fg'), muted: c('muted'),
        accent: c('accent'), onaccent: c('onaccent'), ok: c('ok'), bad: c('bad'), info: c('info'), warn: c('warn'), onsolid: c('onsolid')
      },
      fontFamily: { display: ['var(--font-display)'], sans: ['var(--font-body)'], mono: ['var(--font-mono)'] }
    }
  },
  plugins: []
};
