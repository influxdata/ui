const webpackVendor = require('webpack')
const pathVendor = require('path')
const {dependencies} = require('./package.json')
const MonacoWebpackPluginVendor = require('monaco-editor-webpack-plugin')
const STATIC_DIRECTORY_VENDOR = require('./src/utils/env').STATIC_DIRECTORY

// only dll infrequently updated dependencies
const vendor = Object.keys(dependencies).filter(
  d =>
    !d.includes('@influxdata') &&
    !d.includes('webpack-bundle-analyzer') &&
    !d.includes('monaco-editor-webpack-plugin')
)

const monacoDirectory = path.resolve(__dirname, './node_modules/monaco-editor')

module.exports = {
  context: __dirname,
  mode: 'development',
  entry: {
    vendor,
  },
  resolve: {
    alias: {
      vscode: pathVendor.resolve(
        './node_modules/monaco-languageclient/lib/vscode-compatibility'
      ),
    },
    fallback: {
      assert: false,
      crypto: false,
      constants: false,
      fs: false,
      http: false,
      https: false,
      module: false,
      os: false,
      path: false,
      process: false,
      querystring: false,
      stream: false,
      tls: false,
      url: false,
      util: false,
      vm: false,
      zlib: false
    },
  },
  ignoreWarnings: [/export .* was not found in/],
  node: {
    global: true,
  },
  output: {
    path: pathVendor.join(__dirname, 'build'),
    filename: '[name].bundle.js',
    library: '[name]',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: monacoDirectory,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.m?js$/,
        include: monacoDirectory,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new webpackVendor.DllPlugin({
      name: '[name]',
      path: pathVendor.join(__dirname, 'build', '[name]-manifest.json'),
    }),
    new MonacoWebpackPluginVendor({
      languages: ['json', 'markdown'],
      filename: `${STATIC_DIRECTORY_VENDOR}[name].worker.[contenthash].js`,
      globalAPI: true,
    }),
  ],
  stats: {
    assetsSort: '!size',
    children: false,
    colors: true,
    errorDetails: true,
    excludeAssets: [/\.(hot-update|woff|eot|ttf|svg|ico|png|wasm)/],
    modules: false,
    version: false,
  },
  performance: {hints: false},
}
