import {defineConfig} from 'cypress'

export default defineConfig({
  retries: {
    runMode: 3,
    openMode: 0,
  },
  numTestsKeptInMemory: 25,
  defaultCommandTimeout: 10000,
  videoUploadOnPasses: false,
  chromeWebSecurity: false,
  blockHosts: [
    'www.google-analytics.com',
    'www.googletagmanager.com',
    'www.honeybadger.io',
  ],
  viewportWidth: 1400,
  viewportHeight: 1000,
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
})
