const lighthouse = require('lighthouse')
const config = require('lighthouse/lighthouse-core/config/lr-desktop-config.js')
const reportGenerator = require('lighthouse/lighthouse-core/report/report-generator')
const fs = require('fs')
const args = require('minimist')(process.argv.slice(2))
const { Browser } = require('./browser.js')
const { APIWaiter } = require('./waiter.js')
const { Influx } = require('./loginAgent.js')
const { PullRequest } = require('./pullRequest.js')
const { ScoresFormatter } = require('./formatters.js')


if (!args.username || !args.password || !args.port || !args.host) {
    console.info('Usage: node login.js --username USERNAME --password PASSWORD --port PORT --host HOST')
    return
}

const PRID = args.pr.split('/').splice(-1)[0]
const TOKEN = args.token


class LighouseReport {
    constructor(argumentz, browser, pullRequest, waiter) {
        this.arguments = argumentz
        this.browser = browser
        this.pullRequest = pullRequest
        this.waiter = waiter
    }

    _writeReport(location, report) {
        fs.writeFile(location, report, (err) => {
            if (err) {
                console.error(err)
            }
        })
    }

    async _generateReport() {
        const report = await lighthouse(this.browser.getPage().url(), this.browser.getOptions(), config).then(r => r)

        await this._writeScores(report)

        this._writeReport(`${__dirname}/artifacts/results.html`, reportGenerator.generateReport(report.lhr, 'html'))
        this._writeReport(`${__dirname}/artifacts/results.json`, reportGenerator.generateReport(report.lhr, 'json'))
    }

    async run() {
        await this.waiter.wait()
        await this.browser.login()
    
        await this._generateReport()

        await this.browser.logout()
        await this.browser.destroy()
    }

    _extractScores(report) {
        const scores = {}
        Object.values(report.lhr.categories).forEach(c => {
            if (c.score === null) {
                throw new Error('Scores are null')
            }
            
            scores[c.id.toUpperCase()] = Math.floor(c.score * 100).toFixed(2)
        })

        return scores
    }

    async _writeScores(report) {
        let scores = null
        try {
            scores = this._extractScores(report)
        } catch (error) {
            console.error(error)
        }
    
        if (scores !== null) {
            try {
                await this.pullRequest.comment(scores)
            } catch (error) {
                console.error('Error adding/updating comment: ', error)
            }
        }
    }
}

(async() => {
    const options = {
        logLevel: 'info',
        output: 'json',
        disableDeviceEmulation: true,
        defaultViewport: {
            width: 1200,
            height: 900
        },
        chromeFlags: ['--disable-mobile-emulation']
    }

    const influx = new Influx(args.host, args.port, {username: args.username, password: args.password})
    report = new LighouseReport(
        args,
        new Browser(args, options, influx),
        new PullRequest(PRID, TOKEN, new ScoresFormatter()),
        new APIWaiter(`http://${args.host}:${args.port}/api/v2`)
    )
    report.run()
})()
