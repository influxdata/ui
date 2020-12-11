const { LoginError } = require('./errors.js')

class Influx {
    constructor(baseURL, port, credentials) {
        this.urls = {
            login: this._getLoginURL(baseURL, port),
            logout: this._getLogoutURL(baseURL, port)
        }
        this.credentials = credentials
        this.dimensions = {width: 1200, height: 900}
    }

    _getLoginURL(baseURL, port) {
        if (port !== 80) {
            return `http://${baseURL}:${port}`
        }

        return `http://${baseURL}`
    }

    _getLogoutURL(baseURL, port) {
        if (port !== 80) {
            return `http://${baseURL}:${port}/logout`
        }

        return `http://${baseURL}/logout`
    }

    async login(page) {
        try {
            await page.setViewport(this.dimensions)
            await page.goto(this.urls.login, {waitUntil: 'networkidle0'})
    
            await page.waitForSelector('#login', {visible: true})
            await page.type('[id="login"]', this.credentials.username)
            await page.type('[id="password"]', this.credentials.password)
            await page.evaluate(() => {
                document.querySelector('[id="submit-login"]').click()
            })
    
            await page.waitForNavigation({ waitUntil: 'networkidle2' })
            await page.click('body > div.dex-container > div > div:nth-child(5) > div:nth-child(1) > form > button')
            await page.waitForNavigation({waitUntil: 'networkidle2'})
            await page.waitForSelector('#cf-app-wrapper', {visible: true})
        } catch (error) {
            throw new LoginError(error.message)
        }
    }

    async logout(page) {
        await page.goto(this.urls.logout, {waitUntil: 'networkidle2'})
    }
}

module.exports = {
    Influx
}
