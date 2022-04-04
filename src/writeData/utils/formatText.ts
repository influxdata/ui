export const formatConfigurationText = (configurationText: string) => {
  const configurationLines = configurationText.split('\n')
  const isCommented = configurationLines.every(
    line => line[0] === '#' || line === ''
  )

  if (isCommented) {
    return (
      configurationLines
        .map(text => {
          let sliceCounter = 0
          if (text[0] === '#') {
            sliceCounter += 1
          }
          if (text[1] === ' ') {
            sliceCounter += 1
          }
          return text.slice(sliceCounter)
        })
        .join('\n') + '\n'
    )
  }
  return configurationText + '\n'
}

export const formatReadmeText = (readmeText: Array<string>) => {
  // Change all relative links to Github links
  const relativeLinkReplacements = new Map()
  relativeLinkReplacements.set(
    '(https://github.com/influxdata/telegraf/tree/master/plugins/',
    /\(\/plugins\//gi
  )
  relativeLinkReplacements.set(
    '(https://github.com/influxdata/telegraf/tree/master/plugins/parsers/',
    /\(\.\.\/\.\.\/parsers\//gi
  )
  relativeLinkReplacements.set(
    '(https://github.com/influxdata/telegraf/tree/master/docs/',
    /\(\.\.\/\.\.\/\.\.\/docs\//gi
  )

  return readmeText
    .map(line => {
      return [...relativeLinkReplacements.entries()].reduce(
        (modifiedLine, replacementPair) => {
          return modifiedLine.replace(replacementPair[1], replacementPair[0])
        },
        line
      )
    })
    .join()
}
