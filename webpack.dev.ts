const pathDev = require('path')
const mergeDev = require('webpack-merge').merge
const commonDev = require('./webpack.common.ts')
const PORT = parseInt(process.env.PORT, 10) || 8080
const PUBLIC = process.env.PUBLIC || undefined
const BASE_PATH_DEV = require('./src/utils/env').BASE_PATH
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = mergeDev(commonDev, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  output: {
    path: pathDev.join(__dirname, 'build'),
    filename: '[name].js',
  },
  resolve: {
    fallback: {
      path: false,
    },
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
  },
  devServer: {
    hot: false,
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
        path: `${BASE_PATH_DEV}hmr`,
      },
    },
    client: {
      progress: false,
      overlay: {
        errors: true,
        warnings: false,
      },
      webSocketURL: {
        hostname: '0.0.0.0',
        pathname: `${BASE_PATH_DEV}hmr`,
        port: 443,
      },
    },
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: true,
      logger: {
        devServer: false, // don't block UI compilation on TS errors
      },
    }),
  ],
})
