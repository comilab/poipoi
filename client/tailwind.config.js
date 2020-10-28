/*
** TailwindCSS Configuration File
**
** Docs: https://tailwindcss.com/docs/configuration
** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
*/
module.exports = {
  theme: {},
  variants: {
    opacity: ['responsive', 'hover', 'focus', 'disabled'],
    pointerEvents: ['responsive', 'hover', 'focus', 'disabled']
  },
  plugins: [],
  purge: {
    // Learn more on https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css
    enabled: process.env.NODE_ENV === 'production',
    content: [
      'components/**/*.vue',
      'layouts/**/*.vue',
      'pages/**/*.vue',
      'plugins/**/*.js',
      'nuxt.config.js'
    ],
    whitelistPatterns: [/text-.+-[0-9]+$/, /bg-.+-[0-9]+$/]
  },
  separator: '_'
}
