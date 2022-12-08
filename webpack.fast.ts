// utils
const common = require('./webpack.common.ts')
const merge = require('webpack-merge').merge
const STATIC_DIR = require('./src/utils/env').STATIC_DIRECTORY

module.exports = merge(common, {
  mode: 'none',
  output: {
    filename: `${STATIC_DIR}[contenthash:10].js`,
    chunkFilename: pathData => {
      return ['interceptor', 'setup-interceptor'].includes(pathData.chunk.name)
        ? '[contenthash:10].js'
        : `${STATIC_DIR}[contenthash:10].js`
    },
  },
})
