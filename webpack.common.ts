const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

const webpack = require('webpack')
const {
  GIT_SHA,
  STATIC_DIRECTORY,
  BASE_PATH,
  API_BASE_PATH,
} = require('./src/utils/env')

const MONACO_DIR = path.resolve(__dirname, './node_modules/monaco-editor')

module.exports = {
  mode: 'development',
  target: 'web',
  context: __dirname,
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: BASE_PATH,
    webassemblyModuleFilename: `${STATIC_DIRECTORY}[modulehash:10].wasm`,
    sourceMapFilename: `${STATIC_DIRECTORY}[file].map[query]`,
    assetModuleFilename: `${STATIC_DIRECTORY}[contenthash:10].[ext]`,
  },
  optimization: {
    chunkIds: 'size',
    splitChunks: {
      chunks: 'all',
      // this may be what we want, just commenting it out for testing purposes
      // cacheGroups: {
      //   vendor: {
      //     test: /[\\/]node_modules[\\/]/,
      //     name: 'vendors',
      //     chunks: 'all'
      //   }
      // }
    },
  },
  experiments: {
    asyncWebAssembly: true,
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
    extensions: ['.tsx', '.ts', '.js', '.wasm', '...'],
    fallback: {
      path: false,
    },
  },
  ignoreWarnings: [/export .* was not found in/, /'.\/locale' in/],
  node: {
    global: true,
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
        type: 'asset/resource',
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
        type: 'asset/source',
      },
      {
        test: /\.conf$/,
        type: 'asset/source',
      },
      {
        test: /\.example$/,
        type: 'asset/source',
      },
      {
        test: /\.s?css$/i,
        use: [
          process.env.NODE_ENV === 'production'
            ? MiniCssExtractPlugin.loader
            : 'style-loader',
          'css-loader',
          'css-unicode-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
      },
      {
        test: /\.csv$/,
        type: 'asset/source',
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
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
      title: !!process.env.CLOUD_URL ? ' Cloud' : '',
    }),
    new MiniCssExtractPlugin({
      filename: `${STATIC_DIRECTORY}[contenthash:10].css`,
      chunkFilename: `${STATIC_DIRECTORY}[id].[contenthash:10].css`,
    }),
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
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  stats: {
    colors: true,
    children: false,
    modules: false,
    version: false,
    assetsSort: '!size',
    excludeAssets: [/\.(hot-update|woff|eot|ttf|svg|ico|png)/],
  },
  performance: {hints: false},
}
