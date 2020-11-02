module.exports = (on, config) => {
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.family === 'chromium' && browser.name !== 'electron') {
      launchOptions.args.push('--disable-dev-shm-usage')
    }

    return launchOptions
  })

  loginCount = 0
  on('task', {
    incrementLoginCounter() {
      loginCount += 1
      return loginCount.toString()
    },
  })
}
