export default {
  mode: 'spa',
  server: {
    port: 3333, // default: 3000
    host: '0.0.0.0' // default: localhost
  },
  /*
   ** Headers of the page
   */
  head: {
    title: 'Liberdus Wallet',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Inconsolata|Poppins:400,700&display=swap'
      }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [
    '~/assets/main.css',
    'onsenui/css/onsenui.css',
    'onsenui/css/onsen-css-components.css'
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: ['@/plugins/ant-design-vue'],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    // '@nuxtjs/eslint-module'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa'
  ],
  pwa: {
    manifest: {
      name: 'Liberdus',
      short_name: 'Liberdus',
      lang: 'en'
    },
    icon: {
      iconSrc: './static/icon.png',
      iconFileName: 'icon.png'
    }
  },
  // manifest: {
  //   name: 'Liberdus',
  //   short_name: 'Liberdus',
  //   lang: 'en',
  //   display: 'standalone',
  //   start_url: '/',
  //   icons: [
  //     {
  //       src: './assets/192px.png',
  //       sizes: '192x192',
  //       type: 'image/png'
  //     },
  //     {
  //       src: './assets/512px.png',
  //       sizes: '512x512',
  //       type: 'image/png'
  //     }
  //   ]
  // },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend (config, ctx) {
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      })
    }
  }
}
