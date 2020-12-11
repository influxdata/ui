const { sleep } = require('./utils.js')
const fetch = require('node-fetch')

class APIWaiter {
    constructor(url, sleepTime=2, maxExecution=(1000 * 60 * 5)) {
        this.url = url
        this.sleepTime = sleepTime
        this.maxExecution = maxExecution
    }

    async wait() {
        const begin = new Date()

        while ((new Date() - begin) < this.maxExecution) {
            try {
                const result = await fetch(this.url).then(r => r.json())
                if (result.authorizations !== undefined) {
                    break
                }
            } catch (error) {
                console.error(`Error: ${error}`)
            }

            console.info(`Sleeping for ${this.sleepTime} seconds`)
            await sleep(this.sleepTime)
        }
    }
}

module.exports = {
    APIWaiter
}
