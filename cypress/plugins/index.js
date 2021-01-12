module.exports = (on, config) => {
  on('before:browser:launch', (browser = {}, launchOptions) => {
    // see https://github.com/flotwig/cypress-log-to-output/issues/5
    launchOptions = require('cypress-log-to-output')
      .install(on, (_, event) => {
        if (
          event.url &&
          (event.url.includes('www.googletagmanager.com') ||
            event.url.includes('api/v2/me'))
        ) {
          return false
        }

        if (event.level === 'error') {
          return true
        }

        return false
      })
      .browserLaunchHandler(browser, args)

    if (browser.family === 'chromium' && browser.name !== 'electron') {
      launchOptions.args.push('--disable-dev-shm-usage')
    }

    return launchOptions
  })
}
