/*
 ** TailwindCSS Configuration File
 **
 ** Docs: https://tailwindcss.com/docs/configuration
 ** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */
module.exports = {
  darkMode: 'class',
  content: ['src/components/**/*.vue', 'src/layouts/**/*.astro', 'src/**/*.md', 'src/**/*.md'],
  theme: {
    fontFamily: {
      display: ['Montserrat', 'sans-serif'],
      body: ['Noto Sans', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      mono: [
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Monaco',
        'Consolas',
        'Liberation Mono',
        'Courier New',
        'monospace',
      ],
    },

    extend: {
      colors: {
        'dark-light': '#151518',
        dark: 'hsl(240 6% 9%)',
        carbon: '#333',
        'accent-900': '#009f53',
        'accent-800': 'var(--accent, #06d77b)',
        'accent-100': '#7bffc5',

        warning: 'hsl(14deg 36% 34%)',
        error: '#cf6679',
        'gray-800': '#151518',
        'gray-700': 'hsl(240 6% 9%)',
        'gray-600': '#333',
        'gray-500': 'hsl(0 0% 29%)',
        'gray-400': '#a2a2a2',
        'gray-300': 'hsl(0 0% 74%)',
        'gray-200': '#e8e8e8',
        'gray-100': '#f6f6f6',
      },
      screens: {
        motion: { raw: '(prefers-reduced-motion: no-preference)' },
      },
    },
  },
};
