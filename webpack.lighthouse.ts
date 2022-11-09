// utils
const commonWebpack = require('./webpack.common.ts')
const mergeWebpack = require('webpack-merge')
const commonPath = require('path')

// Plugins
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')

const DIRECTORY_STATIC = require('./src/utils/env').STATIC_DIRECTORY

module.exports = mergeWebpack(commonWebpack, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: `${DIRECTORY_STATIC}[contenthash:10].js`,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre', // this forces this rule to run first.
        use: ['source-map-loader'],
        include: [
          commonPath.resolve(__dirname, 'node_modules/@influxdata/giraffe'),
          commonPath.resolve(__dirname, 'node_modules/@influxdata/clockface'),
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        cache: true,
        parallel: 2,
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
    splitChunks: {
      chunks: 'all',
    },
  },
})
