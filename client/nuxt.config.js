import { copySync, removeSync } from 'fs-extra'

export default {
  ssr: false,
  /*
  ** Nuxt target
  ** See https://nuxtjs.org/api/configuration-target
  */
  target: 'static',
  /*
  ** Headers of the page
  ** See https://nuxtjs.org/api/configuration-head
  */
  head: {
    title: '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  ** https://nuxtjs.org/guide/plugins
  */
  plugins: [
    '~/plugins/axios',
    '~/plugins/dayjs',
    '~/plugins/vee-validate',
    '~/plugins/nuxt-client-init'
  ],
  /*
  ** Auto import components
  ** See https://nuxtjs.org/api/configuration-components
  */
  components: false,
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxt/typescript-build',
    // Doc: https://github.com/nuxt-community/stylelint-module
    '@nuxtjs/stylelint-module',
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    '@nuxtjs/tailwindcss',
    'nuxt-composition-api',
    ['@nuxtjs/router', { fileName: 'router.ts', keepDefaultRouter: true }],
    '@nuxtjs/fontawesome'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    ['vue-scrollto/nuxt', {
      offset: () => {
        return window.innerWidth <= 768 ? 0 : -62
      }
    }]
  ],
  /*
  ** Build configuration
  ** See https://nuxtjs.org/api/configuration-build/
  */
  build: {
  },

  env: {
    apiUrl: process.env.API_URL || ''
  },

  watchers: {
    webpack: {
      poll: true
    }
  },

  hooks: {
    generate: {
      done (generator) {
        if (!generator.nuxt.options.dev && !generator.nuxt.options.ssr) {
          const publicDir = `${__dirname}/../php/public/_nuxt`
          removeSync(publicDir)
          copySync(`${generator.nuxt.options.generate.dir}/_nuxt`, publicDir)
          copySync(`${generator.nuxt.options.generate.dir}/200.html`, `${publicDir}/index.html`)
        }
      }
    }
  }
}
