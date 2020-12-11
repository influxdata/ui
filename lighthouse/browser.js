const chromeLauncher = require('chrome-launcher')
const util = require('util')
const request = require('request')
const puppeteer = require('puppeteer')
const { LoginError } = require('./errors.js')

class Browser {
    constructor(argumentz, options, agent) {
        this.arguments = argumentz
        this.options = options
        this.browser = null
        this.page = null
        this.chrome = null
        this.agent = agent
    }

    async initialize() {
        this.chrome = await chromeLauncher.launch(this.options)
        this.browser = await this._createBrowser()
        this.page = await this._createPage()
    }

    async _createPage() {
        return (await this.browser.pages())[0]
    }

    async _createBrowser() {
        this.options.port = this.chrome.port
        const resp = await util.promisify(request)(`http://localhost:${this.options.port}/json/version`)
        const {webSocketDebuggerUrl} = JSON.parse(resp.body)

        return await puppeteer.connect({browserWSEndpoint: webSocketDebuggerUrl})
    }

    async login() {
        if (!this.page) {
            await this.initialize()
        }

        try {
            await this.agent.login(this.page)
        } catch (error) {
            if (error instanceof LoginError) {
                console.error('Login Error: ', error)
            } else {
                console.error('Generic Error: ', error)
            }

            console.error('Destroying session...')
            this.destroy()
        }
    }

    async logout() {
        await this.agent.logout(this.page)
    }

    getPage() {
        return this.page
    }

    getOptions() {
        return this.options
    }

    async destroy() {
        await this.browser.disconnect()
        await this.chrome.kill()
    }
}

module.exports = {
    Browser
}
