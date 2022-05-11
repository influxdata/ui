const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const WorkerPlugin = require('worker-plugin')

const webpack = require('webpack')
const {
  GIT_SHA,
  STATIC_DIRECTORY,
  BASE_PATH,
  API_BASE_PATH,
} = require('./src/utils/env')

const MONACO_DIR = path.resolve(__dirname, './node_modules/monaco-editor')

module.exports = {
  context: __dirname,
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: BASE_PATH,
    webassemblyModuleFilename: `${STATIC_DIRECTORY}[modulehash:10].wasm`,
    sourceMapFilename: `${STATIC_DIRECTORY}[file].map[query]`,
  },
  entry: {
    app: './src/bootstrap.ts',
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
      assets: path.resolve(__dirname, 'assets'),
      react: path.resolve('./node_modules/react'),
      vscode: path.resolve(
        __dirname,
        'node_modules/monaco-languageclient/lib/vscode-compatibility'
      ),
    },
    extensions: ['.tsx', '.ts', '.js', '.wasm'],
  },
  node: {
    fs: 'empty',
    global: true,
    crypto: 'empty',
    tls: 'empty',
    net: 'empty',
    process: true,
    module: false,
    clearImmediate: false,
    setImmediate: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        include: MONACO_DIR,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
      {
        test: /^((?!flux-lsp-browser_bg).)*.wasm$/,
        loader: 'file-loader',
        type: 'javascript/auto',
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.md$/,
        use: [{loader: 'raw-loader'}],
      },
      {
        test: /\.conf$/,
        use: [{loader: 'raw-loader'}],
      },
      {
        test: /\.example$/,
        use: [{loader: 'raw-loader'}],
      },
      {
        test: /\.s?css$/i,
        use: [
          process.env.NODE_ENV === 'production'
            ? MiniCssExtractPlugin.loader
            : 'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              hmr: true,
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: `${STATIC_DIRECTORY}[contenthash:10].[ext]`,
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: `${STATIC_DIRECTORY}[contenthash:10].[ext]`,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './assets/index.html',
      favicon: './assets/images/favicon.ico',
      inject: 'body',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      },
      base: BASE_PATH.slice(0, -1),
      header: process.env.INJECT_HEADER || '',
      body: process.env.INJECT_BODY || '',
      titleAdd: !!process.env.CLOUD_URL ? ' Cloud' : '',
    }),
    new MiniCssExtractPlugin({
      filename: `${STATIC_DIRECTORY}[contenthash:10].css`,
      chunkFilename: `${STATIC_DIRECTORY}[id].[contenthash:10].css`,
    }),
    new WorkerPlugin(),
    new webpack.ProgressPlugin(),
    new webpack.EnvironmentPlugin({
      ...process.env,
      GIT_SHA,
      API_PREFIX: API_BASE_PATH,
      STATIC_PREFIX: BASE_PATH,
    }),
    new MonacoWebpackPlugin({
      languages: ['json', 'markdown'],
      filename: `${STATIC_DIRECTORY}[name].worker.[contenthash].js`,
      globalAPI: true,
    }),
  ],
  stats: {
    colors: true,
    children: false,
    modules: false,
    version: false,
    assetsSort: '!size',
    warningsFilter: [/export .* was not found in/, /'.\/locale' in/],
    excludeAssets: [/\.(hot-update|woff|eot|ttf|svg|ico|png)/],
  },
  performance: {hints: false},
}
