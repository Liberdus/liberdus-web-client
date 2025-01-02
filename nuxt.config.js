const GitRevisionPlugin = require('git-revision-webpack-plugin')
const gitRevisionPlugin = new GitRevisionPlugin()
const webpack = require('webpack')
const SriPlugin = require('webpack-subresource-integrity')

export default {
  telemetry: false,
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
    // Enable source maps in production
    sourcemap: true,

    filenames: {
      app: ({ isDev }) => isDev ? '[name].js' : 'js/[name].js',
      chunk: ({ isDev }) => isDev ? '[name].js' : 'js/[name].js',
      css: ({ isDev }) => isDev ? '[name].css' : 'css/[name].css',
      img: ({ isDev }) => isDev ? '[path][name].[ext]' : 'img/[name].[ext]',
      font: ({ isDev }) => isDev ? '[path][name].[ext]' : 'fonts/[name].[ext]',
      video: ({ isDev }) => isDev ? '[path][name].[ext]' : 'videos/[name].[ext]'
    },

    // Disable filename hashing
    babel: {
      filename: '[name].js'
    },

    // Keep descriptive chunk names
    optimization: {
      splitChunks: {
        name: true,
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.(css|vue)$/,
            chunks: 'all',
            enforce: true
          }
        }
      }
    },

    // Disable code obfuscation
    terser: {
      terserOptions: {
        mangle: false,
        compress: false,
        output: {
          beautify: true,
          comments: true
        }
      }
    },

    // Disable CSS minification
    optimizeCSS: false,

    extend(config, ctx) {
      // to make sure we can use file:// in dev tools
      config.output.devtoolModuleFilenameTemplate = function(info) {
        const path = info.absoluteResourcePath.replace(/\\/g, '/');
        return `file://${path}`;  // Removed extra forward slash
      }
      // Add Subresource Integrity
      if (!ctx.isDev) {
        config.output.crossOriginLoading = 'anonymous'
        config.plugins.push(new SriPlugin({
          hashFuncNames: ['sha384'],
          enabled: true
        }))
      }
      // Add Git info via DefinePlugin
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.COMMIT_HASH': JSON.stringify(gitRevisionPlugin.commithash()),
          'process.env.BRANCH': JSON.stringify(gitRevisionPlugin.branch()),
          'process.env.REPO_URL': JSON.stringify('https://github.com/Liberdus/liberdus-web-client'),
          'process.env.BUILD_DATE': JSON.stringify(new Date().toISOString())
        })
      );
      // Audio files loader
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      })

      // Add Git info
      config.plugins.push(gitRevisionPlugin)

      // Enable full source maps
      config.devtool = 'source-map'

      // Disable minification
      if (!ctx.isDev) {
        config.optimization.minimize = false
      }
    },
    env: {
      COMMIT_HASH: gitRevisionPlugin.commithash(),
      BRANCH: gitRevisionPlugin.branch(),
      REPO_URL: 'https://github.com/Liberdus/liberdus-web-client',
      BUILD_DATE: new Date().toISOString()
    }
  }
}
