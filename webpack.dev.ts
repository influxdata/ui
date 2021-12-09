export {}
const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common.ts')
const PORT = parseInt(process.env.PORT, 10) || 8080
const PUBLIC = process.env.PUBLIC || undefined
const {BASE_PATH} = require('./src/utils/env')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const webpack = require('webpack')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-inline-source-map',
  output: {
    filename: '[name].js',
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
  },
  devServer: {
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/api/v2': 'http://localhost:8086',
      '/debug/flush': 'http://localhost:8086',
      '/oauth': 'http://localhost:8086',
      '/health': 'http://localhost:8086',
    },
    allowedHosts: 'all',
    host: '0.0.0.0',
    port: PORT,
    devMiddleware: {
      publicPath: PUBLIC,
    },
    webSocketServer: {
      options: {
        path: `${BASE_PATH}hmr`,
      },
    },
    client: {
      webSocketURL: {
        hostname: '0.0.0.0',
        pathname: `${BASE_PATH}hmr`,
        port: 443,
      },
    },
  },
  plugins: [
    new webpack.DllReferencePlugin({
      context: path.join(__dirname, 'build'),
      manifest: require('./build/vendor-manifest.json'),
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      analyzerHost: '0.0.0.0',
      analyzerPort: '9998',
      openAnalyzer: false,
    }),
  ],
})
