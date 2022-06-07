const Environment = require('jest-environment-jsdom')

/**
 * A custom environment to set the TextEncoder that is required by our tests
 * https://github.com/jsdom/whatwg-url/issues/209
 */
module.exports = class CustomTestEnvironment extends Environment {
  async setup() {
    await super.setup()
    if (typeof this.global.TextEncoder === 'undefined') {
      const {TextEncoder, TextDecoder} = require('util')
      this.global.TextEncoder = TextEncoder
      this.global.TextDecoder = TextDecoder
    }
  }
}
