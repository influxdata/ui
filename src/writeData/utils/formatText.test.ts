// use require because formatText is a .mjs file
const utils = require('src/writeData/utils/formatText')
const {formatReadmeText} = utils

describe('formatReadMeText', () => {
  it('can format README text without links', () => {
    const readmeText = ['this is a README\n']
    expect(formatReadmeText(readmeText)).toEqual(readmeText.join())

    readmeText.push('second line of text.\n')
    expect(formatReadmeText(readmeText)).toEqual(readmeText.join())

    readmeText.push('another line of text.\n')
    expect(formatReadmeText(readmeText)).toEqual(readmeText.join())
  })

  it('can format README text with absolute links', () => {
    const readmeText = ['i love https://www.google.com']
    expect(formatReadmeText(readmeText)).toEqual(readmeText.join())

    readmeText.push('\ni also like https://www.github.com')
    expect(formatReadmeText(readmeText)).toEqual(readmeText.join())

    readmeText.push('\nbut https://www.influxdata.com is my favorite')
    expect(formatReadmeText(readmeText)).toEqual(readmeText.join())
  })

  it('does not affect relative links outside of markdown format', () => {
    const readmeText = ['this is a relative link without markdown ../README.md']
    expect(formatReadmeText(readmeText)).toEqual(readmeText.join())

    readmeText.push('\nrelative link for plugins ../plugins/README.md')
    expect(formatReadmeText(readmeText)).toEqual(readmeText.join())

    readmeText.push('\nrelative link for parsers ../parsers/README.md')
    expect(formatReadmeText(readmeText)).toEqual(readmeText.join())

    readmeText.push('\nrelative link for docs ../docs/README.md')
    expect(formatReadmeText(readmeText)).toEqual(readmeText.join())
  })

  it('does not affect markdown links with the wrong pattern', () => {
    const readmeText = [
      'this is a markdown link for [google](https://www.google.com)',
    ]
    expect(formatReadmeText(readmeText)).toEqual(readmeText.join())

    readmeText.push('\nthis is [a relative markdown link](./README.md)')
    expect(formatReadmeText(readmeText)).toEqual(readmeText.join())

    readmeText.push('\nthis is [a link for plugins](./plugins/my_plugin.md)')
    expect(formatReadmeText(readmeText)).toEqual(readmeText.join())

    readmeText.push(
      '\nthis is [a relative markdown link](../plugins/README.md)'
    )
    expect(formatReadmeText(readmeText)).toEqual(readmeText.join())
  })

  it('updates relative markdown links of the correct pattern for plugins', () => {
    const readmeText = ['this is [a link for plugins](/plugins/my_plugin.md)']
    expect(formatReadmeText(readmeText)).toEqual(
      'this is [a link for plugins](https://github.com/influxdata/telegraf/tree/master/plugins/my_plugin.md)'
    )
  })

  it('updates relative markdown links of the correct pattern for parsers', () => {
    const readmeText = [
      'this is [a link for parsers](../../parsers/my_parser/README.md)',
    ]
    expect(formatReadmeText(readmeText)).toEqual(
      'this is [a link for parsers](https://github.com/influxdata/telegraf/tree/master/plugins/parsers/my_parser/README.md)'
    )
  })

  it('updates relative markdown links of the correct pattern for docs', () => {
    const readmeText = [
      'this is [a link for docs](../../../docs/special_doc.md)',
    ]
    expect(formatReadmeText(readmeText)).toEqual(
      'this is [a link for docs](https://github.com/influxdata/telegraf/tree/master/docs/special_doc.md)'
    )
  })
})
