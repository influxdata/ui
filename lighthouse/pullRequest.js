const fetch = require('node-fetch')


const HERCULES_ID = 17932425

class PullRequest {
    constructor(id, token, formatter) {
        this.id = id
        this.url = `https://api.github.com/repos/influxdata/ui/issues/${id}`
        this.token = token
        this.formatter = formatter
    }

    getHeaders() {
        return {
            'Authorization': `token ${this.token}`,
            'content-type': 'application/json'
        }
    }

    async _makeRequest(url, method, scores) {
        return await fetch(url, {
            method,
            headers: this.getHeaders(),
            body: JSON.stringify({body: scores})
        }).then(r => r.json())
    }

    async _addComment(scores) {
        await this._makeRequest(`${this.url}/comments`, 'POST', scores)
    }

    async _updateComment(comment, scores) {
        await this._makeRequest(comment.url, 'PATCH', scores)
    }

    async comment(scores) {
        const url = `${this.url}/comments`
        const comments = await fetch(url, {headers: this.getHeaders()}).then(r => r.json())
        const found = comments.find(c => c.user.id === HERCULES_ID)

        if (!found) {
            return this._addComment(this.formatter.format(scores))
        }

        return this._updateComment(found, this.formatter.format(scores))
    }
}

module.exports = {
    PullRequest
}