class ScoresFormatter {
    format(scores) {
        const formatted = []
        formatted.push('Metric | Score | Level')
        formatted.push('------------ | ------------- | ------------- ')

        Object.keys(scores).forEach(category => {
            let icon = ''
            if (scores[category] > 80) {
                icon = ':green_circle:'
            } else if (scores[category] > 60) {
                icon = ':yellow_circle:'
            } else if (scores[category] >= 20) {
                icon = ':red_circle:'
            } else {
                icon = ':hankey:'
            }

            formatted.push(`${category} | ${scores[category]} | ${icon}`)
        })

        return formatted.join("\n")
    }
}

module.exports = {
    ScoresFormatter
}
