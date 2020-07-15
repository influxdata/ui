export {}

// utils
const common = require('./webpack.common.ts')
const merge = require('webpack-merge')

const {STATIC_DIRECTORY} = require('./src/utils/env')

module.exports = merge(common, {
  mode: 'none',
  output: {
    filename: `${STATIC_DIRECTORY}[contenthash:10].js`,
  },
})
