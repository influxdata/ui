const clipboardy = require('clipboardy')
const path = require('path')
const fs = require('fs')

module.exports = on => {
  on('before:browser:launch', (browser = {}, launchOptions) => {
    // see https://github.com/flotwig/cypress-log-to-output/issues/5

    const logToOutput = require('cypress-log-to-output')

    logToOutput.install(on, (_, event) => {
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

    launchOptions.args = logToOutput.browserLaunchHandler(
      browser,
      launchOptions.args
    )

    if (browser.family === 'chromium' && browser.name !== 'electron') {
      launchOptions.args.push('--disable-dev-shm-usage')
    }

    return launchOptions
  }),
    on('task', {
      getClipboard: () => {
        return clipboardy.readSync()
      },
      deleteDownloads({dirPath}) {
        fs.readdir(dirPath, (err, files) => {
          if (!files) {
            return
          }
          for (const file of files) {
            fs.unlink(path.join(dirPath, file), err => {
              console.log('Removed ' + file)
            })
          }
        })
        return null
      },
    })
}
